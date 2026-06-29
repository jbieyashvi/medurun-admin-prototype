"use client";
import { useMemo, useState } from "react";
import { employees as seed, EMP_MODULES, EMP_ST, DEPARTMENTS, DEPT_ROLES, moduleAccess, ACCESS_META, ACCESS_LEVELS, Access, Employee } from "@/data/employees";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Tabs, Timeline, Sec } from "./shared";
import { StatCard } from "@/components/StatCard";
import { initials } from "@/lib/format";
import type { ModuleProps } from "./registry";

// Logged-in user is Arjun Mehta (Top Management · Super Admin) — only this role may edit permissions.
const IS_SUPER_ADMIN = true;

export function EmployeeManagement(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<Employee[]>(seed);
  const [q, setQ] = useState(""); const [dept, setDept] = useState("All Departments"); const [status, setStatus] = useState("All Status");
  const [sel, setSel] = useState<number | null>(null); const [tab, setTab] = useState("overview");
  const [add, setAdd] = useState(false); const [edit, setEdit] = useState(false); const [deact, setDeact] = useState(false); const [success, setSuccess] = useState<null | { id: string; pwd: string }>(null);
  const [eName, setEName] = useState(""); const [eEmail, setEEmail] = useState(""); const [ePhone, setEPhone] = useState(""); const [eDept, setEDept] = useState(""); const [eRole, setERole] = useState("");
  const [permModal, setPermModal] = useState(false); const [draft, setDraft] = useState<Record<string, Access>>({});

  const e = sel === null ? null : rows[sel];
  // Effective access = Super-Admin override (if any) else the department default.
  const effAccess = (emp: Employee, key: string): Access => emp.perms?.[key] ?? moduleAccess(emp.dept, key);
  const openPerm = () => { if (e) { const d: Record<string, Access> = {}; EMP_MODULES.forEach(([k]) => (d[k] = effAccess(e, k))); setDraft(d); setPermModal(true); } };
  const savePerm = () => { if (sel !== null) setRows(rows.map((r, i) => i === sel ? { ...r, perms: draft } : r)); setPermModal(false); notify("Permissions updated"); };
  const filtered = useMemo(() => rows.map((x, i) => ({ x, i })).filter(({ x }) =>
    (!q || x.name.toLowerCase().includes(q.toLowerCase()) || x.empId.toLowerCase().includes(q.toLowerCase()))
    && (dept === "All Departments" || x.dept === dept) && (status === "All Status" || EMP_ST[x.status][0] === status)
  ), [rows, q, dept, status]);

  // Permissions are derived from the employee's department (read-only, client-approved matrix).
  const summary = e ? (() => {
    let full = 0, view = 0, none = 0;
    EMP_MODULES.forEach(([k]) => { const lv = effAccess(e, k); if (lv === "full") full++; else if (lv === "view") view++; else none++; });
    return { accessible: full + view, full, view, none };
  })() : { accessible: 0, full: 0, view: 0, none: 0 };

  const setAddDept = (d: string) => { setEDept(d); setERole(""); };

  return (
    <div>
      <PageHeader title="Employee Management" sub="Manage internal staff, roles, and dashboard access."
        action={<button className="btn btn-primary" onClick={() => { setEName(""); setEEmail(""); setEPhone(""); setEDept(""); setERole(""); setAdd(true); }}>+ Add Employee</button>} />
      <Summary>
        <StatCard icon="Users" value={rows.length} label="Total Employees" />
        <StatCard icon="CircleDot" value={rows.filter(r => r.status === "online").length} label="Online Now" />
        <StatCard icon="Shield" value={new Set(rows.map(r => r.dept)).size} label="Departments" />
        <StatCard icon="Mail" value={rows.filter(r => r.status === "invited").length} label="Pending Invites" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search employee..." />
          <Select value={dept} onChange={setDept} options={["All Departments", ...DEPARTMENTS]} />
          <Select value={status} onChange={setStatus} options={["All Status", "Online", "Offline", "Suspended", "Invited"]} />
        </FilterRow>
        <DataTable
          rows={filtered} onRowClick={({ i }) => { setSel(i); setTab("overview"); }}
          columns={[
            { key: "name", label: "Employee", render: ({ x }: any) => <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="h-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(x.name)}</div><div><div style={{ fontWeight: 600 }}>{x.name}</div><div className="text-sm text-muted">{x.email}</div></div></div> },
            { key: "empId", label: "Employee ID", render: ({ x }: any) => <span className="text-sm mono">{x.empId}</span> },
            { key: "dept", label: "Department", render: ({ x }: any) => x.dept },
            { key: "role", label: "Role", render: ({ x }: any) => x.role },
            { key: "status", label: "Status", render: ({ x }: any) => <StatusBadge status={EMP_ST[x.status][1]} label={EMP_ST[x.status][0]} /> },
            { key: "last", label: "Last Active", render: ({ x }: any) => <span className="text-sm text-muted">{x.last}</span> },
            { key: "by", label: "Created By", render: ({ x }: any) => <span className="text-sm text-muted">{x.by}</span> },
            { key: "v", label: "", render: () => <button className="btn btn-outline btn-xs">View →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!e} onClose={() => setSel(null)} title="Employee Details"
        footer={e && tab === "permissions" && IS_SUPER_ADMIN ? <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={openPerm}>Edit Permissions</button> : undefined}>
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
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Access is determined by the employee&apos;s department. Super Admin can customize permissions if needed.</div>
              <div className="summary" style={{ marginBottom: 6, gridTemplateColumns: "repeat(3,1fr)" }}>
                {[["Full Access", summary.full, ACCESS_META.full.color], ["View Only", summary.view, ACCESS_META.view.color], ["No Access", summary.none, ACCESS_META.none.color]].map(([l, v, c]) => (
                  <div key={l as string} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "11px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 19, fontWeight: 700, color: c as string }}>{v as number}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>{l as string}</div>
                  </div>
                ))}
              </div>
              <Sec>Module Access</Sec>
              {EMP_MODULES.map(([k, label]) => { const lv = effAccess(e, k); const m = ACCESS_META[lv]; return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 11, border: "1px solid var(--border)", borderRadius: 9, padding: "10px 13px", marginBottom: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, color: m.color, background: m.bg }}>{m.label}</span>
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

      {/* EDIT PERMISSIONS (Super Admin only) */}
      <Modal open={permModal} onClose={() => setPermModal(false)} title="Edit Permissions" sub={e ? `${e.name} · ${e.dept}` : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setPermModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={savePerm}>Save Permissions</button></>}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Override the department default access for each module. Set back to match the department any time.</div>
        {EMP_MODULES.map(([k, label]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {ACCESS_LEVELS.map((lv) => { const on = (draft[k] || "none") === lv; const m = ACCESS_META[lv]; return (
                <button key={lv} onClick={() => setDraft((d) => ({ ...d, [k]: lv }))} style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 8, padding: "4px 9px", cursor: "pointer",
                  border: `1px solid ${on ? m.color : "var(--border)"}`, background: on ? m.bg : "#fff", color: on ? m.color : "#64748B",
                }}>{m.label}</button>
              ); })}
            </div>
          </div>
        ))}
      </Modal>

      <Modal open={add} onClose={() => setAdd(false)} title="Add Employee" sub="Create a new internal staff account"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setAdd(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => {
          if (!eName || !eEmail || !eDept || !eRole) { notify("Fill all required fields", "warning"); return; }
          const id = "EMP-1023"; const pwd = "Med1023#" + eRole.charAt(0) + "x";
          setRows([{ name: eName, empId: id, email: eEmail, phone: ePhone || "—", dept: eDept, role: eRole, status: "invited", last: "—", created: "22 Jun 2026", by: "Arjun Mehta" }, ...rows]);
          setAdd(false); setSuccess({ id, pwd });
        }}>Create Employee</button></>}>
        <div className="form-group"><label className="label">Employee Name *</label><input className="input" value={eName} onChange={(ev) => setEName(ev.target.value)} /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Email *</label><input className="input" value={eEmail} onChange={(ev) => setEEmail(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Phone *</label><input className="input" value={ePhone} onChange={(ev) => setEPhone(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Department *</label><select className="input" value={eDept} onChange={(ev) => setAddDept(ev.target.value)}><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="form-group"><label className="label">Role *</label><select className="input" value={eRole} onChange={(ev) => setERole(ev.target.value)} disabled={!eDept}><option value="">{eDept ? "Select role" : "Select department first"}</option>{(DEPT_ROLES[eDept] || []).map((r) => <option key={r}>{r}</option>)}</select></div>
        </div>
      </Modal>

      {/* EDIT EMPLOYEE */}
      <Modal open={edit} onClose={() => setEdit(false)} title="Edit Employee" sub="Update staff details"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setEdit(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => {
          if (!eDept || !eRole) { notify("Department and role are required", "warning"); return; }
          if (sel !== null) setRows(rows.map((r, i) => i === sel ? { ...r, name: eName, email: eEmail, phone: ePhone || "—", dept: eDept, role: eRole } : r));
          setEdit(false); notify("Employee updated");
        }}>Save Changes</button></>}>
        <div className="form-group"><label className="label">Full Name</label><input className="input" value={eName} onChange={(ev) => setEName(ev.target.value)} /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Email</label><input className="input" value={eEmail} onChange={(ev) => setEEmail(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Phone</label><input className="input" value={ePhone} onChange={(ev) => setEPhone(ev.target.value)} /></div>
          <div className="form-group"><label className="label">Department</label><select className="input" value={eDept} onChange={(ev) => setAddDept(ev.target.value)}><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="form-group"><label className="label">Role</label><select className="input" value={eRole} onChange={(ev) => setERole(ev.target.value)} disabled={!eDept}><option value="">{eDept ? "Select role" : "Select department first"}</option>{(DEPT_ROLES[eDept] || []).map((r) => <option key={r}>{r}</option>)}</select></div>
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
