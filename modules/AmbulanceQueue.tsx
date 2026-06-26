"use client";
import { useMemo, useState } from "react";
import { ambulanceQueue, AMB_DOCS, AMB_PHOTOS, AMB_PHOTO_GROUPS, AMB_VIDEOS, Ambulance } from "@/data/ambulances";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, Icon, useToast } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Sec, Row, Timeline } from "./shared";
import { StatCard } from "@/components/StatCard";
import { useReviews, nowStamp } from "@/lib/reviewStore";
import { DocVerification, DocStatus } from "@/components/DocVerification";
import type { ModuleProps } from "./registry";

const ST: Record<string, [string, string]> = {
  pending: ["Pending", "pending"], approved: ["Approved", "verified"],
  correction: ["Correction Required", "reupload"], rejected: ["Rejected", "rejected"],
};
const ISSUE_CATEGORIES = ["Equipment missing", "Document issue", "Photo unclear", "Registration mismatch", "Other"];

const DOC_SHORT: Record<string, string> = {
  "Registration Certificate (RC)": "RC",
  "Insurance": "Insurance",
  "PUC (Pollution Certificate)": "PUC",
  "Road Tax Certificate": "Road Tax Certificate",
  "Fitness Certificate": "Fitness Certificate",
};
const missingDocs = (a: Ambulance) => (a.missingDocs || []).map((d) => DOC_SHORT[d] || d);

