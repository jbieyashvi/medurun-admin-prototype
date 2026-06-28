"use client";
import { useMemo, useState } from "react";
import { driverQueue, DRIVER_DOCS, QueueDriver } from "@/data/drivers";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Sec, Row, Timeline } from "./shared";
import { StatCard } from "@/components/StatCard";
import { initials } from "@/lib/format";
import { useReviews, nowStamp } from "@/lib/reviewStore";
import { DocVerification, DocStatus } from "@/components/DocVerification";
import { AddDriverWizard } from "./AddDriverWizard";
import type { ModuleProps } from "./registry";

const ST: Record<string, [string, string]> = {
  pending: ["Pending", "pending"], review: ["Under Review", "review"],
  verified: ["Verified", "verified"], correction: ["Correction Required", "reupload"], rejected: ["Rejected", "rejected"],
};
const CORRECTION_REASONS = ["Missing document", "Document unclear / unreadable", "Expired document", "Information mismatch", "Other"];

export function DriverVerification(_: ModuleProps) {
  const notify = useToast();
  const { map, append } = useReviews("medurun-driver-reviews");
  const [q, setQ] = useState(""); const [city, setCity] = useState("All Cities"); const [status, setStatus] = useState("All Status");
  const [sel, setSel] = useState<QueueDriver | null>(null);
  const [docMap, setDocMap] = useState<Record<string, { status: DocStatus; reason?: string }>>({});
  const [modal, setModal] = useState<null | "correction" | "reject">(null);
  const [reason, setReason] = useState(""); const [note, setNote] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const effStatus = (d: QueueDriver) => map[d.name]?.status || (d.status === "review" ? "review" : "pending");
  const rec = sel ? map[sel.name] : undefined;

  const filtered = useMemo(() => driverQueue.filter((d) =>
    (!q || d.name.toLowerCase().includes(q.toLowerCase())) && (city === "All Cities" || d.city === city)
    && (status === "All Status" || ST[effStatus(d)][0] === status)
  ), [q, city, status, map]);

  const open = (d: QueueDriver) => {
    const seed = parseInt(d.docs); const o: Record<string, { status: DocStatus; reason?: string }> = {};
    DRIVER_DOCS.forEach((doc, i) => (o[doc.name] = { status: i < seed ? "verified" : "pending" })); setDocMap(o); setSel(d);
  };
  const verified = Object.values(docMap).filter((x) => x.status === "verified").length;
  const verifyDoc = (name: string) => { setDocMap((m) => ({ ...m, [name]: { status: "verified" } })); if (sel) append(sel.name, {}, { title: "Document verified", sub: name + " · by Arjun Mehta", time: nowStamp() }); };
  const correctDoc = (name: string, r: string, n: string) => { setDocMap((m) => ({ ...m, [name]: { status: "reupload", reason: r + (n ? " — " + n : "") } })); if (sel) append(sel.name, { status: "correction" }, { title: "Correction requested", sub: name + ": " + r + " · by Arjun Mehta", time: nowStamp() }); };

  const approve = () => { if (!sel) return; append(sel.name, { status: "verified", reason: undefined }, { title: "Approved — marked Verified", sub: "By Arjun Mehta · Super Admin", time: nowStamp() }); notify(`${sel.name} approved`); };
  const submitCorrection = () => {
    if (!sel || !reason) { notify("Select a correction reason", "warning"); return; }
    append(sel.name, { status: "correction", reason, note, by: "Arjun Mehta", date: nowStamp() }, { title: "Correction requested", sub: reason + (note ? " — " + note : "") + " · by Arjun Mehta", time: nowStamp() });
    setModal(null); setReason(""); setNote(""); notify("Correction requested from " + sel.name, "warning");
  };
  const submitReject = () => {
    if (!sel || !reason) { notify("Enter a rejection reason", "warning"); return; }
    append(sel.name, { status: "rejected", reason, by: "Arjun Mehta", date: nowStamp() }, { title: "Application rejected", sub: reason + " · by Arjun Mehta", time: nowStamp() });
    setModal(null); setReason(""); notify(sel.name + " rejected", "danger");
  };

  return (
    <div>
      <PageHeader title="Driver Verification Queue" sub="Review and verify driver registrations"
        action={<button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add Driver</button>} />
      <Summary>
        <StatCard icon="Clock" value={driverQueue.filter((d) => !["verified", "rejected"].includes(effStatus(d))).length} label="Pending Verification" />
        <StatCard icon="TriangleAlert" value={driverQueue.filter((d) => effStatus(d) === "correction").length} label="Correction Required" />
        <StatCard icon="CircleCheck" value={driverQueue.filter((d) => effStatus(d) === "verified").length} label="Verified" />
        <StatCard icon="CircleX" value={driverQueue.filter((d) => effStatus(d) === "rejected").length} label="Rejected" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search driver..." />
          <Select value={status} onChange={setStatus} options={["All Status", "Pending", "Under Review", "Verified", "Correction Required", "Rejected"]} />
          <Select value={city} onChange={setCity} options={["All Cities", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Ahmedabad"]} />
        </FilterRow>
        <DataTable<QueueDriver>
          rows={filtered} onRowClick={open}
          columns={[
            { key: "name", label: "Driver", render: (d) => <b>{d.name}</b> },
            { key: "phone", label: "Phone", className: "text-sm" },
            { key: "agency", label: "Agency" },
            { key: "city", label: "City" },
            { key: "docs", label: "Documents", render: (d) => `${d.docs.replace("/5", "")}/${DRIVER_DOCS.length}` },
            { key: "status", label: "Status", render: (d) => <StatusBadge status={ST[effStatus(d)][1]} label={ST[effStatus(d)][0]} /> },
            { key: "submitted", label: "Submitted", className: "text-sm text-muted" },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">Review →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Driver Verification" footer={sel && <>
        <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={approve}>Approve</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setReason(""); setNote(""); setModal("correction"); }}>Need Correction</button>
          <button className="btn btn-danger-soft btn-sm" style={{ flex: 1 }} onClick={() => { setReason(""); setModal("reject"); }}>Reject</button>
        </div>
      </>}>
        {sel && <>
          <DrawerHead avatar={initials(sel.name)} title={sel.name} sub={`${sel.agency} · Submitted ${sel.submitted}`} right={<StatusBadge status={ST[effStatus(sel)][1]} label={ST[effStatus(sel)][0]} />} />
          <div style={{ padding: "10px 22px 18px" }}>
            {rec?.status === "verified" && <div className="banner green" style={{ marginBottom: 4 }}><div className="banner-ic"><Icon name="CircleCheck" size={16} /></div><div><div className="banner-title">Driver Verified</div><div className="banner-msg">All checks passed — approved for operations.</div></div></div>}
            {rec?.status === "correction" && <><Sec>Correction Required</Sec><Row k="Correction Reason"><span style={{ color: "#7C3AED" }}>{rec.reason}</span></Row>{rec.note && <Row k="Notes">{rec.note}</Row>}<Row k="Requested By">{rec.by}</Row><Row k="Requested Date">{rec.date}</Row></>}
            {rec?.status === "rejected" && <><Sec>Rejection</Sec><Row k="Rejection Reason"><span style={{ color: "#DC2626" }}>{rec.reason}</span></Row><Row k="Rejected By">{rec.by}</Row><Row k="Rejected Date">{rec.date}</Row></>}

            <Sec>Driver Information</Sec>
            <ProfGrid items={[["Name", sel.name], ["Phone", sel.phone], ["Agency", sel.agency], ["City", sel.city]]} />
            <Sec>Document Review · {verified}/{DRIVER_DOCS.length} verified</Sec>
            <DocVerification
              docs={DRIVER_DOCS.map((d) => ({ name: d.name, uploadDate: sel.submitted, status: docMap[d.name]?.status || "pending", reason: docMap[d.name]?.reason, required: d.required }))}
              onVerify={verifyDoc}
              onCorrection={correctDoc}
            />
            <Sec>Activity Timeline</Sec>
            <Timeline items={[
              ...((rec?.activity || []).map((a) => ({ title: a.title, sub: a.time + " · " + a.sub, active: true }))),
              { title: "Documents reviewed by agency", sub: sel.submitted, done: true },
              { title: "Submitted by " + sel.agency, sub: sel.submitted, done: true },
            ]} />
          </div>
        </>}
      </SideDrawer>

      <Modal open={modal === "correction"} onClose={() => setModal(null)} title="Request Correction" sub={sel?.name}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={submitCorrection}>Submit</button></>}>
        <div className="form-group"><label className="label">Correction Reason *</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Select reason</option>{CORRECTION_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="form-group"><label className="label">Notes</label><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add details for the driver / agency (optional)..." /></div>
      </Modal>
      <Modal open={modal === "reject"} onClose={() => setModal(null)} title="Reject Application" sub={sel?.name}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger-soft btn-sm" onClick={submitReject}>Reject Driver</button></>}>
        <div className="form-group"><label className="label">Rejection Reason *</label><textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this application is rejected..." /></div>
      </Modal>

      <AddDriverWizard open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
