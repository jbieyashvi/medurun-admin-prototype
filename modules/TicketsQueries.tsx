"use client";
import { useMemo, useState } from "react";
import { tickets as SEED, TK_STATUS, TK_PRIO, GPS_CATEGORIES, Ticket } from "@/data/tickets";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Tabs, Sec, Row } from "./shared";
import { StatCard } from "@/components/StatCard";
import type { ModuleProps } from "./registry";

type TLEvent = { time: string; title: string; sub: string };
type Comment = { name: string; role: string; time: string; text: string };
type Log = { time: string; icon: string; text: string };
type FullTicket = Ticket & { timeline: TLEvent[]; comments: Comment[]; activity: Log[]; notes?: string; resolution?: string; resolvedBy?: string; resolvedAt?: string };

function seed(t: Ticket): FullTicket {
  const d = t.created;
  const timeline: TLEvent[] = [
    { time: d + " 10:32 AM", title: "Ticket created", sub: "Raised by " + t.user },
    { time: d + " 10:40 AM", title: "Assigned to " + t.dept, sub: "Auto-routed by category: " + t.category },
    { time: d + " 11:15 AM", title: "Status changed to Under Review", sub: "By Neha Kulkarni · Support Lead" },
  ];
  if (t.priority === "urgent") timeline.push({ time: d + " 11:40 AM", title: "Escalated to " + t.dept + " Lead", sub: "Priority: Urgent" });
  if (t.status === "in-progress") timeline.push({ time: d + " 12:05 PM", title: "Resolution initiated", sub: "In progress" });
  if (t.status === "resolved") timeline.push({ time: d + " 02:20 PM", title: "Ticket resolved", sub: "Closed by " + t.team });
  return {
    ...t, timeline,
    comments: [
      { name: "Neha Kulkarni", role: "Support Lead", time: d + " 11:16 AM", text: "Reviewed the issue, routing to " + t.team + " for action." },
      { name: "Arjun Mehta", role: "Super Admin", time: d + " 11:50 AM", text: "Please prioritise — customer impacted on " + (t.booking === "—" ? "account" : t.booking) + "." },
    ],
    activity: [
      { time: d + " 10:32 AM", icon: "Plus", text: "Ticket created via customer app" },
      { time: d + " 10:33 AM", icon: "Phone", text: "Inbound call logged · 2m 14s" },
      { time: d + " 10:40 AM", icon: "Shuffle", text: "Routed to " + t.dept + " department" },
      { time: d + " 10:41 AM", icon: "Users", text: "Assigned to team: " + t.team },
      { time: d + " 11:15 AM", icon: "UserCheck", text: "Ownership: Neha Kulkarni" },
      { time: d + " 11:30 AM", icon: "Mail", text: "Acknowledgement email sent to customer" },
    ],
  };
}