export function AmbulanceQueue(_: ModuleProps) {
  const notify = useToast();
  const { map, append } = useReviews("medurun-ambulance-reviews");
  const [q, setQ] = useState(""); const [type, setType] = useState("All Types"); const [status, setStatus] = useState("All Status");
  const [sel, setSel] = useState<Ambulance | null>(null);
  const [docMap, setDocMap] = useState<Record<string, { status: DocStatus; reason?: string }>>({});
  const [photo, setPhoto] = useState<number | null>(null);
  const [video, setVideo] = useState<number | null>(null);
  const openAmb = (a: Ambulance) => { const o: Record<string, { status: DocStatus; reason?: string }> = {}; AMB_DOCS.forEach((d) => (o[d.name] = { status: "verified" })); setDocMap(o); setSel(a); };
  const verifyDoc = (name: string) => { setDocMap((m) => ({ ...m, [name]: { status: "verified" } })); if (sel) append(sel.reg, {}, { title: "Document verified", sub: name + " · by Arjun Mehta", time: nowStamp() }); };
  const correctDoc = (name: string, r: string, n: string) => { setDocMap((m) => ({ ...m, [name]: { status: "reupload", reason: r + (n ? " — " + n : "") } })); if (sel) append(sel.reg, {}, { title: "Document correction requested", sub: name + ": " + r + " · by Arjun Mehta", time: nowStamp() }); };
  const [modal, setModal] = useState<null | "correction" | "reject">(null);
  const [category, setCategory] = useState(""); const [reason, setReason] = useState("");

  const effStatus = (a: Ambulance) => map[a.reg]?.status || "pending";
  const rec = sel ? map[sel.reg] : undefined;

  const filtered = useMemo(() => ambulanceQueue.filter((a) =>
    (!q || a.reg.toLowerCase().includes(q.toLowerCase())) && (type === "All Types" || a.type === type)
    && (status === "All Status" || ST[effStatus(a)][0] === status)
  ), [q, type, status, map]);

  const approve = () => { if (!sel) return; append(sel.reg, { status: "approved", reason: undefined }, { title: "Ambulance approved", sub: "By Arjun Mehta · Super Admin", time: nowStamp() }); notify(`${sel.reg} approved`); };
  const submitCorrection = () => {
    if (!sel || !category || !reason.trim()) { notify("Select category and enter a reason", "warning"); return; }
    append(sel.reg, { status: "correction", category, reason, by: "Arjun Mehta", date: nowStamp() }, { title: "Correction requested", sub: category + ": " + reason + " · by Arjun Mehta", time: nowStamp() });
    setModal(null); setCategory(""); setReason(""); notify("Correction requested for " + sel.reg, "warning");
  };
  const submitReject = () => {
    if (!sel || !reason.trim()) { notify("Enter a rejection reason", "warning"); return; }
    append(sel.reg, { status: "rejected", reason, by: "Arjun Mehta", date: nowStamp() }, { title: "Ambulance rejected", sub: reason + " · by Arjun Mehta", time: nowStamp() });
    setModal(null); setReason(""); notify(sel.reg + " rejected", "danger");
  };

  return (
    <div>
      <PageHeader title="Ambulance Data" sub="Review and verify ambulance registrations" />
      <Summary>
        <StatCard icon="Clock" value={ambulanceQueue.filter((a) => effStatus(a) === "pending").length} label="Pending Verification" />
        <StatCard icon="TriangleAlert" value={ambulanceQueue.filter((a) => effStatus(a) === "correction").length} label="Correction Required" />
        <StatCard icon="CircleCheck" value={ambulanceQueue.filter((a) => effStatus(a) === "approved").length} label="Approved" />
        <StatCard icon="CircleX" value={ambulanceQueue.filter((a) => effStatus(a) === "rejected").length} label="Rejected" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search registration..." />
          <Select value={status} onChange={setStatus} options={["All Status", "Pending", "Approved", "Correction Required", "Rejected"]} />
          <Select value={type} onChange={setType} options={["All Types", "BLS", "ALS", "ICU", "Neonatal"]} />
        </FilterRow>
        <DataTable<Ambulance>
          rows={filtered} getKey={(a) => a.reg} onRowClick={openAmb}
          columns={[
            { key: "reg", label: "Registration", render: (a) => <b className="mono">{a.reg}</b> },
            { key: "type", label: "Type" },
            { key: "agency", label: "Agency" },
            { key: "city", label: "City" },
            { key: "year", label: "Year", className: "text-muted" },
            { key: "docs", label: "Documents", render: (a) => { const m = missingDocs(a); return m.length === 0 ? <span style={{ color: "#475569", fontWeight: 500 }}>✓ Complete</span> : <span style={{ color: "#B45309", fontWeight: 500 }}>⚠ {m.length === 1 ? "Missing " + m[0] : "Missing Documents"}</span>; } },
            { key: "status", label: "Verification Status", render: (a) => <StatusBadge status={ST[effStatus(a)][1]} label={ST[effStatus(a)][0]} /> },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">Review →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Ambulance Review" footer={sel && <>
        <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={approve}>Approve Ambulance</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setCategory(""); setReason(""); setModal("correction"); }}>Need Correction</button>
          <button className="btn btn-danger-soft btn-sm" style={{ flex: 1 }} onClick={() => { setReason(""); setModal("reject"); }}>Reject</button>
        </div>
      </>}>
        {sel && <>
          <DrawerHead avatar={<Icon name="Ambulance" size={18} />} title={sel.reg} sub={`${sel.agency} · ${sel.type}`} right={<StatusBadge status={ST[effStatus(sel)][1]} label={ST[effStatus(sel)][0]} />} />
          <div style={{ padding: "10px 22px 18px" }}>
            {rec?.status === "approved" && <div className="banner green" style={{ marginBottom: 4 }}><div className="banner-ic"><Icon name="CircleCheck" size={16} /></div><div><div className="banner-title">Ambulance Approved</div><div className="banner-msg">Added to active operational fleet.</div></div></div>}
            {rec?.status === "correction" && <><Sec>Correction Required</Sec><Row k="Issue Category"><span style={{ color: "#7C3AED" }}>{rec.category}</span></Row><Row k="Correction Reason">{rec.reason}</Row><Row k="Requested By">{rec.by}</Row><Row k="Requested Date">{rec.date}</Row></>}
            {rec?.status === "rejected" && <><Sec>Rejection</Sec><Row k="Rejection Reason"><span style={{ color: "#DC2626" }}>{rec.reason}</span></Row><Row k="Rejected By">{rec.by}</Row><Row k="Rejected Date">{rec.date}</Row></>}

            <Sec>Ambulance Details</Sec>
            <ProfGrid items={[["Registration", sel.reg], ["Type", sel.type], ["Agency", sel.agency], ["City", sel.city], ["Year", sel.year]]} />
            <Sec>Equipment Checklist</Sec>
            {([["Oxygen", sel.equip.oxygen], ["AED", sel.equip.aed], ["Stretcher", sel.equip.stretcher], ["Monitor", sel.equip.monitor]] as [string, boolean][]).map(([l, ok]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0" }}>
                <Icon name={ok ? "Check" : "X"} size={15} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{l}</span>
                <span style={{ fontSize: 12.5, color: ok ? "var(--success)" : "var(--danger)" }}>{ok ? "Present" : "Missing"}</span>
              </div>
            ))}
            <Sec>Documents</Sec>
            <DocVerification
              docs={AMB_DOCS.map((d) => ({ name: d.name, uploadDate: sel.year, status: docMap[d.name]?.status || "verified", reason: docMap[d.name]?.reason, required: d.required, requiredLabel: d.requiredLabel }))}
              onVerify={verifyDoc}
              onCorrection={correctDoc}
            />
            <Sec>Photo Verification</Sec>
            {AMB_PHOTO_GROUPS.map((g) => (
              <div key={g.section}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", color: "#64748B", margin: "14px 0 6px" }}>{g.section}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {g.items.map((p) => { const k = AMB_PHOTOS.indexOf(p); return <div key={p} onClick={() => setPhoto(k)} style={{ border: "1px solid var(--border)", borderRadius: 10, height: 74, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#94A3B8", fontSize: 11, cursor: "pointer", textAlign: "center", padding: "0 6px" }}><Icon name="Image" size={20} />{p}</div>; })}
                </div>
              </div>
            ))}
            <Sec>Video Verification</Sec>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {AMB_VIDEOS.map((v, k) => <div key={v} onClick={() => setVideo(k)} style={{ border: "1px solid var(--border)", borderRadius: 10, height: 74, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#94A3B8", fontSize: 11, cursor: "pointer", textAlign: "center", padding: "0 6px" }}><Icon name="Video" size={20} />{v}</div>)}
            </div>
            <Sec>Activity Timeline</Sec>
            <Timeline items={[
              ...((rec?.activity || []).map((a) => ({ title: a.title, sub: a.time + " · " + a.sub, active: true }))),
              { title: "Submitted by " + sel.agency, sub: "In verification queue", done: true },
            ]} />
          </div>
        </>}
      </SideDrawer>

      {/* CORRECTION */}
      <Modal open={modal === "correction"} onClose={() => setModal(null)} title="Request Correction" sub={sel?.reg}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={submitCorrection}>Submit</button></>}>
        <div className="form-group"><label className="label">Issue Category *</label><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select category</option>{ISSUE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="form-group"><label className="label">Correction Reason *</label><textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe what needs to be corrected..." /></div>
      </Modal>
      {/* REJECT */}
      <Modal open={modal === "reject"} onClose={() => setModal(null)} title="Reject Ambulance" sub={sel?.reg}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger-soft btn-sm" onClick={submitReject}>Reject Ambulance</button></>}>
        <div className="form-group"><label className="label">Rejection Reason *</label><textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this ambulance is rejected..." /></div>
      </Modal>

      {/* PHOTO PREVIEW */}
      <Modal open={photo !== null} onClose={() => setPhoto(null)} title={photo !== null ? AMB_PHOTOS[photo] : ""} sub={sel ? `${sel.reg} · photo ${(photo ?? 0) + 1} of ${AMB_PHOTOS.length}` : ""}
        footer={<>
          <button className="btn btn-outline btn-sm" onClick={() => setPhoto((p) => ((p ?? 0) - 1 + AMB_PHOTOS.length) % AMB_PHOTOS.length)}><Icon name="ChevronLeft" size={14} /> Previous</button>
          <button className="btn btn-outline btn-sm" onClick={() => setPhoto((p) => ((p ?? 0) + 1) % AMB_PHOTOS.length)}>Next <Icon name="ChevronRight" size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => notify("Photo downloaded")}><Icon name="Download" size={14} /> Download</button>
        </>}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "#FAFBFC", height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8" }}>
          <Icon name="Image" size={48} /><div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{photo !== null ? AMB_PHOTOS[photo] : ""}</div>
        </div>
      </Modal>

      {/* VIDEO PREVIEW */}
      <Modal open={video !== null} onClose={() => setVideo(null)} title={video !== null ? AMB_VIDEOS[video] : ""} sub={sel ? `${sel.reg} · video ${(video ?? 0) + 1} of ${AMB_VIDEOS.length}` : ""}
        footer={<>
          <button className="btn btn-outline btn-sm" onClick={() => setVideo((p) => ((p ?? 0) - 1 + AMB_VIDEOS.length) % AMB_VIDEOS.length)}><Icon name="ChevronLeft" size={14} /> Previous</button>
          <button className="btn btn-outline btn-sm" onClick={() => setVideo((p) => ((p ?? 0) + 1) % AMB_VIDEOS.length)}>Next <Icon name="ChevronRight" size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => notify("Video downloaded")}><Icon name="Download" size={14} /> Download</button>
        </>}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "#FAFBFC", height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8" }}>
          <Icon name="Video" size={48} /><div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{video !== null ? AMB_VIDEOS[video] : ""}</div>
        </div>
      </Modal>
    </div>
  );
}
