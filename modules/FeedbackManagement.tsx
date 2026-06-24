"use client";
import { useMemo, useState } from "react";
import { feedback as SEED, FB_ST, FB_CATEGORIES, Feedback, FStatus } from "@/data/feedback";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Tabs, Sec, Row } from "./shared";
import { StatCard } from "@/components/StatCard";
import type { ModuleProps } from "./registry";

const NOW = "just now";

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return <span style={{ color: "#F59E0B", fontSize: size, letterSpacing: 1 }} title={`${n} / 5`}>
    {"★".repeat(n)}<span style={{ color: "#E2E8F0" }}>{"★".repeat(5 - n)}</span>
  </span>;
}

function MiniBars({ rows }: { rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return <div>{rows.map(([l, v]) => (
    <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, margin: "7px 0" }}>
      <span style={{ width: 130, fontSize: 12, color: "#475569", flexShrink: 0 }}>{l}</span>
      <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 20, overflow: "hidden" }}><div style={{ width: `${(v / max) * 100}%`, height: "100%", background: "var(--primary)" }} /></div>
      <span style={{ width: 26, textAlign: "right", fontSize: 12, fontWeight: 600 }}>{v}</span>
    </div>
  ))}</div>;
}

function Spark({ points }: { points: number[] }) {
  const w = 300, h = 56, max = Math.max(...points), min = Math.min(...points);
  const pts = points.map((p, i) => [(i / (points.length - 1)) * w, h - 6 - ((p - min) / (max - min || 1)) * (h - 14)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(0) + "," + p[1].toFixed(0)).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 56 }}>
    <path d={d + ` L${w},${h} L0,${h} Z`} fill="#635BFF" opacity={0.1} />
    <path d={d} fill="none" stroke="#635BFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function APanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card" style={{ padding: 15 }}><div className="section-title" style={{ fontSize: 13.5, marginBottom: 11 }}>{title}</div>{children}</div>;
}

