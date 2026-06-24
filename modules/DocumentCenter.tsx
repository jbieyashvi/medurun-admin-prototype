"use client";
import { useEffect, useMemo, useState } from "react";
import { documents as seed, DOC_ST, Doc } from "@/data/documents";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, Icon, useToast } from "@/components/ui";
import { CORRECTION_REASONS } from "@/components/DocVerification";
import { PageHeader, DrawerHead, ProfGrid, Tabs, Timeline, Row, Sec } from "./shared";
import type { ModuleProps } from "./registry";

const KEY = "medurun-documents";
type ModalKind = "preview" | "reupload" | "viewReason" | "revoke" | "exception";

export function DocumentCenter(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<Doc[]>(seed);
  const [q, setQ] = useState(""); const [type, setType] = useState("All Documents");
  const [status, setStatus] = useState("All Status"); const [city, setCity] = useState("All Cities");
  const [sel, setSel] = useState<Doc | null>(null); const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [reason, setReason] = useState(""); const [note, setNote] = useState("");

  // ---- session persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY); if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Doc>[];
      setRows(seed.map((d) => {
        const m = saved.find((s) => s.number === d.number && s.name === d.name);
        return m ? { ...d, status: m.status as Doc["status"] ?? d.status, reason: m.reason, exceptionNote: m.exceptionNote } : d;
      }));
    } catch { /* ignore */ }
  }, []);
  const persist = (next: Doc[]) => {
    setRows(next);
    try { localStorage.setItem(KEY, JSON.stringify(next.map((d) => ({ name: d.name, number: d.number, status: d.status, reason: d.reason, exceptionNote: d.exceptionNote })))); } catch { /* ignore */ }
  };

  const typeMap: Record<string, string> = { "Agency Documents": "Agency", "Driver Documents": "Driver", "Ambulance Documents": "Ambulance" };
  const filtered = useMemo(() => rows.filter((d) =>
    (!q || d.name.toLowerCase().includes(q.toLowerCase()) || d.owner.toLowerCase().includes(q.toLowerCase()))
    && (type === "All Documents" || d.ownerType === typeMap[type])
    && (status === "All Status" || DOC_ST[d.status] === status)
    && (city === "All Cities" || d.city === city)
  ), [rows, q, type, status, city]);

  const counts = {
    expired: rows.filter(d => d.status === "expired").length,
    seven: rows.filter(d => d.status === "expiring" && d.days <= 7).length,
    pending: rows.filter(d => d.status === "pending").length,
    reupload: rows.filter(d => d.status === "reupload").length,
  };

  const update = (d: Doc, patch: Partial<Doc>, msg: string, tone: "success" | "warning" | "danger" = "success") => {
    const u = { ...d, ...patch }; persist(rows.map(x => (x.name === d.name && x.number === d.number) ? u : x)); setSel(u); notify(msg, tone);
  };
  const openReupload = () => { setReason(""); setNote(""); setModal("reupload"); };
  const submitReupload = () => {
    if (!sel) return;
    if (!reason) { notify("Reason for re-upload is required", "warning"); return; }
    update(sel, { status: "reupload", reason: reason + (note ? " — " + note : ""), exceptionNote: undefined }, "Re-upload request sent successfully.");
    setModal(null);
  };
  const submitException = () => {
    if (!sel) return;
    if (!reason) { notify("Exception reason is required", "warning"); return; }
    update(sel, { status: "exception", exceptionNote: reason + (note ? " — " + note : "") }, "Exception approved.");
    setModal(null);
  };

  // Status → footer actions (View Document + Download always first)
  const statusActions = (d: Doc): { label: string; cls: string; on: () => void }[] => {
    switch (d.status) {
      case "pending": return [
        { label: "Mark Verified", cls: "btn-primary", on: () => update(d, { status: "verified", reason: undefined }, "Document marked as verified.") },
        { label: "Request Re-upload", cls: "btn-danger-soft", on: openReupload },
      ];
      case "verified": return [
        { label: "Revoke Verification", cls: "btn-danger-soft", on: () => setModal("revoke") },
        { label: "Request Re-upload", cls: "btn-danger-soft", on: openReupload },
      ];
      case "reupload": return [
        { label: "View Re-upload Reason", cls: "btn-outline", on: () => setModal("viewReason") },
        { label: "Approve New Upload", cls: "btn-primary", on: () => update(d, { status: "verified", reason: undefined }, "New upload approved. Document verified.") },
      ];
      case "expiring": return [
        { label: "Send Reminder", cls: "btn-outline", on: () => notify("Reminder sent successfully.") },
        { label: "Request Updated Copy", cls: "btn-primary", on: openReupload },
      ];
      case "expired": return [
        { label: "Request New Document", cls: "btn-primary", on: openReupload },
        { label: "Mark Exception", cls: "btn-outline", on: () => { setReason(""); setNote(""); setModal("exception"); } },
      ];
      case "exception": return [
        { label: "Request Re-upload", cls: "btn-danger-soft", on: openReupload },
      ];
      default: return [];
    }
  };

  return (
    <div>
      <PageHeader title="Document Center" sub="Track document verification, expiry dates, compliance status, and pending actions." />
      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: 14, padding: "10px 16px", marginBottom: 12 }}>
        {[["Documents", rows.length], ["Pending Verification", counts.pending], ["Expiring in 7 Days", counts.seven], ["Expired", counts.expired], ["Re-upload Requested", counts.reupload]].map(([l, v], i) => (
          <span key={i} style={{ fontSize: 12.5, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 7 }}>
            {l} <b style={{ color: "var(--text)", fontSize: 13.5 }}>{v}</b>{i < 4 && <span style={{ width: 1, height: 16, background: "var(--border)", marginLeft: 7 }} />}
          </span>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search document..." />
          <Select value={type} onChange={setType} options={["All Documents", "Agency Documents", "Driver Documents", "Ambulance Documents"]} />
          <Select value={status} onChange={setStatus} options={["All Status", "Verified", "Pending", "Expired", "Expiring Soon", "Re-upload Requested", "Exception Approved"]} />
          <Select value={city} onChange={setCity} options={["All Cities", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"]} />
        </FilterRow>
        <DataTable<Doc>
          rows={filtered} onRowClick={(d) => { setSel(d); setTab("overview"); }}
          columns={[
            { key: "name", label: "Document", render: (d) => <b>{d.name}</b> },
            { key: "ownerType", label: "Owner Type" },
            { key: "owner", label: "Owner" },
            { key: "number", label: "Document Number", className: "text-sm mono" },
            { key: "expiry", label: "Expiry Date", render: (d) => <span style={d.status === "expired" ? { color: "#DC2626", fontWeight: 600 } : { color: "var(--muted)" }}>{d.expiry}</span> },
            { key: "status", label: "Status", render: (d) => <span className={`badge ${d.status}`}>{DOC_ST[d.status]}</span> },
            { key: "updated", label: "Last Updated", className: "text-sm text-muted" },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">View →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Document Details"
        footer={sel && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-outline btn-sm" style={{ flex: "1 1 calc(50% - 4px)" }} onClick={() => setModal("preview")}>View Document</button>
            <button className="btn btn-outline btn-sm" style={{ flex: "1 1 calc(50% - 4px)" }} onClick={() => notify("Document downloaded successfully.")}>Download</button>
            {statusActions(sel).map((a) => (
              <button key={a.label} className={`btn ${a.cls} btn-sm`} style={{ flex: "1 1 calc(50% - 4px)" }} onClick={a.on}>{a.label}</button>
            ))}
          </div>
        )}>
        {sel && <>
          <DrawerHead avatar="📄" title={sel.name} sub={`${sel.ownerType} · ${sel.owner}`} right={<span className={`badge ${sel.status}`}>{DOC_ST[sel.status]}</span>} />
          <Tabs tabs={[["overview", "Overview"], ["history", "History"]]} active={tab} onChange={setTab} />
          <div style={{ padding: "10px 22px 18px" }}>
            {tab === "overview" && <>
              <Sec>Document</Sec>
              <ProfGrid items={[["Document Name", sel.name], ["Owner", sel.owner], ["Number", sel.number], ["Status", DOC_ST[sel.status]], ["Issue Date", sel.issue], ["Expiry Date", sel.expiry], ["Uploaded By", sel.by], ["Uploaded On", sel.on]]} />
              {sel.reason && <><Sec>Re-upload Reason</Sec><div style={{ border: "1px solid var(--border)", borderRadius: 9, padding: "11px 13px", fontSize: 13, color: "#7C3AED", background: "#F5F3FF" }}>{sel.reason}</div></>}
              {sel.exceptionNote && <><Sec>Exception Reason</Sec><div style={{ border: "1px solid var(--border)", borderRadius: 9, padding: "11px 13px", fontSize: 13, color: "#0E7490", background: "#ECFEFF" }}>{sel.exceptionNote}</div></>}
              <Sec>Association</Sec>
              <Row k="Associated Agency">{sel.agency}</Row><Row k="Associated">{sel.assoc}</Row>
            </>}
            {tab === "history" && <Timeline items={[
              { title: "Document uploaded", sub: `By ${sel.by} · ${sel.on}`, done: true },
              { title: "Verification started", sub: "By Neha Kulkarni", done: true },
              { title: sel.status === "verified" ? "Document verified" : sel.status === "reupload" ? "Re-upload requested" : sel.status === "exception" ? "Exception approved" : sel.status === "expired" ? "Document expired" : sel.status === "expiring" ? "Expiring soon" : "Pending review", sub: "By Rohan Desai", active: true },
            ]} />}
          </div>
        </>}
      </SideDrawer>

      {/* VIEW DOCUMENT PREVIEW */}
      <Modal open={modal === "preview"} onClose={() => setModal(null)} title={sel?.name || "Document"} sub="Document preview"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => notify("Document downloaded successfully.")}>Download</button><button className="btn btn-primary btn-sm" onClick={() => setModal(null)}>Close</button></>}>
        {sel && <>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "#FAFBFC", height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8", marginBottom: 14 }}>
            <Icon name="FileText" size={46} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{sel.name.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf</div>
            <div style={{ fontSize: 11.5 }}>PDF · 1 page · 2.4 MB</div>
          </div>
          <div className="stat-row"><span className="k">Document Number</span><span style={{ fontWeight: 600 }}>{sel.number}</span></div>
          <div className="stat-row"><span className="k">Owner</span><span style={{ fontWeight: 600 }}>{sel.owner}</span></div>
          <div className="stat-row"><span className="k">Status</span><span className={`badge ${sel.status}`}>{DOC_ST[sel.status]}</span></div>
        </>}
      </Modal>

      {/* REQUEST RE-UPLOAD (also Updated Copy / New Document) */}
      <Modal open={modal === "reupload"} onClose={() => setModal(null)} title="Request Re-upload" sub={sel ? sel.name : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={submitReupload}>Send Request</button></>}>
        <div className="form-group"><label className="label">Reason for re-upload *</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Select reason</option>{CORRECTION_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="form-group"><label className="label">Notes</label><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add details for the agency / driver (optional)..." /></div>
      </Modal>

      {/* MARK EXCEPTION */}
      <Modal open={modal === "exception"} onClose={() => setModal(null)} title="Mark Exception" sub={sel ? sel.name : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={submitException}>Approve Exception</button></>}>
        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 14 }}>Approve a compliance exception for this expired document. The document will be marked <b>Exception Approved</b> and the reason recorded.</p>
        <div className="form-group"><label className="label">Exception Reason *</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Select reason</option>{["Renewal in progress", "Government delay", "Temporary waiver granted", "Manual verification done", "Other"].map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="form-group"><label className="label">Notes</label><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add context for the exception (optional)..." /></div>
      </Modal>

      {/* REVOKE VERIFICATION CONFIRM */}
      <Modal open={modal === "revoke"} onClose={() => setModal(null)} title="Revoke Verification" sub={sel ? sel.name : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger-soft btn-sm" onClick={() => { if (sel) update(sel, { status: "pending" }, "Verification revoked. Status set to Pending Review.", "warning"); setModal(null); }}>Revoke Verification</button></>}>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>Are you sure you want to revoke verification for <b>{sel?.name}</b>? The document will return to <b>Pending Review</b> and must be re-verified.</p>
      </Modal>

      {/* VIEW RE-UPLOAD REASON */}
      <Modal open={modal === "viewReason"} onClose={() => setModal(null)} title="Re-upload Reason" sub={sel ? sel.name : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 9, padding: "13px 15px", fontSize: 13.5, color: "#7C3AED", background: "#F5F3FF" }}>{sel?.reason || "No reason recorded."}</div>
      </Modal>
    </div>
  );
}
