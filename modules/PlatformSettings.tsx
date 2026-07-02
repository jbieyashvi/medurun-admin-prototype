"use client";
import { useState } from "react";
import { Modal, useToast, Icon, StatusBadge, Banner } from "@/components/ui";
import { PageHeader, Tabs } from "./shared";
import type { ModuleProps } from "./registry";

/* ---------- small inputs ---------- */
function Field({ label, value, onChange, prefix, suffix, disabled }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; disabled?: boolean }) {
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 13, top: 0, height: 44, display: "flex", alignItems: "center", color: "#94A3B8", fontSize: 14 }}>{prefix}</span>}
        <input className="input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} style={{ paddingLeft: prefix ? 26 : 14, opacity: disabled ? 0.7 : 1, background: disabled ? "#F8FAFC" : "#fff" }} />
        {suffix && <span style={{ position: "absolute", right: 13, top: 0, height: 44, display: "flex", alignItems: "center", color: "#94A3B8", fontSize: 13 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 38, height: 22, borderRadius: 20, border: "none", cursor: "pointer", background: on ? "var(--primary)" : "#CBD5E1", position: "relative", transition: "background .15s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
    </button>
  );
}

const TABS: [string, string][] = [
  ["pricing", "Pricing"], ["commission", "Commission"], ["city", "City Availability"],
  ["notifications", "Notifications"], ["rules", "System Rules"], ["audit", "Audit Logs"],
];

type Audit = { change: string; by: string; at: string; oldV: string; newV: string };

export function PlatformSettings(_: ModuleProps) {
  const notify = useToast();
  const [tab, setTab] = useState("pricing");
  const stamp = () => new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const [audit, setAudit] = useState<Audit[]>([
    { change: "Per KM Rate", by: "Arjun Mehta", at: "22 Jun 2026, 04:12 PM", oldV: "₹18", newV: "₹20" },
    { change: "Default Commission", by: "Arjun Mehta", at: "20 Jun 2026, 11:30 AM", oldV: "12%", newV: "15%" },
    { change: "City Service · Kolkata", by: "Priya Nair", at: "18 Jun 2026, 09:05 AM", oldV: "Active", newV: "Disabled" },
    { change: "Payout Cycle", by: "Arjun Mehta", at: "15 Jun 2026, 02:40 PM", oldV: "Monthly", newV: "Weekly" },
  ]);
  const logAudit = (change: string, oldV: string, newV: string) => setAudit((a) => [{ change, by: "Arjun Mehta", at: stamp(), oldV, newV }, ...a]);

  return (
    <div>
      <PageHeader title="Platform Settings" sub="Pricing, commission, city availability, notifications, and system rules." />
      <div className="card" style={{ overflow: "hidden" }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div style={{ padding: 22 }}>
          {tab === "pricing" && <Pricing logAudit={logAudit} />}
          {tab === "commission" && <Commission logAudit={logAudit} />}
          {tab === "city" && <CityAvailability logAudit={logAudit} />}
          {tab === "notifications" && <Notifications />}
          {tab === "rules" && <SystemRules logAudit={logAudit} />}
          {tab === "audit" && <AuditLogs rows={audit} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- PRICING ---------- */
function Pricing({ logAudit }: { logAudit: (c: string, o: string, n: string) => void }) {
  const notify = useToast();
  const init = { base: "120", km: "20", wait: "2", night: "150", emrg: "300", acls: "2800", bls: "1500", specialty: "2200" };
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(init);
  const [saved, setSaved] = useState(init);
  const set = (k: keyof typeof v) => (val: string) => setV({ ...v, [k]: val });

  const save = () => {
    (Object.keys(v) as (keyof typeof v)[]).forEach((k) => { if (v[k] !== saved[k]) logAudit(`Pricing · ${k.toUpperCase()}`, `₹${saved[k]}`, `₹${v[k]}`); });
    setSaved(v); setEdit(false); notify("Pricing updated successfully");
  };
  const cancel = () => { setV(saved); setEdit(false); };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div className="section-title">Fare Configuration</div>
        {edit
          ? <div style={{ display: "flex", gap: 8 }}><button className="btn btn-outline btn-sm" onClick={cancel}>Cancel</button><button className="btn btn-primary btn-sm" onClick={save}>Save Changes</button></div>
          : <button className="btn btn-outline btn-sm" onClick={() => setEdit(true)}><Icon name="Pencil" size={14} /> Edit Pricing</button>}
      </div>
      <div className="dsec" style={{ marginTop: 0 }}>Base Fare Rules</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <Field label="Base Fare" prefix="₹" value={v.base} onChange={set("base")} disabled={!edit} />
        <Field label="Per KM Rate" prefix="₹" suffix="/km" value={v.km} onChange={set("km")} disabled={!edit} />
        <Field label="Waiting Charges" prefix="₹" suffix="/min" value={v.wait} onChange={set("wait")} disabled={!edit} />
        <Field label="Night Charges" prefix="₹" value={v.night} onChange={set("night")} disabled={!edit} />
        <Field label="Emergency Charge" prefix="₹" value={v.emrg} onChange={set("emrg")} disabled={!edit} />
      </div>
      <div className="dsec">Service Class Pricing</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <Field label="ACLS" prefix="₹" value={v.acls} onChange={set("acls")} disabled={!edit} />
        <Field label="BLS" prefix="₹" value={v.bls} onChange={set("bls")} disabled={!edit} />
        <Field label="Specialty" prefix="₹" value={v.specialty} onChange={set("specialty")} disabled={!edit} />
      </div>
    </div>
  );
}

/* ---------- COMMISSION ---------- */
type Override = { key: string; val: string };
function Commission({ logAudit }: { logAudit: (c: string, o: string, n: string) => void }) {
  const notify = useToast();
  const [edit, setEdit] = useState(false);
  const [def, setDef] = useState("15");
  const [savedDef, setSavedDef] = useState("15");
  const [cityOv, setCityOv] = useState<Override[]>([{ key: "Mumbai", val: "12" }, { key: "Delhi", val: "14" }, { key: "Bangalore", val: "13" }]);
  const [typeOv, setTypeOv] = useState<Override[]>([{ key: "ALS Bolero", val: "18" }, { key: "Neo Tempo", val: "20" }]);
  const [modal, setModal] = useState<null | "city" | "type">(null);
  const [nk, setNk] = useState(""); const [nv, setNv] = useState("");

  const saveDef = () => { if (def !== savedDef) logAudit("Default Commission", `${savedDef}%`, `${def}%`); setSavedDef(def); setEdit(false); notify("Commission updated"); };
  const addOverride = () => {
    if (!nk || !nv) { notify("Enter name and percentage", "warning"); return; }
    if (modal === "city") setCityOv((o) => [...o, { key: nk, val: nv }]); else setTypeOv((o) => [...o, { key: nk, val: nv }]);
    logAudit(`${modal === "city" ? "City" : "Type"} Commission · ${nk}`, "—", `${nv}%`);
    notify("Override added"); setModal(null); setNk(""); setNv("");
  };

  const OvTable = ({ title, rows, onAdd }: { title: string; rows: Override[]; onAdd: () => void }) => (
    <div style={{ marginTop: 8 }}>
      <div className="section-header" style={{ marginBottom: 8 }}>
        <div className="dsec" style={{ margin: 0 }}>{title}</div>
        <button className="btn btn-outline btn-sm" onClick={onAdd}><Icon name="Plus" size={13} /> Add Override</button>
      </div>
      <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
        <table><thead><tr><th>{title.includes("City") ? "City" : "Ambulance Type"}</th><th>Commission %</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.key}><td style={{ fontWeight: 600 }}>{r.key}</td><td>{r.val}%</td><td style={{ textAlign: "right" }}><button className="btn btn-outline btn-sm" onClick={() => notify(`Editing ${r.key} override`)}>Edit</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div className="section-title">Commission Configuration</div>
        {edit
          ? <div style={{ display: "flex", gap: 8 }}><button className="btn btn-outline btn-sm" onClick={() => { setDef(savedDef); setEdit(false); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveDef}>Save Changes</button></div>
          : <button className="btn btn-outline btn-sm" onClick={() => setEdit(true)}><Icon name="Pencil" size={14} /> Edit Commission</button>}
      </div>
      <div style={{ maxWidth: 320 }}>
        <Field label="Default Platform Commission" suffix="%" value={def} onChange={setDef} disabled={!edit} />
      </div>
      <OvTable title="City-wise Commission Override" rows={cityOv} onAdd={() => setModal("city")} />
      <div style={{ height: 14 }} />
      <OvTable title="Ambulance Type Commission Override" rows={typeOv} onAdd={() => setModal("type")} />

      <Modal open={!!modal} onClose={() => setModal(null)} title={`Add ${modal === "city" ? "City" : "Ambulance Type"} Override`} sub="Set a custom commission rate"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={addOverride}>Add Override</button></>}>
        <div className="form-group"><label className="label">{modal === "city" ? "City" : "Ambulance Type"} *</label><input className="input" value={nk} onChange={(e) => setNk(e.target.value)} placeholder={modal === "city" ? "e.g. Hyderabad" : "e.g. BLS Winger"} /></div>
        <Field label="Commission %" suffix="%" value={nv} onChange={setNv} />
      </Modal>
    </div>
  );
}

/* ---------- CITY AVAILABILITY ---------- */
type City = { name: string; agencies: number; ambulances: number; active: boolean };
function CityAvailability({ logAudit }: { logAudit: (c: string, o: string, n: string) => void }) {
  const notify = useToast();
  const [cities, setCities] = useState<City[]>([
    { name: "Mumbai", agencies: 24, ambulances: 412, active: true },
    { name: "Delhi", agencies: 19, ambulances: 358, active: true },
    { name: "Bangalore", agencies: 16, ambulances: 287, active: true },
    { name: "Hyderabad", agencies: 12, ambulances: 198, active: true },
    { name: "Chennai", agencies: 9, ambulances: 142, active: true },
    { name: "Pune", agencies: 7, ambulances: 96, active: true },
    { name: "Ahmedabad", agencies: 5, ambulances: 64, active: false },
    { name: "Kolkata", agencies: 4, ambulances: 41, active: false },
  ]);
  const [confirm, setConfirm] = useState<City | null>(null);

  const apply = (c: City) => {
    setCities((cs) => cs.map((x) => x.name === c.name ? { ...x, active: !x.active } : x));
    logAudit(`City Service · ${c.name}`, c.active ? "Active" : "Disabled", c.active ? "Disabled" : "Active");
    notify(`${c.name} service ${c.active ? "disabled" : "enabled"}`, c.active ? "warning" : "success");
    setConfirm(null);
  };

  return (
    <div>
      <div className="section-title" style={{ marginBottom: 14 }}>City Availability</div>
      <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
        <table><thead><tr><th>City</th><th>Active Agencies</th><th>Active Ambulances</th><th>Service Status</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
          <tbody>{cities.map((c) => (
            <tr key={c.name}>
              <td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.agencies}</td><td>{c.ambulances}</td>
              <td><StatusBadge status={c.active ? "active" : "inactive"} label={c.active ? "Active" : "Disabled"} /></td>
              <td style={{ textAlign: "right" }}><button className={`btn btn-sm ${c.active ? "btn-outline" : "btn-primary"}`} onClick={() => setConfirm(c)}>{c.active ? "Disable" : "Enable"}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={`${confirm?.active ? "Disable" : "Enable"} ${confirm?.name} Service`} sub="Confirm service availability change"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setConfirm(null)}>Cancel</button><button className={`btn btn-sm ${confirm?.active ? "btn-danger-soft" : "btn-primary"}`} onClick={() => confirm && apply(confirm)}>{confirm?.active ? "Disable Service" : "Enable Service"}</button></>}>
        {confirm && <Banner tone={confirm.active ? "yellow" : "blue"} icon={confirm.active ? "TriangleAlert" : "Info"} title={`${confirm.active ? "Disable" : "Enable"} ${confirm.name}`}
          msg={confirm.active ? `New bookings in ${confirm.name} will be blocked. ${confirm.agencies} agencies and ${confirm.ambulances} ambulances affected.` : `${confirm.name} will accept new bookings immediately.`} />}
      </Modal>
    </div>
  );
}

/* ---------- NOTIFICATIONS ---------- */
type NotifRow = { label: string; email: boolean; sms: boolean; dash: boolean };
function Notifications() {
  const notify = useToast();
  const [rows, setRows] = useState<NotifRow[]>([
    { label: "Document expiry reminders", email: true, sms: true, dash: true },
    { label: "Payout alerts", email: true, sms: false, dash: true },
    { label: "Ticket escalation alerts", email: true, sms: true, dash: true },
    { label: "Booking issue alerts", email: false, sms: true, dash: true },
  ]);
  const toggle = (i: number, ch: "email" | "sms" | "dash") => setRows((rs) => rs.map((r, j) => j === i ? { ...r, [ch]: !r[ch] } : r));

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 14 }}>
        <div className="section-title">Notification Channels</div>
        <button className="btn btn-primary btn-sm" onClick={() => notify("Notification preferences saved")}>Save Changes</button>
      </div>
      <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
        <table><thead><tr><th>Alert Type</th><th style={{ textAlign: "center" }}>Email</th><th style={{ textAlign: "center" }}>SMS</th><th style={{ textAlign: "center" }}>Dashboard</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.label}>
              <td style={{ fontWeight: 600 }}>{r.label}</td>
              {(["email", "sms", "dash"] as const).map((ch) => (
                <td key={ch} style={{ textAlign: "center" }}><div style={{ display: "inline-flex" }}><Toggle on={r[ch]} onClick={() => toggle(i, ch)} /></div></td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- SYSTEM RULES ---------- */
function SystemRules({ logAudit }: { logAudit: (c: string, o: string, n: string) => void }) {
  const notify = useToast();
  const init = { payout: "Weekly", expiry: "30", sla: "24", auto: true };
  const [v, setV] = useState(init);
  const [saved, setSaved] = useState(init);

  const save = () => {
    if (v.payout !== saved.payout) logAudit("Payout Cycle", saved.payout, v.payout);
    if (v.expiry !== saved.expiry) logAudit("Doc Expiry Warning", `${saved.expiry} days`, `${v.expiry} days`);
    if (v.sla !== saved.sla) logAudit("Ticket SLA", `${saved.sla}h`, `${v.sla}h`);
    if (v.auto !== saved.auto) logAudit("Auto Assignment", saved.auto ? "On" : "Off", v.auto ? "On" : "Off");
    setSaved(v); notify("System rules saved");
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div className="section-title">System Rules</div>
        <button className="btn btn-primary btn-sm" onClick={save}>Save Changes</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", maxWidth: 640 }}>
        <div className="form-group"><label className="label">Payout Cycle</label>
          <select className="input" value={v.payout} onChange={(e) => setV({ ...v, payout: e.target.value })}>{["Daily", "Weekly", "Bi-Weekly", "Monthly"].map((o) => <option key={o}>{o}</option>)}</select></div>
        <Field label="Document Expiry Warning" suffix="days" value={v.expiry} onChange={(x) => setV({ ...v, expiry: x })} />
        <Field label="Ticket SLA (Resolution)" suffix="hours" value={v.sla} onChange={(x) => setV({ ...v, sla: x })} />
        <div className="form-group"><label className="label">Auto Assignment Rules</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 44 }}>
            <Toggle on={v.auto} onClick={() => setV({ ...v, auto: !v.auto })} />
            <span style={{ fontSize: 13, color: "#475569" }}>{v.auto ? "Auto-assign nearest available ambulance" : "Manual dispatch only"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- AUDIT LOGS ---------- */
function AuditLogs({ rows }: { rows: Audit[] }) {
  return (
    <div>
      <div className="section-title" style={{ marginBottom: 14 }}>Recent Setting Changes</div>
      <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
        <table><thead><tr><th>Setting Changed</th><th>Changed By</th><th>Date / Time</th><th>Old Value</th><th>New Value</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{r.change}</td><td>{r.by}</td>
              <td style={{ color: "var(--muted)" }}>{r.at}</td>
              <td><span style={{ color: "#DC2626" }}>{r.oldV}</span></td>
              <td><span style={{ color: "#059669", fontWeight: 600 }}>{r.newV}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