export function FeedbackManagement(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<Feedback[]>(SEED);
  const [q, setQ] = useState(""); const [type, setType] = useState("All Types");
  const [rating, setRating] = useState("All Ratings"); const [status, setStatus] = useState("All Status"); const [range, setRange] = useState("All Time");
  const [selId, setSelId] = useState<string | null>(null); const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState<null | "note" | "resolve" | "history">(null);
  const [noteText, setNoteText] = useState(""); const [resText, setResText] = useState(""); const [inlineNote, setInlineNote] = useState("");

  const sel = rows.find((r) => r.id === selId) || null;
  const update = (id: string, fn: (f: Feedback) => Feedback) => setRows((rs) => rs.map((f) => (f.id === id ? fn(f) : f)));

  const filtered = useMemo(() => rows.filter((f) =>
    (!q || [f.id, f.by, f.target, f.agency].some((s) => s.toLowerCase().includes(q.toLowerCase())))
    && (type === "All Types" || f.type === type)
    && (rating === "All Ratings" || f.rating === Number(rating[0]))
    && (status === "All Status" || FB_ST[f.status][0] === status)
  ), [rows, q, type, rating, status]);

  const avg = (list: Feedback[]) => list.length ? (list.reduce((s, f) => s + f.rating, 0) / list.length) : 0;
  const stats = {
    total: rows.length,
    pending: rows.filter((f) => f.status === "new" || f.status === "review").length,
    avg: avg(rows),
    critical: rows.filter((f) => f.rating <= 2).length,
  };

  // analytics
  const avgBy = (t: string) => avg(rows.filter((f) => f.type === t));
  const catCounts = FB_CATEGORIES.map((c) => [c, rows.filter((f) => f.category === c).length] as [string, number]).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]);
  const lowestBy = (t: string) => {
    const m = new Map<string, { sum: number; n: number; agency: string }>();
    rows.filter((f) => f.type === t).forEach((f) => { const e = m.get(f.target) || { sum: 0, n: 0, agency: f.agency }; e.sum += f.rating; e.n++; m.set(f.target, e); });
    return [...m.entries()].map(([name, e]) => ({ name, avg: e.sum / e.n, agency: e.agency })).sort((a, b) => a.avg - b.avg).slice(0, 3);
  };

  const addNote = (text: string) => { if (!sel) return; update(sel.id, (f) => ({ ...f, notes: [...f.notes, { name: "Arjun Mehta", time: NOW, text }], activity: [{ time: NOW, icon: "StickyNote", text: "Internal note added · Arjun Mehta" }, ...f.activity] })); notify("Internal note added"); };
  const openNote = () => { setNoteText(""); setModal("note"); };
  const saveNote = () => { if (!noteText.trim()) { notify("Enter a note", "warning"); return; } addNote(noteText.trim()); setModal(null); setTab("notes"); };
  const postInline = () => { if (!inlineNote.trim()) return; addNote(inlineNote.trim()); setInlineNote(""); };

  const markReview = () => { if (!sel) return; update(sel.id, (f) => ({ ...f, status: "review", activity: [{ time: NOW, icon: "UserCheck", text: "Assigned for review · Arjun Mehta" }, ...f.activity] })); notify(sel.id + " → Under Review"); };
  const escalate = (to: string) => { if (!sel) return; update(sel.id, (f) => ({ ...f, status: "escalated", activity: [{ time: NOW, icon: "TrendingUp", text: `Escalated to ${to} · Arjun Mehta` }, ...f.activity] })); notify(sel.id + " escalated to " + to, "warning"); };
  const openResolve = () => { setResText(""); setModal("resolve"); };
  const saveResolve = () => { if (!sel || !resText.trim()) { notify("Resolution note required", "warning"); return; } update(sel.id, (f) => ({ ...f, status: "resolved", resolution: resText.trim(), resolvedBy: "Arjun Mehta", resolvedAt: "just now", activity: [{ time: NOW, icon: "Check", text: "Marked resolved · Arjun Mehta" }, ...f.activity] })); setModal(null); notify(sel.id + " resolved"); };
  const reopen = () => { if (!sel) return; update(sel.id, (f) => ({ ...f, status: "review", activity: [{ time: NOW, icon: "RotateCcw", text: "Feedback reopened · Arjun Mehta" }, ...f.activity] })); notify(sel.id + " reopened", "warning"); };

  return (
    <div>
      <PageHeader title="Feedback Management" sub="Collect, review, and act on feedback about drivers, agencies, ambulances, and the platform." />

      <Summary>
        <StatCard icon="MessageSquare" value={stats.total} label="Total Feedback" />
        <StatCard icon="Clock" value={stats.pending} label="Pending Review" />
        <StatCard icon="Star" value={stats.avg.toFixed(1)} label="Average Rating" />
        <StatCard icon="TriangleAlert" value={stats.critical} label="Critical Feedback" />
      </Summary>

      {/* ANALYTICS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 }}>
        <APanel title="Average Ratings by Type">
          {[["Driver", avgBy("Driver")], ["Agency", avgBy("Agency")], ["Platform", avgBy("Platform")], ["Ambulance", avgBy("Ambulance")]].map(([l, v]) => (
            <div key={l as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
              <span style={{ fontSize: 12.5, color: "#475569" }}>{l}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Stars n={Math.round(v as number)} /><b style={{ fontSize: 12.5 }}>{(v as number).toFixed(1)}</b></span>
            </div>
          ))}
        </APanel>
        <APanel title="Most Common Complaints">
          <MiniBars rows={catCounts} />
        </APanel>
        <APanel title="Feedback Trend">
          <Spark points={[6, 9, 7, 11, 8, 13, 10]} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#94A3B8", marginTop: 6 }}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}</div>
        </APanel>
        <APanel title="Lowest Rated Drivers">
          {lowestBy("Driver").map((d) => (
            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F5F5F7" }}>
              <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 11, color: "#9CA3AF" }}>{d.agency}</div></div>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Stars n={Math.round(d.avg)} /><b style={{ fontSize: 12 }}>{d.avg.toFixed(1)}</b></span>
            </div>
          ))}
        </APanel>
        <APanel title="Lowest Rated Agencies">
          {lowestBy("Agency").map((d) => (
            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F5F5F7" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{d.name}</div>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Stars n={Math.round(d.avg)} /><b style={{ fontSize: 12 }}>{d.avg.toFixed(1)}</b></span>
            </div>
          ))}
        </APanel>
        <APanel title="Resolution Overview">
          {(["new", "review", "escalated", "resolved"] as FStatus[]).map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
              <StatusBadge status={FB_ST[s][1]} label={FB_ST[s][0]} />
              <b style={{ fontSize: 13 }}>{rows.filter((f) => f.status === s).length}</b>
            </div>
          ))}
        </APanel>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search ID, user, driver, agency..." />
          <Select value={type} onChange={setType} options={["All Types", "Driver", "Agency", "Ambulance", "Platform"]} />
          <Select value={rating} onChange={setRating} options={["All Ratings", "5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Stars"]} />
          <Select value={status} onChange={setStatus} options={["All Status", "New", "Under Review", "Escalated", "Resolved"]} />
          <Select value={range} onChange={setRange} options={["All Time", "Today", "7 Days", "30 Days"]} />
        </FilterRow>
        <DataTable<Feedback>
          rows={filtered} getKey={(f) => f.id} onRowClick={(f) => { setSelId(f.id); setTab("overview"); }}
          columns={[
            { key: "id", label: "Feedback ID", render: (f) => <b className="mono">{f.id}</b> },
            { key: "by", label: "Submitted By" },
            { key: "type", label: "Type", render: (f) => <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 8px", borderRadius: 20 }}>{f.type}</span> },
            { key: "target", label: "Target Name" },
            { key: "rating", label: "Rating", render: (f) => <Stars n={f.rating} /> },
            { key: "category", label: "Category", className: "text-sm" },
            { key: "status", label: "Status", render: (f) => <StatusBadge status={FB_ST[f.status][1]} label={FB_ST[f.status][0]} /> },
            { key: "date", label: "Submitted", className: "text-sm text-muted" },
          ]}
        />
      </div>

      {/* DETAILS DRAWER */}
      <SideDrawer open={!!sel} onClose={() => setSelId(null)} title="Feedback Details" footer={sel && (() => {
        const O = (l: string, ic: string, fn: () => void) => <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={fn}><Icon name={ic} size={14} /> {l}</button>;
        if (sel.status === "new") return <>
          <div style={{ display: "flex", gap: 8 }}>{O("Add Internal Note", "StickyNote", openNote)}</div>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={markReview}><Icon name="Play" size={14} /> Mark Under Review</button>
        </>;
        if (sel.status === "review") return <>
          <div style={{ display: "flex", gap: 8 }}>{O("Add Note", "StickyNote", openNote)}{O("Escalate to Operations", "TrendingUp", () => escalate("Operations"))}</div>
          <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => escalate("Agency")}><Icon name="Building2" size={14} /> Escalate to Agency</button>
        </>;
        if (sel.status === "escalated") return <>
          <div style={{ display: "flex", gap: 8 }}>{O("Add Resolution Note", "StickyNote", openNote)}</div>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={openResolve}><Icon name="Check" size={14} /> Mark Resolved</button>
        </>;
        return <div style={{ display: "flex", gap: 8 }}>{O("View Resolution History", "History", () => setModal("history"))}{O("Reopen Feedback", "RotateCcw", reopen)}</div>;
      })()}>
        {sel && <>
          <DrawerHead avatar={<Icon name="MessageSquare" size={18} />} title={sel.id} sub={`${sel.type} Feedback · ${sel.date}`} right={<StatusBadge status={FB_ST[sel.status][1]} label={FB_ST[sel.status][0]} />} />

          {sel.rating <= 2 && <div style={{ margin: "0 22px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 11, padding: "11px 14px" }}>
            <div style={{ color: "#B91C1C", fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}>⚠ Critical Feedback</div>
            <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 2 }}>Immediate review recommended.</div>
          </div>}

          <Tabs tabs={[["overview", "Overview"], ["notes", "Internal Notes"], ["activity", "Activity Log"]]} active={tab} onChange={setTab} />
          <div style={{ padding: "10px 22px 18px" }}>
            {tab === "overview" && <>
              <Sec>Feedback Information</Sec>
              <ProfGrid items={[["Submitted By", sel.by], ["User Type", sel.userType], ["Submission Date", sel.date]]} />
              <Sec>Target Information</Sec>
              <ProfGrid items={[["Feedback Type", sel.type], [`${sel.type} Name`, sel.target], ["Associated Agency", sel.agency]]} />
              <Sec>Feedback Content</Sec>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                <Stars n={sel.rating} size={18} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 9px", borderRadius: 20 }}>{sel.category}</span>
              </div>
              <div style={{ border: "1px solid var(--border)", borderLeft: "3px solid var(--primary)", borderRadius: 10, padding: "13px 15px", background: "#FBFAFF" }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#1F2937", margin: 0 }}>{sel.comment}</p>
              </div>
              {sel.status === "resolved" && <>
                <Sec>Resolution</Sec>
                <Row k="Resolved By">{sel.resolvedBy || "—"}</Row>
                <Row k="Resolved At">{sel.resolvedAt || "—"}</Row>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#374151", marginTop: 8 }}>{sel.resolution}</p>
              </>}
            </>}

            {tab === "notes" && <>
              {sel.notes.length === 0 && <div className="text-sm text-muted" style={{ padding: "8px 0" }}>No internal notes yet.</div>}
              {sel.notes.map((n, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{n.name}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "#374151" }}>{n.text}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-end" }}>
                <textarea className="input" style={{ minHeight: 42, flex: 1 }} value={inlineNote} onChange={(e) => setInlineNote(e.target.value)} placeholder="Add an internal note..." />
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={postInline}><Icon name="Plus" size={14} /> Add</button>
              </div>
            </>}

            {tab === "activity" && sel.activity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "9px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: "#F1F5F9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={a.icon} size={14} /></span>
                <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.text}</div><div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{a.time}</div></div>
              </div>
            ))}
          </div>
        </>}
      </SideDrawer>

      {/* ADD NOTE */}
      <Modal open={modal === "note"} onClose={() => setModal(null)} title="Add Internal Note" sub={sel ? sel.id : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveNote}>Save Note</button></>}>
        <div className="form-group"><label className="label">Internal Note</label><textarea className="input" style={{ minHeight: 96 }} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="e.g. Repeated complaint against this driver. Escalated to Operations." /></div>
      </Modal>

      {/* RESOLVE */}
      <Modal open={modal === "resolve"} onClose={() => setModal(null)} title="Mark Resolved" sub={sel ? sel.id : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveResolve}>Mark Resolved</button></>}>
        <div className="form-group"><label className="label">Resolution Note *</label><textarea className="input" style={{ minHeight: 88 }} value={resText} onChange={(e) => setResText(e.target.value)} placeholder="Describe the action taken to resolve this feedback..." /></div>
      </Modal>

      {/* RESOLUTION HISTORY */}
      <Modal open={modal === "history"} onClose={() => setModal(null)} title="Resolution History" sub={sel ? sel.id : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <>
          <div className="stat-row"><span className="k">Resolved By</span><span style={{ fontWeight: 600 }}>{sel.resolvedBy || "—"}</span></div>
          <div className="stat-row"><span className="k">Resolved At</span><span style={{ fontWeight: 600 }}>{sel.resolvedAt || "—"}</span></div>
          <Sec>Resolution Note</Sec>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#374151" }}>{sel.resolution || "No resolution recorded."}</p>
          {sel.notes.length > 0 && <><Sec>Internal Notes</Sec>{sel.notes.map((n, i) => <div key={i} style={{ fontSize: 12.5, color: "#374151", padding: "5px 0", borderBottom: "1px solid #F1F5F9" }}><b>{n.name}</b> · {n.time}<div>{n.text}</div></div>)}</>}
        </>}
      </Modal>
    </div>
  );
}
