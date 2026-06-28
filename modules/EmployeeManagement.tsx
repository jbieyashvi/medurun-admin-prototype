"use client";
import { useMemo, useState } from "react";
import { employees as seed, EMP_MODULES, PERM_TYPES, EMP_ST, accessLevel, seedPerms, Employee } from "@/data/employees";

const HIDDEN_PERM_MODULES = new Set(["onboarding", "drivers-q", "ambulance-q", "gps", "tickets", "settings", "documents"]);
const VISIBLE_EMP_MODULES = EMP_MODULES.filter(([k]) => !HIDDEN_PERM_MODULES.has(k));
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Tabs, Timeline, Sec } from "./shared";
import { StatCard } from "@/components/StatCard";
import { initials } from "@/lib/format";
import type { ModuleProps } from "./registry";

export function EmployeeManagement(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<Employee[]>(seed.map((e) => ({ ...e, perms: seedPerms(e.role) })));
  const [q, setQ] = useState(""); const [role, setRole] = useState("All Roles"); const [status, setStatus] = useState("All Status");
  const [sel, setSel] = useState<number | null>(null); const [tab, setTab] = useState("overview");
  const [permModal, setPermModal] = useState(false); const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [add, setAdd] = useState(false); const [edit, setEdit] = useState(false); const [deact, setDeact] = useState(false); const [success, setSuccess] = useState<null | { id: string; pwd: string }>(null);
  const [eName, setEName] = useState(""); const [eEmail, setEEmail] = useState(""); const [ePhone, setEPhone] = useState(""); const [eDept, setEDept] = useState(""); const [eRole, setERole] = useState("");

  const e = sel === null ? null : rows[sel];
  const filtered = useMemo(() => rows.map((x, i) => ({ x, i })).filter(({ x }) =>
    (!q || x.name.toLowerCase().includes(q.toLowerCase()) || x.empId.toLowerCase().includes(q.toLowerCase()))
    && (role === "All Roles" || x.role === role) && (status === "All Status" || EMP_ST[x.status][0] === status)
  ), [rows, q, role, status]);

  const openPerm = () => { if (e) { setDraft(JSON.parse(JSON.stringify(e.perms))); setPermModal(true); } };
  const toggle = (k: string, p: string) => setDraft((d) => { const a = [...(d[k] || [])]; const i = a.indexOf(p); i < 0 ? a.push(p) : a.splice(i, 1); return { ...d, [k]: a }; });
  const savePerm = () => { if (sel !== null) setRows(rows.map((r, i) => i === sel ? { ...r, perms: draft } : r)); setPermModal(false); notify("Permissions updated"); };

  const summary = e ? (() => {
    let acc = 0, full = 0, view = 0, rest = 0;
    VISIBLE_EMP_MODULES.forEach(([k]) => { const [, c] = accessLevel(e.perms![k]); c === "none" ? rest++ : acc++; if (c === "full") full++; if (c === "view") view++; });
    return [acc, full, view, rest];
  })() : [0, 0, 0, 0];

  return (
    <div>
      <PageHeader title="Employee Management" sub="Manage internal staff, roles, and dashboard access."
        action={<button className="btn btn-primary" onClick={() => setAdd(true)}>+ Add Employee</button>} />
      <Summary>
        <StatCard icon="Users" value={rows.length} label="Total Employees" />
        <StatCard icon="CircleDot" value={rows.filter(r => r.status === "online").length} label="Online Now" />
        <StatCard icon="Shield" value={new Set(rows.map(r => r.role)).size} label="Active Roles" />
        <StatCard icon="Mail" value={rows.filter(r => r.status === "invited").length} label="Pending Invites" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search employee..." />
          <Select value={role} onChange={setRole} options={["All Roles", "Top Management", "HR", "Finance & Accounts", "Customer Support"]} />
          <Select value={status} onChange={setStatus} options={["All Status", "Online", "Offline", "Suspended", "Invited"]} />
        </FilterRow>
        <DataTable
          rows={filtered} onRowClick={({ i }) => { setSel(i); setTab("overview"); }}
          columns={[
            { key: "name", label: "Employee", render: ({ x }: any) => <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="h-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(x.name)}</div><div><div style={{ fontWeight: 600 }}>{x.name}</div><div className="text-sm text-muted">{x.email}</div></div></div> },
            { key: "empId", label: "Employee ID", render: ({ x }: any) => <span className="text-sm mono">{x.empId}</span> },
            { key: "role", label: "Role", render: ({ x }: any) => x.role },
            { key: "dept", label: "Department", render: ({ x }: any) => x.dept },
            { key: "status", label: "Status", render: ({ x }: any) => <StatusBadge status={EMP_ST[x.status][1]} label={EMP_ST[x.status][0]} /> },
            { key: "last", label: "Last Active", render: ({ x }: any) => <span className="text-sm text-muted">{x.last}</span> },
            { key: "by", label: "Created By", render: ({ x }: any) => <span className="text-sm text-muted">{x.by}</span> },
            { key: "v", label: "", render: () => <button className="btn btn-outline btn-xs">View →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!e} onClose={() => setSel(null)} title="Employee Details"
        footer={e && tab === "permissions" ? <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={openPerm}>Edit Permissions</button> : undefined}>
        {e && <>
          <DrawerHead avatar={initials(e.name)} title={e.name} sub={`${e.role} · ${e.dept}`} right={<StatusBadge status={EMP_ST[e.status][1]} label={EMP_ST[e.status][0]} />} />
          <Tabs tabs={[["overview", "Overview"], ["permissions", "Permissions"], ["activity", "Activity"]]} active={tab} onChange={setTab} />
          <div style={{ padding: "10px 22px 18px" }}>
            {tab === "overview" && <>
              <Sec>Employee</Sec>
              <ProfGrid items={[["Employee ID", e.empId], ["Email", e.email], ["Phone", e.phone], ["Department", e.dept], ["Role", e.role], ["Last Login", e.last], ["Created", e.created], ["Created By", e.by]]} />
              <Sec>Account Actions</Sec>
              <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => { setEName(e.name); setEEmail(e.email); setEPhone(e.phone === "—" ? "" : e.phone); setEDept(e.dept); setERole(e.role); setEdit(true); }}>Edit Employee</button>
              <button className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: 8 }} onClick={() => notify("Temporary password sent to " + e.email)}>Reset Password</button>
              <Sec>Danger Zone</Sec>
              {e.status === "suspended"
                ? <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => { setRows(rows.map((r, i) => i === sel ? { ...r, status: "offline" } : r)); notify("Employee reactivated"); }}>Reactivate Employee</button>
                : <button className="btn btn-danger-soft btn-sm" style={{ width: "100%" }} onClick={() => setDeact(true)}>Deactivate Employee</button>}
            </>}
            {tab === "permissions" && <>
              <div className="summary" style={{ marginBottom: 6, gridTemplateColumns: "repeat(4,1fr)" }}>
                {[["Accessible", summary[0]], ["Full Access", summary[1]], ["View Only", summary[2]], ["Restricted", summary[3]]].map(([l, v]) => (
                  <div key={l} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "11px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 19, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
              <Sec>Module Access</Sec>
              {VISIBLE_EMP_MODULES.map(([k, label]) => { const [lvl, c] = accessLevel(e.perms![k]); const col: any = { full: "#10B981", manage: "#635BFF", view: "#F59E0B", none: "#94A3B8" }[c]; return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 11, border: "1px solid var(--border)", borderRadius: 9, padding: "10px 13px", marginBottom: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, color: col, background: col + "1f" }}>{lvl}</span>
                </div>
              ); })}
            </>}
            {tab === "activity" && <Timeline items={[
              { title: "Logged in", sub: `${e.last} · ${e.dept} workstation`, active: true },
              { title: "Approved agency · RapidCare", sub: "22 Jun 2026 · 11:20 AM", done: true },
              { title: "Resolved ticket · TKT-10286", sub: "21 Jun 2026 · 04:15 PM", done: true },
              { title: "Generated revenue report · May 2026", sub: "19 Jun 2026 · 10:05 AM", done: true },
            ]} />}
          </div>
        </>}
      </SideDrawer>

      <Modal open={permModal} onClose={() => setPermModal(false)} title="Edit Permissions" sub={e?.name}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setPermModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={savePerm}>Save Permissions</button></>}>
        {VISIBLE_EMP_MODULES.map(([k, label]) => (
          <div key={k} style={{ padding: "13px 0", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 9 }}>{label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {PERM_TYPES.map((p) => { const on = (draft[k] || []).includes(p); return (
                <button key={p} onClick={() => toggle(k, p)} style={{ fontSize: 12, fontWeight: 500, border: "1px solid var(--border)", borderRadius: 8, padding: "4px 9px", cursor: "pointer", background: on ? "var(--primary-light)" : "#fff", color: on ? "var(--primary)" : "#475569", borderColor: on ? "#C7D2FE" : "var(--border)" }}>{p}</button>
              ); })}
            </div>
          </div>
        ))}
      </Modal>

      <Modal open={add} onClose={() => setAdd(false)} title="Add Employee" sub="Create a new internal staff account"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setAdd(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => {
          const role = eRole || "Customer Support"; const id = "EMP-1023"; const pwd = "Med1023#" + role.charAt(0) + "x";
          setRows([{ name: eName || "New Employee", empId: id, email: eEmail || "new@medurun.in", phone: ePhone || "—", dept: eDept || "Operations", role, status: "invited", last: "—", created: "22 Jun 2026", by: "Arjun Mehta", perms: seedPerms(role) }, ...rows]);
          setAdd(false); setSuccess({ id, pwd });
        }}>Create Employee</button></>}>
        <div className="form-group"><label className="label">Employee Name *</label><input className="input" value={eName} onChange={(ev) => setEName(ev.target.value)} /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Email *</label><input className="input" value={eEmail} onChange={(ev) => setEEmail(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Phone *</label><input className="input" value={ePhone} onChange={(ev) => setEPhone(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Department *</label><select className="input" value={eDept} onChange={(ev) => setEDept(ev.target.value)}><option value="">Select</option><option>Operations</option><option>Finance</option><option>Customer Support</option><option>Marketing</option></select></div>
          <div className="form-group"><label className="label">Role *</label><select className="input" value={eRole} onChange={(ev) => setERole(ev.target.value)}><option value="">Select</option><option>Top Management</option><option>HR</option><option>Finance & Accounts</option><option>Customer Support</option></select></div>
        </div>
      </Modal>

      {/* EDIT EMPLOYEE */}
      <Modal open={edit} onClose={() => setEdit(false)} title="Edit Employee" sub="Update staff details"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setEdit(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => {
          if (sel !== null) setRows(rows.map((r, i) => i === sel ? { ...r, name: eName, email: eEmail, phone: ePhone || "—", dept: eDept, role: eRole, perms: eRole !== r.role ? seedPerms(eRole) : r.perms } : r));
          setEdit(false); notify("Employee updated");
        }}>Save Changes</button></>}>
        <div className="form-group"><label className="label">Full Name</label><input className="input" value={eName} onChange={(ev) => setEName(ev.target.value)} /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Email</label><input className="input" value={eEmail} onChange={(ev) => setEEmail(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Phone</label><input className="input" value={ePhone} onChange={(ev) => setEPhone(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Department</label><select className="input" value={eDept} onChange={(ev) => setEDept(ev.target.value)}><option>Administration</option><option>Operations</option><option>Finance</option><option>Customer Support</option><option>Marketing</option></select></div>
          <div className="form-group"><label className="label">Role</label><select className="input" value={eRole} onChange={(ev) => setERole(ev.target.value)}><option>Top Management</option><option>HR</option><option>Finance & Accounts</option><option>Customer Support</option></select></div>
        </div>
      </Modal>

      {/* DEACTIVATE CONFIRM */}
      <Modal open={deact} onClose={() => setDeact(false)} title="Deactivate Employee" sub="Revoke dashboard access"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setDeact(false)}>Cancel</button><button className="btn btn-danger-soft btn-sm" onClick={() => { if (sel !== null) setRows(rows.map((r, i) => i === sel ? { ...r, status: "suspended" } : r)); setDeact(false); notify("Employee deactivated", "warning"); }}>Deactivate</button></>}>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, marginBottom: 6 }}>You are about to deactivate <b>{e?.name}</b>.</p>
        <p style={{ fontSize: 12.5, color: "#DC2626", lineHeight: 1.5 }}>They will immediately lose access to the dashboard.</p>
      </Modal>

      {/* CREATED SUCCESS */}
      <Modal open={!!success} onClose={() => setSuccess(null)} title="Employee Created Successfully" sub="Account ready"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard?.writeText(`Employee ID: ${success?.id}\nTemporary Password: ${success?.pwd}`).catch(() => {}); notify("Credentials copied"); }}>Copy Credentials</button><button className="btn btn-primary btn-sm" onClick={() => { setSuccess(null); notify("Invitation email sent"); }}>Send Invitation</button></>}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginBottom: 10, background: "#FAFBFC" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".5px" }}>Employee ID</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{success?.id}</div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", background: "#FAFBFC" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".5px" }}>Temporary Password</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "monospace" }}>{success?.pwd}</div>
        </div>
      </Modal>
    </div>
  );
}
