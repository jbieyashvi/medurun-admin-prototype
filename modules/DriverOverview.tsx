"use client";
import { useMemo, useState } from "react";
import { drivers as SEED, DRIVER_DOCS, Driver } from "@/data/drivers";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, Metrics, ProfGrid, Sec, Row, Tabs, Timeline } from "./shared";
import { StatCard } from "@/components/StatCard";
import { initials } from "@/lib/format";
import { nowStamp } from "@/lib/reviewStore";
import type { ModuleProps } from "./registry";

const OFFBOARD_REASONS = ["Resigned", "Contract Ended", "Compliance Issue", "License Expired", "Poor Performance", "Driver Requested Removal", "Other"];
const ST_LABEL: Record<string, [string, string]> = {
  active: ["Active", "active"], inactive: ["Inactive", "inactive"],
  blocked: ["Blocked", "blocked"], offboarded: ["Offboarded", "offboarded"],
};

export function DriverOverview(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<Driver[]>(SEED);
  const [q, setQ] = useState(""); const [status, setStatus] = useState("All Status"); const [city, setCity] = useState("All Cities");
  const [selName, setSelName] = useState<string | null>(null); const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState<null | "offboard" | "edit" | "rides">(null);
  const [reason, setReason] = useState(""); const [note, setNote] = useState("");
  const [ef, setEf] = useState({ name: "", phone: "", agency: "", city: "", license: "" });

  const sel = rows.find((d) => d.name === selName) || null;
  const filtered = useMemo(() => rows.filter((d) =>
    (!q || d.name.toLowerCase().includes(q.toLowerCase())) && (status === "All Status" || ST_LABEL[d.status][0] === status) && (city === "All Cities" || d.city === city)
  ), [rows, q, status, city]);

  const open = (d: Driver) => { setSelName(d.name); setTab("overview"); };
  const update = (name: string, patch: Partial<Driver>) => setRows((rs) => rs.map((d) => (d.name === name ? { ...d, ...patch } : d)));

  const confirmOffboard = () => {
    if (!reason) { notify("Select an offboarding reason", "warning"); return; }
    if (sel) update(sel.name, { status: "offboarded", offReason: reason, offNote: note.trim(), offAt: nowStamp() });
    setModal(null); setReason(""); setNote(""); notify("Driver offboarded — " + reason, "warning");
  };
  const saveEdit = () => {
    if (!sel || !ef.name || !ef.phone) { notify("Name and phone required", "warning"); return; }
    update(sel.name, { name: ef.name, phone: ef.phone, agency: ef.agency, city: ef.city, license: ef.license });
    setSelName(ef.name); setModal(null); notify("Driver details updated");
  };

  return (
    <div>
      <PageHeader title="Driver Data" sub={`${rows.length} drivers`} />
      <Summary>
        <StatCard icon="CircleCheck" value={rows.filter((d) => d.status === "active").length} label="Active" />
        <StatCard icon="Clock" value="248" label="Pending" />
        <StatCard icon="Activity" value="847" label="On Ride" />
        <StatCard icon="UserMinus" value={rows.filter((d) => d.status === "offboarded").length} label="Offboarded" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search driver..." />
          <Select value={status} onChange={setStatus} options={["All Status", "Active", "Inactive", "Offboarded"]} />
          <Select value={city} onChange={setCity} options={["All Cities", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Ahmedabad"]} />
        </FilterRow>
        <DataTable<Driver>
          rows={filtered} onRowClick={open}
          columns={[
            { key: "name", label: "Driver", render: (d) => <div><b>{d.name}</b>{d.status === "offboarded" && d.offReason && <div className="text-sm" style={{ color: "#64748B" }}>{d.offReason}</div>}</div> },
            { key: "phone", label: "Phone" },
            { key: "agency", label: "Agency" },
            { key: "city", label: "City" },
            { key: "license", label: "License", className: "text-sm mono" },
            { key: "rides", label: "Rides" },
            { key: "rating", label: "Rating", render: (d) => "★ " + d.rating },
            { key: "status", label: "Status", render: (d) => <StatusBadge status={ST_LABEL[d.status][1]} label={ST_LABEL[d.status][0]} /> },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">View</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSelName(null)} title="Driver Details" footer={sel && <>
        <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => { setEf({ name: sel.name, phone: sel.phone, agency: sel.agency, city: sel.city, license: sel.license }); setModal("edit"); }}>Edit Driver</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal("rides")}>Ride History</button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setTab("documents")}>View Documents</button>
        </div>
        {sel.status === "offboarded"
          ? <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => { update(sel.name, { status: "active", offReason: undefined, offNote: undefined, offAt: undefined }); notify("Driver reactivated"); }}>Reactivate Driver</button>
          : <button className="btn btn-danger-soft btn-sm" style={{ width: "100%" }} onClick={() => { setReason(""); setNote(""); setModal("offboard"); }}>Offboard Driver</button>}
      </>}>
        {sel && <>
          <DrawerHead avatar={initials(sel.name)} title={sel.name} sub={`${sel.agency} · ${sel.city}`} right={<StatusBadge status={ST_LABEL[sel.status][1]} label={ST_LABEL[sel.status][0]} />} />
          <Metrics items={[[sel.rides, "Rides"], ["★" + sel.rating, "Rating"], ["₹" + (sel.rides * 1850).toLocaleString("en-IN"), "Revenue"]]} />
          <Tabs tabs={[["overview", "Overview"], ["documents", "Documents"], ["activity", "Activity"]]} active={tab} onChange={setTab} />
          <div style={{ padding: "2px 22px 18px" }}>
            {tab === "overview" && <>
              {sel.status === "offboarded" && <><Sec>Offboarding</Sec><Row k="Reason"><span style={{ color: "#64748B" }}>{sel.offReason}</span></Row>{sel.offNote && <Row k="Notes">{sel.offNote}</Row>}<Row k="Offboarded">{sel.offAt}</Row></>}
              <Sec>Driver Information</Sec>
              <ProfGrid items={[["Phone", sel.phone], ["License", sel.license], ["Agency", sel.agency], ["City", sel.city]]} />
              <Sec>Performance</Sec>
              <ProfGrid items={[["Total Rides", sel.rides], ["Completed", Math.round(sel.rides * 0.94)], ["Cancelled", sel.rides - Math.round(sel.rides * 0.94)], ["Avg Rating", "★ " + sel.rating]]} />
            </>}
            {tab === "documents" && DRIVER_DOCS.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 9, marginBottom: 7 }}>
                <div className="modal-x" style={{ width: 30, height: 30, border: "1px solid var(--border)", color: "#64748B" }}><Icon name="FileText" size={14} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 1 }}>{d.required ? "Required" : "Optional"} · Verified document</div></div>
                <StatusBadge status="verified" label="Verified" />
                <button className="modal-x" style={{ width: 28, height: 28 }} title="View" onClick={() => notify("Opening " + d.name)}><Icon name="Eye" size={13} /></button>
                <button className="modal-x" style={{ width: 28, height: 28 }} title="Download" onClick={() => notify("Downloading " + d.name)}><Icon name="Download" size={13} /></button>
              </div>
            ))}
            {tab === "activity" && <Timeline items={[
              ...(sel.status === "offboarded" ? [{ title: "Driver offboarded by Arjun Mehta", sub: `${sel.offReason || "—"}${sel.offNote ? " — " + sel.offNote : ""} · ${sel.offAt || "just now"}`, active: true }] : []),
              { title: "Completed ride · " + sel.city, sub: "₹1,840 · 2 hours ago", done: true },
              { title: `${sel.rides} total rides`, sub: "Lifetime", done: true },
              { title: "Driver onboarded", sub: sel.agency, done: true },
            ]} />}
          </div>
        </>}
      </SideDrawer>

      {/* OFFBOARD DRIVER */}
      <Modal open={modal === "offboard"} onClose={() => setModal(null)} title="Offboard Driver" sub="Confirm offboarding"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger-soft btn-sm" onClick={confirmOffboard}>Confirm Offboarding</button></>}>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>You are about to offboard <b>{sel?.name}</b> from the platform. The driver will be removed from active operations. Historical rides remain accessible.</p>
        <div className="form-group"><label className="label">Reason *</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Select reason</option>{OFFBOARD_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="form-group"><label className="label">Additional Notes</label><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add any additional context (optional)..." /></div>
      </Modal>

      {/* EDIT DRIVER */}
      <Modal open={modal === "edit"} onClose={() => setModal(null)} title="Edit Driver" sub="Update driver details"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdit}>Save Changes</button></>}>
        <div className="form-group"><label className="label">Full Name</label><input className="input" value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Phone</label><input className="input" value={ef.phone} onChange={(e) => setEf({ ...ef, phone: e.target.value })} /></div>
          <div className="form-group"><label className="label">Agency</label><input className="input" value={ef.agency} onChange={(e) => setEf({ ...ef, agency: e.target.value })} /></div>
          <div className="form-group"><label className="label">City</label><select className="input" value={ef.city} onChange={(e) => setEf({ ...ef, city: e.target.value })}>{["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Ahmedabad"].map((o) => <option key={o}>{o}</option>)}</select></div>
          <div className="form-group"><label className="label">License</label><input className="input" value={ef.license} onChange={(e) => setEf({ ...ef, license: e.target.value })} /></div>
        </div>
      </Modal>

      {/* RIDE HISTORY */}
      <Modal open={modal === "rides"} onClose={() => setModal(null)} title="Ride History" wide sub={sel ? sel.name + " · ride history" : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <div className="table-wrap"><table>
          <thead><tr><th>Date</th><th>Ride ID</th><th>City</th><th>Fare</th><th>Status</th></tr></thead>
          <tbody>
            {[["20 Jun 2026", 1840, "completed"], ["19 Jun 2026", 2260, "completed"], ["18 Jun 2026", 980, "completed"], ["17 Jun 2026", 0, "cancelled"], ["16 Jun 2026", 2670, "completed"], ["15 Jun 2026", 1290, "completed"]].map((r, k) => (
              <tr key={k}>
                <td className="text-sm text-muted">{r[0]}</td>
                <td className="mono" style={{ fontSize: 12 }}>RID-{(SEED.indexOf(sel) * 131 + k + 1000)}</td>
                <td>{sel.city}</td>
                <td style={{ fontWeight: 600 }}>{(r[1] as number) ? "₹" + (r[1] as number).toLocaleString("en-IN") : "—"}</td>
                <td><StatusBadge status={r[2] === "completed" ? "verified" : "rejected"} label={r[2] === "completed" ? "Completed" : "Cancelled"} /></td>
              </tr>
            ))}
          </tbody>
        </table></div>}
      </Modal>
    </div>
  );
}