export function TicketsQueries({ onNavigate }: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<FullTicket[]>(SEED.map(seed));
  const [q, setQ] = useState(""); const [st, setSt] = useState("All Status"); const [pr, setPr] = useState("All Priority");
  const [selId, setSelId] = useState<string | null>(null); const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState<null | "assign" | "comment" | "resolve" | "booking" | "update" | "resolution">(null);
  // modal form state
  const [dept, setDept] = useState(""); const [team, setTeam] = useState("");
  const [comment, setComment] = useState(""); const [resNotes, setResNotes] = useState(""); const [notify_, setNotify_] = useState(true);
  const [inlineComment, setInlineComment] = useState("");

  const sel = rows.find((r) => r.id === selId) || null;
  const update = (id: string, fn: (t: FullTicket) => FullTicket) => setRows((rs) => rs.map((t) => (t.id === id ? fn(t) : t)));

  const filtered = useMemo(() => rows.filter((t) =>
    (!q || t.id.toLowerCase().includes(q.toLowerCase()) || t.user.toLowerCase().includes(q.toLowerCase()))
    && (st === "All Status" || TK_STATUS[t.status][0] === st)
    && (pr === "All Priority" || TK_PRIO[t.priority] === pr)
  ), [rows, q, st, pr]);

  const open = (t: FullTicket) => { setSelId(t.id); setTab("overview"); };

  const log = (t: FullTicket, title: string, sub = "By Arjun Mehta · Super Admin"): FullTicket =>
    ({ ...t, timeline: [...t.timeline, { time: "now", title, sub }] });

  // footer actions
  const setStatus = (status: FullTicket["status"], msg: string) => sel && update(sel.id, (t) => { const u = log(t, "Status changed to " + TK_STATUS[status][0]); return { ...u, status, activity: [{ time: "just now", icon: "RefreshCw", text: "Status → " + TK_STATUS[status][0] }, ...u.activity] }; }) || notify(msg);

  const doUnderReview = () => { if (!sel) return; update(sel.id, (t) => ({ ...log(t, "Moved to Under Review"), status: "under-review", activity: [{ time: "just now", icon: "Play", text: "Status → Under Review · Arjun Mehta" }, ...t.activity] })); notify(sel.id + " → Under Review"); };
  const doInProgress = () => { if (!sel) return; update(sel.id, (t) => ({ ...log(t, "Moved to In Progress", "Resolution initiated"), status: "in-progress", activity: [{ time: "just now", icon: "ArrowRight", text: "Status → In Progress · Arjun Mehta" }, ...t.activity] })); notify(sel.id + " → In Progress"); };
  const doReopen = () => { if (!sel) return; update(sel.id, (t) => ({ ...log(t, "Ticket reopened"), status: "in-progress", activity: [{ time: "just now", icon: "RotateCcw", text: "Ticket reopened · Arjun Mehta" }, ...t.activity] })); notify(sel.id + " reopened", "warning"); };

  const addComment = (text: string) => { if (!sel) return; update(sel.id, (t) => ({ ...t, comments: [...t.comments, { name: "Arjun Mehta", role: "Super Admin", time: "just now", text }], activity: [{ time: "just now", icon: "MessageSquare", text: "Comment added by Arjun Mehta" }, ...t.activity] })); notify("Comment added"); };
  const openAssign = () => { if (sel) { setDept(sel.dept); setTeam(sel.team); setModal("assign"); } };
  const saveAssign = () => { if (!sel) return; update(sel.id, (t) => ({ ...log(t, "Re-assigned to " + dept, "Team: " + team), dept, team, activity: [{ time: "just now", icon: "Users", text: "Team assignment → " + team + " (" + dept + ") · Arjun Mehta" }, ...t.activity] })); setModal(null); notify("Assigned to " + team); };
  const openComment = () => { setComment(""); setModal("comment"); };
  const saveComment = () => { if (!comment.trim()) { notify("Enter a comment", "warning"); return; } addComment(comment.trim()); setModal(null); setTab("comments"); };
  const postInline = () => { if (!inlineComment.trim()) return; addComment(inlineComment.trim()); setInlineComment(""); };
  const callOut = (who: string, num: string) => notify(`Calling ${who} · ${num}`);
  const trackLive = () => { notify("Opening live tracking"); onNavigate("gps"); };
  const openResolve = () => { setResNotes(""); setNotify_(true); setModal("resolve"); };
  const saveResolve = () => { if (!sel || !resNotes.trim()) { notify("Resolution notes are required", "warning"); return; } update(sel.id, (t) => { let u = log(t, "Ticket resolved", resNotes.slice(0, 60)); u = { ...u, status: "resolved", resolution: resNotes, resolvedBy: "Arjun Mehta", resolvedAt: t.created + " · 02:20 PM", activity: [{ time: "just now", icon: "Check", text: "Ticket resolved by Arjun Mehta" }, ...u.activity] }; if (notify_) u.activity.unshift({ time: "just now", icon: "Mail", text: "Resolution notification sent to " + t.user }); return u; }); setModal(null); notify(sel.id + " resolved" + (notify_ ? " · customer notified" : "")); };

  return (
    <div>
      <PageHeader title="Tickets & Queries" sub="Support tickets raised by customers and agencies" />
      <Summary>
        <StatCard icon="Inbox" value={rows.filter((t) => t.status === "open").length} label="Open Tickets" />
        <StatCard icon="Search" value={rows.filter((t) => t.status === "under-review").length} label="Under Review" />
        <StatCard icon="Loader" value={rows.filter((t) => t.status === "in-progress").length} label="In Progress" />
        <StatCard icon="CircleCheck" value={rows.filter((t) => t.status === "resolved").length} label="Resolved Today" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search tickets, users..." />
          <Select value={st} onChange={setSt} options={["All Status", "Open", "Under Review", "In Progress", "Resolved"]} />
          <Select value={pr} onChange={setPr} options={["All Priority", "Urgent", "High", "Medium", "Low"]} />
          <button className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }} onClick={() => notify("Exporting tickets to CSV")}><Icon name="Download" size={14} /> Export CSV</button>
        </FilterRow>
        <DataTable<FullTicket>
          rows={filtered} getKey={(t) => t.id} onRowClick={open}
          columns={[
            { key: "id", label: "Ticket ID", render: (t) => <b className="mono">{t.id}</b> },
            { key: "user", label: "User" },
            { key: "source", label: "Source", render: (t) => <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 8px", borderRadius: 20 }}>{t.source}</span> },
            { key: "category", label: "Category" },
            { key: "priority", label: "Priority", render: (t) => <span style={{ fontSize: 11.5, fontWeight: 600, color: t.priority === "urgent" ? "#DC2626" : t.priority === "high" ? "#B45309" : "#475569" }}>● {TK_PRIO[t.priority]}</span> },
            { key: "status", label: "Status", render: (t) => <StatusBadge status={TK_STATUS[t.status][1]} label={TK_STATUS[t.status][0]} /> },
            { key: "dept", label: "Assigned Department" },
            { key: "created", label: "Created", className: "text-sm text-muted" },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSelId(null)} title="Ticket Details" footer={sel && (() => {
        const O = (l: string, ic: string, fn: () => void) => <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={fn}><Icon name={ic} size={14} /> {l}</button>;
        if (sel.status === "open") return <>
          <div style={{ display: "flex", gap: 8 }}>{O("Add Comment", "MessageSquare", openComment)}{O("Assign Team", "Users", openAssign)}</div>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={doUnderReview}><Icon name="Play" size={14} /> Move to Under Review</button>
        </>;
        if (sel.status === "under-review") return <>
          <div style={{ display: "flex", gap: 8 }}>{O("Add Comment", "MessageSquare", openComment)}{O("Reassign Team", "Users", openAssign)}</div>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={doInProgress}><Icon name="ArrowRight" size={14} /> Move to In Progress</button>
        </>;
        if (sel.status === "in-progress") return <>
          <div style={{ display: "flex", gap: 8 }}>{O("Add Comment", "MessageSquare", openComment)}{O("Update Customer", "Send", () => setModal("update"))}</div>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={openResolve}><Icon name="Check" size={14} /> Resolve Ticket</button>
        </>;
        return <div style={{ display: "flex", gap: 8 }}>{O("View Resolution", "FileText", () => setModal("resolution"))}{O("Reopen Ticket", "RotateCcw", doReopen)}</div>;
      })()}>
        {sel && (() => {
          const isSOS = sel.category === "Safety / SOS";
          const isGps = GPS_CATEGORIES.includes(sel.category);
          return <>
          <DrawerHead avatar={sel.id.split("-")[1].slice(0, 3)} title={sel.id} sub={`${sel.category} · ${sel.created}`} right={<StatusBadge status={TK_STATUS[sel.status][1]} label={TK_STATUS[sel.status][0]} />} />

          {isSOS && <div style={{ margin: "0 22px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 11, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#B91C1C", fontWeight: 700, fontSize: 13.5 }}>🚨 High Priority Safety Ticket</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button className="btn btn-danger-soft btn-xs" onClick={() => callOut("driver", sel.phone)}><Icon name="Phone" size={13} /> Call Driver</button>
              <button className="btn btn-danger-soft btn-xs" onClick={() => callOut("customer", sel.phone)}><Icon name="Phone" size={13} /> Call Customer</button>
              <button className="btn btn-danger-soft btn-xs" onClick={trackLive}><Icon name="Navigation" size={13} /> Track Live Ambulance</button>
            </div>
          </div>}

          <Tabs tabs={[["overview", "Overview"], ["comments", "Comments"], ["audit", "Audit Trail"]]} active={tab} onChange={setTab} />
          <div style={{ padding: "10px 22px 18px" }}>
            {tab === "overview" && <>
              <Sec>Issue Description</Sec>
              <div style={{ border: "1px solid var(--border)", borderLeft: "3px solid var(--primary)", borderRadius: 10, padding: "13px 15px", background: "#FBFAFF" }}>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#1F2937", fontWeight: 500, margin: 0 }}>{sel.issue}</p>
              </div>

              <Sec>SLA Tracking</Sec>
              <div style={{ border: `1px solid ${sel.slaBreached ? "#FECACA" : "#A7F3D0"}`, background: sel.slaBreached ? "#FEF2F2" : "#ECFDF5", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: "#475569" }}>SLA Deadline</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{sel.slaDeadline}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 7 }}>
                  <span style={{ fontSize: 12.5, color: "#475569" }}>Time Remaining</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: sel.slaBreached ? "#DC2626" : "#059669" }}>{sel.slaRemaining}</span>
                </div>
                <div style={{ marginTop: 9 }}>
                  <span className={`badge ${sel.slaBreached ? "rejected" : "verified"}`}><Icon name={sel.slaBreached ? "TriangleAlert" : "Check"} size={12} /> {sel.slaBreached ? "SLA Breached" : "Within SLA"}</span>
                </div>
              </div>

              <Sec>Ticket Details</Sec>
              <ProfGrid items={[["Ticket ID", sel.id], ["Source", sel.source], ["Category", sel.category], ["Priority", TK_PRIO[sel.priority]], ["Assigned Department", sel.dept], ["Assigned Team", sel.team]]} />

              <Sec>Raised By</Sec>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "13px 14px" }}>
                <div style={{ fontWeight: 600 }}>{sel.user} <span style={{ fontSize: 11, color: "var(--primary)", background: "var(--primary-light)", padding: "1px 7px", borderRadius: 20, fontWeight: 600, marginLeft: 4 }}>{sel.source}</span></div>
                <div className="text-sm text-muted">ID · {sel.cid}</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>{sel.phone} · Booking {sel.booking}</div>
              </div>
              {sel.booking !== "—" && <button className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={() => setModal("booking")}><Icon name="ExternalLink" size={14} /> View Booking</button>}

              {isGps && <>
                <Sec>GPS Integration</Sec>
                <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "13px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}><span style={{ fontSize: 12.5, color: "#475569" }}>Current Driver Status</span><span style={{ fontSize: 12.5, fontWeight: 600, color: sel.driverStatus === "SOS Active" ? "#DC2626" : "#0F172A" }}>{sel.driverStatus || "Unknown"}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}><span style={{ fontSize: 12.5, color: "#475569" }}>Current Location</span><span style={{ fontSize: 12.5, fontWeight: 600 }}>{sel.location || "—"}</span></div>
                  <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={trackLive}><Icon name="MapPin" size={14} /> View Live Map</button>
                </div>
              </>}

              {sel.status === "resolved" && <>
                <Sec>Resolution Summary</Sec>
                <Row k="Resolved By">{sel.resolvedBy || "Arjun Mehta"}</Row>
                <Row k="Resolution Date">{sel.resolvedAt || sel.created + " · 02:20 PM"}</Row>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#374151", marginTop: 8 }}>{sel.resolution || "Resolved."}</p>
              </>}
            </>}

            {tab === "comments" && <>
              {sel.comments.map((c, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: "var(--primary)", background: "var(--primary-light)", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>{c.role}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "#374151" }}>{c.text}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-end" }}>
                <textarea className="input" style={{ minHeight: 42, flex: 1 }} value={inlineComment} onChange={(e) => setInlineComment(e.target.value)} placeholder="Write a comment..." />
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={postInline}><Icon name="Send" size={14} /> Post</button>
              </div>
            </>}

            {tab === "audit" && sel.activity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "9px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: "#F1F5F9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={a.icon} size={14} /></span>
                <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.text}</div><div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{a.time}</div></div>
              </div>
            ))}
          </div>
        </>;
        })()}
      </SideDrawer>

      {/* ASSIGN TEAM */}
      <Modal open={modal === "assign"} onClose={() => setModal(null)} title="Assign Team" sub="Route ticket to department & team"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveAssign}>Assign</button></>}>
        <div className="form-group"><label className="label">Department</label><select className="input" value={dept} onChange={(e) => setDept(e.target.value)}>{["Finance", "Tech Support", "Operations", "Compliance", "Customer Care"].map((o) => <option key={o}>{o}</option>)}</select></div>
        <div className="form-group"><label className="label">Team</label><select className="input" value={team} onChange={(e) => setTeam(e.target.value)}>{["Finance Support", "Tech Support", "Operations", "Compliance", "Escalations", "Customer Care"].map((o) => <option key={o}>{o}</option>)}</select></div>
      </Modal>
      {/* VIEW RESOLUTION */}
      <Modal open={modal === "resolution"} onClose={() => setModal(null)} title="Resolution" sub={sel ? sel.id : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <>
          <div className="stat-row"><span className="k">Resolved By</span><span style={{ fontWeight: 600 }}>{sel.resolvedBy || "Arjun Mehta"}</span></div>
          <div className="stat-row"><span className="k">Resolution Date</span><span style={{ fontWeight: 600 }}>{sel.resolvedAt || sel.created + " · 02:20 PM"}</span></div>
          <Sec>Resolution Notes</Sec>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#374151" }}>{sel.resolution || "Resolved after review. No further action required."}</p>
        </>}
      </Modal>
      {/* ADD COMMENT */}
      <Modal open={modal === "comment"} onClose={() => setModal(null)} title="Add Comment" sub="Internal team comment"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveComment}>Save</button></>}>
        <div className="form-group"><label className="label">Comment</label><textarea className="input" style={{ minHeight: 96 }} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write an internal comment..." /></div>
      </Modal>
      {/* RESOLVE */}
      <Modal open={modal === "resolve"} onClose={() => setModal(null)} title="Resolve Ticket" sub="Close and document resolution"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveResolve}>Resolve</button></>}>
        <div className="form-group"><label className="label">Resolution Notes *</label><textarea className="input" style={{ minHeight: 88 }} value={resNotes} onChange={(e) => setResNotes(e.target.value)} placeholder="Describe how the ticket was resolved..." /></div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}><input type="checkbox" checked={notify_} onChange={(e) => setNotify_(e.target.checked)} /> Notify customer of resolution</label>
      </Modal>
      {/* UPDATE CUSTOMER */}
      <Modal open={modal === "update"} onClose={() => setModal(null)} title="Update Customer" sub={sel?.user}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { setModal(null); notify("Customer update sent"); }}>Send Update</button></>}>
        <div className="form-group"><label className="label">Message to customer</label><textarea className="input" style={{ minHeight: 88 }} placeholder="Share a status update with the customer..." /></div>
      </Modal>
      {/* BOOKING */}
      <Modal open={modal === "booking"} onClose={() => setModal(null)} title="Booking Details" sub={sel ? sel.booking + " · " + sel.user : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <ProfGrid items={[["Booking ID", sel.booking], ["Customer", sel.user], ["Phone", sel.phone], ["Status", "Completed"], ["Pickup", "Andheri East"], ["Destination", "City General Hospital"], ["Fare", "₹2,140"], ["Date", sel.created]]} />}
      </Modal>
    </div>
  );
}
