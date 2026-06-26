"use client";
import { useMemo, useState } from "react";
import { agencies as SEED, Agency, AGENCY_DOC_GROUPS } from "@/data/agencies";
import { drivers as ALL_DRIVERS } from "@/data/drivers";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { PageHeader, DrawerHead, Metrics, Sec, Tabs, Timeline, Row } from "./shared";
import { initials, fmtINR, parseAmt } from "@/lib/format";
import type { ModuleProps } from "./registry";

const OFFBOARD_REASONS = ["Contract ended", "Compliance issue", "Poor service quality", "Payment dispute", "Agency requested removal", "Other"];

export function AgencyManagement(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<Agency[]>(SEED);
  const [q, setQ] = useState(""); const [city, setCity] = useState("All Cities"); const [status, setStatus] = useState("All Status");
  const [sel, setSel] = useState<Agency | null>(null); const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState<null | "add" | "edit" | "invoices" | "rides" | "suspend" | "remove" | "doc">(null);
  const [docName, setDocName] = useState("");
  // edit/add form
  const [f, setF] = useState({ name: "", contact: "", phone: "", email: "", city: "Mumbai", type: "Private", reg: "", gst: "", bls: 0, als: 0, icu: 0, neo: 0, bankName: "", accHolder: "", accNo: "", ifsc: "" });
  const [removeText, setRemoveText] = useState("");
  const [suspendReason, setSuspendReason] = useState(""); const [suspendNote, setSuspendNote] = useState("");
  const [docFiles, setDocFiles] = useState<Record<string, string>>({});

  const pickDocFile = (key: string) => {
    if (typeof window === "undefined") return;
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/pdf,image/*";
    inp.onchange = () => { const f = inp.files?.[0]; if (f) setDocFiles((p) => ({ ...p, [key]: f.name })); };
    inp.click();
  };
  const removeDocFile = (key: string) => setDocFiles((p) => { const c = { ...p }; delete c[key]; return c; });

  const filtered = useMemo(() => rows.filter((a) =>
    (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.city.toLowerCase().includes(q.toLowerCase())) &&
    (city === "All Cities" || a.city === city) && (status === "All Status" || a.status === status.toLowerCase())
  ), [rows, q, city, status]);

  const openDrawer = (a: Agency) => { setSel(a); setTab("overview"); };
  const ambTypes = sel ? [["BLS", Math.round(sel.ambulances * 0.4)], ["ALS", Math.round(sel.ambulances * 0.3)], ["ICU", Math.round(sel.ambulances * 0.18)], ["Neonatal", Math.round(sel.ambulances * 0.12)]] as [string, number][] : [];
  const sampleDrivers = sel ? ALL_DRIVERS.slice(0, Math.min(4, Math.max(1, Math.round(sel.drivers / 18) || 3))) : [];

  const openAdd = () => { setF({ name: "", contact: "", phone: "", email: "", city: "Mumbai", type: "Private", reg: "", gst: "", bls: 0, als: 0, icu: 0, neo: 0, bankName: "", accHolder: "", accNo: "", ifsc: "" }); setDocFiles({}); setModal("add"); };
  const fleetTotal = f.bls + f.als + f.icu + f.neo;
  const createAgency = () => {
    if (!f.name || !f.contact || !f.phone || !f.email) { notify("Fill all required fields", "warning"); return; }
    setRows([{ id: Math.max(...rows.map((r) => r.id)) + 1, name: f.name, city: f.city, status: "pending", ambulances: fleetTotal, drivers: 0, revenue: "—", rating: "—", contact: f.contact, phone: f.phone, email: f.email, established: "2026", type: f.type }, ...rows]);
    setModal(null); notify(`"${f.name}" submitted — sent to Onboarding Review Queue`);
  };
  const openEdit = () => { if (sel) { setF({ name: sel.name, contact: sel.contact, phone: sel.phone, email: sel.email, city: sel.city, type: sel.type || "Private", reg: "", gst: "", bls: 0, als: 0, icu: 0, neo: 0, bankName: "", accHolder: "", accNo: "", ifsc: "" }); setDocFiles({}); setModal("edit"); } };
  const saveEdit = () => { if (!sel) return; const u = { ...sel, name: f.name, contact: f.contact, phone: f.phone, email: f.email, city: f.city, type: f.type }; setRows(rows.map((r) => r.id === sel.id ? u : r)); setSel(u); setModal(null); notify("Agency details updated"); };
  const confirmOffboard = () => {
    if (!suspendReason) { notify("Select an offboarding reason", "warning"); return; }
    if (sel) {
      const u = { ...sel, status: "offboarded" as const, offReason: suspendReason, offNote: suspendNote.trim(), offAt: "22 Jun 2026 · 03:10 PM" };
      setRows(rows.map((r) => r.id === sel.id ? u : r)); setSel(u);
    }
    setModal(null); notify("Agency offboarded — " + suspendReason, "warning");
  };

  return (
    <div>
      <PageHeader title="Agency Management" sub={`${rows.length} agencies across all cities`}
        action={<button className="btn btn-primary" onClick={openAdd}>+ Add Agency</button>} />

      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search agency..." />
          <Select value={city} onChange={setCity} options={["All Cities", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata"]} />
          <Select value={status} onChange={setStatus} options={["All Status", "Active", "Pending", "Inactive", "Offboarded", "Rejected"]} />
          <button className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }} onClick={() => notify("Exporting agencies to CSV")}><Icon name="Download" size={14} /> Export CSV</button>
        </FilterRow>
        <DataTable<Agency>
          rows={filtered} getKey={(a) => a.id} onRowClick={openDrawer}
          columns={[
            { key: "name", label: "Agency", render: (a) => <div><div style={{ fontWeight: 600 }}>{a.name}</div><div className="text-sm text-muted">{a.contact}</div></div> },
            { key: "city", label: "City" },
            { key: "status", label: "Status", render: (a) => <StatusBadge status={a.status} /> },
            { key: "ambulances", label: "Ambulances", render: (a) => a.ambulances || "—" },
            { key: "drivers", label: "Drivers", render: (a) => a.drivers || "—" },
            { key: "revenue", label: "Revenue", render: (a) => <b>{a.revenue}</b> },
            { key: "rating", label: "Rating", render: (a) => (a.rating === "—" ? "—" : "★ " + a.rating) },
            { key: "x", label: "", render: (a) => <button className="btn btn-outline btn-xs" onClick={(e) => { e.stopPropagation(); openDrawer(a); }}>View →</button> },
          ]}
        />
      </div>

      {/* AGENCY DETAILS DRAWER */}
      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Agency Details"
        headerAction={<button className="btn btn-primary btn-sm" onClick={openEdit}><Icon name="Pencil" size={13} /> Edit Agency</button>}
        footer={sel && <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: -2 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            {([["FileText", "View Invoices", () => setModal("invoices")], ["Route", "View Rides", () => setModal("rides")]] as [string, string, () => void][]).map(([ic, label, on]) => (
              <button key={label} onClick={on} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 9, background: "#fff", cursor: "pointer", textAlign: "left", font: "inherit" }}>
                <div className="modal-x" style={{ width: 30, height: 30, background: "var(--primary-light)", border: "none", color: "var(--primary)" }}><Icon name={ic} size={14} /></div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</span>
                <Icon name="ChevronRight" size={16} className="text-muted" />
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 9, display: "flex", alignItems: "center", gap: 8 }}>
            {sel.status === "offboarded"
              ? <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { const u = { ...sel, status: "active" as const, offReason: undefined, offNote: undefined, offAt: undefined }; setRows(rows.map((r) => r.id === sel.id ? u : r)); setSel(u); notify("Agency reactivated"); }}>Reactivate</button>
              : <button className="btn btn-ghost danger btn-sm" style={{ flex: 1 }} onClick={() => { setSuspendReason(""); setSuspendNote(""); setModal("suspend"); }}>Offboard Agency</button>}
            <button className="btn btn-ghost danger btn-sm" style={{ flex: 1 }} onClick={() => { setRemoveText(""); setModal("remove"); }}>Remove Agency</button>
          </div>
        </>}>
        {sel && <>
          <DrawerHead avatar={initials(sel.name)} title={sel.name} sub={`${sel.city} · Est. ${sel.established}`} right={<StatusBadge status={sel.status} />} />
          <Metrics items={[[sel.ambulances, "Ambulances"], [sel.drivers, "Drivers"], [sel.revenue, "Revenue"], [sel.rating === "—" ? "—" : "★" + sel.rating, "Rating"]]} />
          <Tabs tabs={[["overview", "Overview"], ["documents", "Documents"], ["drivers", "Drivers"], ["ambulances", "Ambulances"], ["activity", "Activity"]]} active={tab} onChange={setTab} />
          <div style={{ padding: "2px 22px 18px" }}>
            {tab === "overview" && <>
              <Sec>Contact</Sec>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "15px 16px" }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{sel.contact}</div>
                <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 1 }}>Primary Contact · {sel.type} Agency</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, marginTop: 11 }}><Icon name="Phone" size={15} className="text-muted" /> {sel.phone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, marginTop: 4 }}><Icon name="Mail" size={15} className="text-muted" /> {sel.email}</div>
              </div>
              <Sec>Verification</Sec>
              <Row k="Documents">{sel.status === "active" ? "5/5 verified" : "3/5 verified"}</Row>
              <Row k="KYC Status"><StatusBadge status={sel.status === "active" ? "verified" : "pending"} label={sel.status === "active" ? "Verified" : "Pending"} /></Row>
            </>}
            {tab === "documents" && (() => {
              let idx = -1;
              return AGENCY_DOC_GROUPS.map((g) => (
                <div key={g.section}>
                  <Sec>{g.section}</Sec>
                  {g.docs.map((d) => {
                    idx++;
                    const ok = sel.status === "active" || idx < 3;
                    return <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 9, marginBottom: 7 }}>
                      <div className="modal-x" style={{ width: 34, height: 34, background: "var(--primary-light)", border: "none", color: "var(--primary)" }}><Icon name="FileText" size={15} /></div>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                        <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", padding: "2px 7px", borderRadius: 20, background: d.required ? "#FEF2F2" : "#F1F5F9", color: d.required ? "#DC2626" : "#64748B" }}>{d.required ? "Required" : "Optional"}</span>
                      </div>
                      <StatusBadge status={ok ? "verified" : "pending"} label={ok ? "verified" : "awaiting"} />
                      {ok ? <>
                        <button className="modal-x" style={{ width: 28, height: 28 }} title="View" onClick={() => { setDocName(d.name); setModal("doc"); }}><Icon name="Eye" size={13} /></button>
                        <button className="modal-x" style={{ width: 28, height: 28 }} title="Download" onClick={() => notify("Downloading " + d.name)}><Icon name="Download" size={13} /></button>
                      </> : <button className="modal-x" style={{ width: 28, height: 28 }} title="Request" onClick={() => notify("Requested " + d.name, "warning")}><Icon name="RotateCw" size={13} /></button>}
                    </div>;
                  })}
                </div>
              ));
            })()}
            {tab === "drivers" && <>
              {sampleDrivers.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <div className="h-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(d.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div><div className="text-sm text-muted">{d.rides} rides · {d.phone}</div></div>
                  <span style={{ fontSize: 12.5 }}>★ {d.rating}</span>
                </div>
              ))}
              <div className="text-sm text-muted" style={{ textAlign: "center", paddingTop: 12 }}>Showing {sampleDrivers.length} of {sel.drivers} drivers</div>
            </>}
            {tab === "ambulances" && <>
              {ambTypes.filter((t) => t[1] > 0).map(([t, n]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <div className="modal-x" style={{ width: 34, height: 34, background: "var(--primary-light)", border: "none", color: "var(--primary)" }}><Icon name="Ambulance" size={15} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{t} Units</div><div className="text-sm text-muted">{t === "ICU" ? "Critical care equipped" : t === "BLS" ? "Basic life support" : t === "ALS" ? "Advanced life support" : "Specialized"}</div></div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{n}</span>
                </div>
              ))}
              <div className="text-sm text-muted" style={{ textAlign: "center", paddingTop: 12 }}>{sel.ambulances} ambulances total</div>
            </>}
            {tab === "activity" && <Timeline items={[
              ...(sel.status === "offboarded" ? [{ title: "Agency offboarded by Arjun Mehta", sub: `${sel.offReason || "—"}${sel.offNote ? " — " + sel.offNote : ""} · ${sel.offAt || "just now"}`, active: true }] : []),
              { title: `Payout ${sel.revenue !== "—" ? sel.revenue : "pending"} settled`, sub: "2 days ago", done: true },
              { title: `${sel.ambulances} ambulances active`, sub: "5 days ago", done: true },
              { title: `${sel.drivers} drivers onboarded`, sub: "1 week ago", done: true },
              { title: "Agency registered", sub: "Est. " + sel.established, done: true },
            ]} />}
          </div>
        </>}
      </SideDrawer>

      {/* ADD / EDIT AGENCY */}
      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "edit" ? "Edit Agency" : "Add New Agency"} sub={modal === "edit" ? "Update agency administration details" : "Onboard a new ambulance agency to the platform"}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={modal === "edit" ? saveEdit : createAgency}>{modal === "edit" ? "Save Changes" : "Create Agency"}</button></>}>
        <div className="dsec" style={{ marginTop: 0 }}>Agency Information</div>
        <div className="form-group"><label className="label">Agency Name *</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. LifeLine Ambulance" /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Agency Type *</label><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option>Private</option><option>Hospital</option><option>Government</option><option>NGO</option></select></div>
          <div className="form-group"><label className="label">City *</label><select className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Lucknow", "Jaipur"].map((o) => <option key={o}>{o}</option>)}</select></div>
        </div>
        {modal === "add" && <div className="grid2">
          <div className="form-group"><label className="label">Registration Number</label><input className="input" value={f.reg} onChange={(e) => setF({ ...f, reg: e.target.value })} placeholder="REG-2026-000000" /></div>
          <div className="form-group"><label className="label">GST Number</label><input className="input" value={f.gst} onChange={(e) => setF({ ...f, gst: e.target.value })} placeholder="27AAACL1234C1Z5" /></div>
        </div>}
        <div className="dsec">Primary Contact</div>
        <div className="form-group"><label className="label">Contact Person *</label><input className="input" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} placeholder="Full name" /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Mobile Number *</label><input className="input" maxLength={10} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="9820000000" /></div>
          <div className="form-group"><label className="label">Official Email ID *</label><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="agency@email.com" /></div>
        </div>
        {modal === "add" && <>
          <div className="dsec">Fleet Information</div>
          <div className="grid2">
            <div className="form-group"><label className="label">BLS Ambulances</label><input className="input" type="number" min={0} value={f.bls} onChange={(e) => setF({ ...f, bls: +e.target.value || 0 })} /></div>
            <div className="form-group"><label className="label">ALS Ambulances</label><input className="input" type="number" min={0} value={f.als} onChange={(e) => setF({ ...f, als: +e.target.value || 0 })} /></div>
            <div className="form-group"><label className="label">ICU Ambulances</label><input className="input" type="number" min={0} value={f.icu} onChange={(e) => setF({ ...f, icu: +e.target.value || 0 })} /></div>
            <div className="form-group"><label className="label">Neonatal Ambulances</label><input className="input" type="number" min={0} value={f.neo} onChange={(e) => setF({ ...f, neo: +e.target.value || 0 })} /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFC", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginTop: 4 }}>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>Total Ambulances</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>Auto-calculated from fleet types</div></div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", letterSpacing: "-.5px" }}>{fleetTotal}</div>
          </div>
          <div className="dsec">Bank / Payout Details</div>
          <div className="grid2">
            <div className="form-group"><label className="label">Bank Name</label><input className="input" value={f.bankName} onChange={(e) => setF({ ...f, bankName: e.target.value })} placeholder="HDFC Bank" /></div>
            <div className="form-group"><label className="label">Account Holder Name</label><input className="input" value={f.accHolder} onChange={(e) => setF({ ...f, accHolder: e.target.value })} placeholder="As per bank records" /></div>
            <div className="form-group"><label className="label">Account Number</label><input className="input" value={f.accNo} onChange={(e) => setF({ ...f, accNo: e.target.value })} placeholder="000000000000" /></div>
            <div className="form-group"><label className="label">IFSC Code</label><input className="input" value={f.ifsc} onChange={(e) => setF({ ...f, ifsc: e.target.value })} placeholder="HDFC0002000" /></div>
          </div>
        </>}
        <div className="dsec">Agency Documents</div>
        {AGENCY_DOC_GROUPS.map((g) => (
          <div key={g.section}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", color: "#64748B", margin: "12px 0 6px" }}>{g.section}</div>
            {g.docs.map((d) => {
              const fname = docFiles[d.name];
              return <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: "1px solid #F4F6F9" }}>
                <span className="modal-x" style={{ width: 32, height: 32, background: "#F1F5F9", border: "none", color: "#475569" }}><Icon name="FileText" size={15} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                    <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", padding: "2px 7px", borderRadius: 20, background: d.required ? "#FEF2F2" : "#F1F5F9", color: d.required ? "#DC2626" : "#64748B" }}>{d.required ? "Required" : "Optional"}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: fname ? "#059669" : "#9CA3AF", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fname || "PDF or JPG · up to 5 MB"}</div>
                </div>
                {fname ? <>
                  <button className="btn btn-outline btn-xs" type="button" onClick={() => pickDocFile(d.name)}>Replace</button>
                  <button className="btn btn-ghost danger btn-xs" type="button" onClick={() => removeDocFile(d.name)}>Remove</button>
                </> : <button className="btn btn-outline btn-xs" type="button" onClick={() => pickDocFile(d.name)}><Icon name="Upload" size={12} /> Upload</button>}
              </div>;
            })}
          </div>
        ))}
      </Modal>

      {/* INVOICES */}
      <Modal open={modal === "invoices"} onClose={() => setModal(null)} title="Invoice History" wide sub={sel ? sel.name + " · invoice history" : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <div className="table-wrap"><table>
          <thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>{["Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026"].map((m, k) => { const base = (parseAmt(sel.revenue) || 120) * 1000; return <tr key={k}><td className="mono" style={{ fontWeight: 600 }}>INV-2026{String(6 - k).padStart(2, "0")}-{(sel.id * 7 + k).toString().padStart(3, "0")}</td><td className="text-sm text-muted">{m}</td><td style={{ fontWeight: 600 }}>{fmtINR(Math.round(base * (0.9 + k * 0.03)))}</td><td><StatusBadge status={k === 3 ? "pending" : "paid"} /></td><td><button className="btn btn-outline btn-xs" onClick={() => notify("Downloading invoice PDF")}>PDF</button></td></tr>; })}</tbody>
        </table></div>}
      </Modal>

      {/* RIDES */}
      <Modal open={modal === "rides"} onClose={() => setModal(null)} title="Ride History" wide sub={sel ? sel.name + " · recent rides" : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <div className="table-wrap"><table>
          <thead><tr><th>Ride ID</th><th>Date</th><th>City</th><th>Type</th><th>Fare</th><th>Status</th></tr></thead>
          <tbody>{["BLS", "ALS", "ICU", "BLS", "Neonatal"].map((t, k) => <tr key={k}><td className="mono" style={{ fontWeight: 600 }}>RD-2606{(sel.id * 5 + k).toString().padStart(3, "0")}</td><td className="text-sm text-muted">{22 - k} Jun 2026</td><td>{sel.city}</td><td>{t}</td><td style={{ fontWeight: 600 }}>{fmtINR(1500 + k * 700)}</td><td><StatusBadge status={k === 1 ? "pending" : "active"} label={k === 1 ? "Ongoing" : "Completed"} /></td></tr>)}</tbody>
        </table></div>}
      </Modal>

      {/* OFFBOARD AGENCY */}
      <Modal open={modal === "suspend"} onClose={() => setModal(null)} title="Offboard Agency" sub="Confirm offboarding"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger-soft btn-sm" onClick={confirmOffboard}>Confirm Offboarding</button></>}>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>You are about to offboard <b>{sel?.name}</b> from the platform. This will stop new ride assignments and remove the agency from active operations.</p>
        <div className="form-group"><label className="label">Offboarding Reason *</label><select className="input" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)}><option value="">Select reason</option>{OFFBOARD_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="form-group"><label className="label">Additional Notes</label><textarea className="input" value={suspendNote} onChange={(e) => setSuspendNote(e.target.value)} placeholder="Add any additional context (optional)..." /></div>
      </Modal>

      {/* REMOVE CONFIRM */}
      <Modal open={modal === "remove"} onClose={() => setModal(null)} title="Remove Agency" sub="Destructive action"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger-soft btn-sm" disabled={removeText.trim().toUpperCase() !== "REMOVE"} onClick={() => { if (sel) setRows(rows.filter((r) => r.id !== sel.id)); setModal(null); setSel(null); notify("Agency removed", "danger"); }}>Remove Agency</button></>}>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, marginBottom: 6 }}>This will remove <b>{sel?.name}</b> from the platform prototype data.</p>
        <p style={{ fontSize: 12.5, color: "#DC2626", lineHeight: 1.5, marginBottom: 16 }}>This action cannot be undone.</p>
        <div className="form-group"><label className="label">Type <b style={{ color: "#DC2626" }}>REMOVE</b> to confirm</label><input className="input" value={removeText} onChange={(e) => setRemoveText(e.target.value)} placeholder="REMOVE" /></div>
      </Modal>

      {/* DOC PREVIEW */}
      <Modal open={modal === "doc"} onClose={() => setModal(null)} title={docName} sub="Preview"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => notify("Opening full screen")}>Full Screen</button><button className="btn btn-primary btn-sm" onClick={() => notify("Downloading " + docName)}>Download</button></>}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "#FAFBFC", height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8" }}>
          <Icon name="FileText" size={40} /><div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{docName.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf</div><div style={{ fontSize: 11.5 }}>PDF · 1 page · 2.4 MB</div>
        </div>
      </Modal>
    </div>
  );
}
