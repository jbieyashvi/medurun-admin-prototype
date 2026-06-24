"use client";
import { useEffect, useMemo, useState } from "react";
import { onboardingApps as SEED, ALL_DOCS } from "@/data/agencies";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { DocVerification } from "@/components/DocVerification";
import { PageHeader, Summary, DrawerHead, Sec, Row, Timeline } from "./shared";
import { StatCard } from "@/components/StatCard";
import { initials } from "@/lib/format";
import { nowStamp, ActivityEntry } from "@/lib/reviewStore";
import type { ModuleProps } from "./registry";

type App = (typeof SEED)[number];
type DocState = { st: "verified" | "pending" | "reupload" | "rejected"; reason?: string };
type OnbState = { status?: string; reason?: string; note?: string; notes?: string; by?: string; date?: string; docs: Record<string, DocState>; activity: ActivityEntry[] };

const DOC_REASONS: Record<string, string> = { "Ambulance RC": "Image not readable", "NOC Certificate": "Expired document" };
const REUPLOAD_REASONS = ["Incorrect document", "Expired document", "Unreadable upload", "Missing information", "Other"];
const wait = (s: string) => Math.max(0, 22 - parseInt(s));
const DOC_META: Record<string, [string, string, string]> = {
  verified: ["Verified", "Check", "verified"],
  pending: ["Pending Review", "Clock", "pending"],
  reupload: ["Re-upload Required", "TriangleAlert", "reupload"],
  rejected: ["Rejected", "X", "rejected"],
};
const APP_ST: Record<string, [string, string]> = {
  approved: ["Approved", "verified"], rejected: ["Rejected", "rejected"],
  correction: ["Correction Required", "reupload"], flagged: ["Flagged", "review"],
};

function seedDocs(a: App): Record<string, DocState> {
  const o: Record<string, DocState> = {};
  ALL_DOCS.forEach((doc, i) => {
    if (a.status === "flagged" && DOC_REASONS[doc]) o[doc] = { st: "reupload", reason: DOC_REASONS[doc] };
    else if (i < a.docs) o[doc] = { st: "verified" };
    else o[doc] = { st: "pending" };
  });
  return o;
}
const KEY = "medurun-onboarding-reviews";

export function OnboardingReview(_: ModuleProps) {
  const notify = useToast();
  const [store, setStore] = useState<Record<number, OnbState>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setStore(JSON.parse(r)); } catch {} setLoaded(true); }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} }, [store, loaded]);

  const [q, setQ] = useState(""); const [st, setSt] = useState("All Status"); const [city, setCity] = useState("All Cities");
  const [selId, setSelId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [modal, setModal] = useState<null | "doc" | "reupload" | "corrections" | "reject">(null);
  const [activeDoc, setActiveDoc] = useState("");
  const [reason, setReason] = useState(""); const [note, setNote] = useState("");

  const sel = selId === null ? null : SEED.find((a) => a.id === selId) || null;
  const state = (id: number): OnbState => store[id] || { docs: {}, activity: [] };
  const sState = sel ? state(sel.id) : null;
  const docState = (a: App): Record<string, DocState> => { const s = store[a.id]; return s && Object.keys(s.docs).length ? s.docs : seedDocs(a); };

  const dispStatus = (a: App): [string, string] => {
    const s = store[a.id]?.status;
    if (s && APP_ST[s]) return APP_ST[s];
    if (a.status === "flagged") return ["Flagged", "review"];
    if (a.docs < 5) return ["Missing Docs", "review"];
    return ["Pending", "pending"];
  };

  const update = (id: number, fn: (s: OnbState) => OnbState) => setStore((m) => ({ ...m, [id]: fn(state(id)) }));
  const log = (s: OnbState, title: string, sub: string): OnbState => ({ ...s, activity: [{ title, sub: sub + " · by Arjun Mehta", time: nowStamp() }, ...s.activity] });

  const queue = SEED.filter((a) => store[a.id]?.status !== "approved" && store[a.id]?.status !== "rejected" && a.status !== "approved" && a.status !== "rejected");
  const filtered = useMemo(() => queue.filter((a) =>
    (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.contact.toLowerCase().includes(q.toLowerCase()))
    && (st === "All Status" || dispStatus(a)[0] === st) && (city === "All Cities" || a.city === city)
  ), [store, q, st, city]);

  const open = (a: App) => { if (!store[a.id]?.docs || !Object.keys(store[a.id].docs).length) update(a.id, (s) => ({ ...s, docs: seedDocs(a) })); setNotesDraft(store[a.id]?.notes || ""); setSelId(a.id); };

  // per-doc actions
  const setDoc = (doc: string, ds: DocState, actTitle: string, actSub: string) => sel && update(sel.id, (s) => log({ ...s, docs: { ...(Object.keys(s.docs).length ? s.docs : seedDocs(sel)), [doc]: ds } }, actTitle, actSub));
  const markVerified = (doc: string) => setDoc(doc, { st: "verified" }, "Document verified", doc);
  const requestDocCorrection = (doc: string, r: string, n: string) => setDoc(doc, { st: "reupload", reason: r + (n ? " — " + n : "") }, "Correction requested", `${doc}: ${r}`);

  // app actions
  const allVerified = sel ? ALL_DOCS.every((d) => docState(sel)[d]?.st === "verified") : false;
  const approve = () => { if (!sel) return; if (!allVerified) { notify("All required documents must be verified before approval.", "warning"); return; } update(sel.id, (s) => ({ ...log(s, "Agency approved", sel.name), status: "approved" })); notify(`"${sel.name}" approved`); setSelId(null); };
  const submitCorrections = () => { if (!sel || !reason) { notify("Select a correction reason", "warning"); return; } update(sel.id, (s) => ({ ...log(s, "Corrections requested", reason + (note ? " — " + note : "")), status: "correction", reason, note })); setModal(null); setReason(""); setNote(""); notify("Corrections requested", "warning"); };
  const submitReject = () => { if (!sel || !reason.trim()) { notify("Enter a rejection reason", "warning"); return; } update(sel.id, (s) => ({ ...log(s, "Application rejected", reason), status: "rejected", reason })); setModal(null); setReason(""); notify(`"${sel.name}" rejected`, "danger"); setSelId(null); };
  const flag = () => { if (!sel) return; update(sel.id, (s) => ({ ...log(s, "Flagged for manual review", sel.name), status: "flagged" })); notify(`"${sel.name}" flagged for manual review`, "warning"); };
  const saveNotes = () => { if (!sel) return; update(sel.id, (s) => ({ ...s, notes: notesDraft })); notify("Notes saved"); };

  const verifiedCount = sel ? Object.values(docState(sel)).filter((d) => d.st === "verified").length : 0;

  return (
    <div>
      <PageHeader title="Agency Onboarding Review" sub="Review and verify incoming agency applications" />
      <Summary>
        <StatCard icon="Clock" value={queue.filter((a) => !["correction", "flagged"].includes(store[a.id]?.status || "")).length} label="Pending" />
        <StatCard icon="Flag" value={queue.filter((a) => store[a.id]?.status === "flagged" || a.status === "flagged").length} label="Flagged" />
        <StatCard icon="TriangleAlert" value={queue.filter((a) => store[a.id]?.status === "correction").length} label="Correction Required" />
        <StatCard icon="CircleCheck" value={SEED.filter((a) => store[a.id]?.status === "approved").length} label="Approved" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search applications..." />
          <Select value={st} onChange={setSt} options={["All Status", "Pending", "Missing Docs", "Flagged", "Correction Required"]} />
          <Select value={city} onChange={setCity} options={["All Cities", "Pune", "Bangalore", "Jaipur", "Lucknow", "Mumbai", "Nagpur", "Indore"]} />
        </FilterRow>
        <DataTable<App>
          rows={filtered} getKey={(a) => a.id} onRowClick={open}
          columns={[
            { key: "name", label: "Agency", render: (a) => <div><b>{a.name}</b>{store[a.id]?.reason && <div className="text-sm" style={{ color: "#7C3AED" }}>{store[a.id]!.reason}</div>}</div> },
            { key: "city", label: "City" },
            { key: "contact", label: "Contact Person" },
            { key: "phone", label: "Phone", className: "text-sm" },
            { key: "submitted", label: "Submitted", className: "text-sm text-muted" },
            { key: "wait", label: "Waiting", render: (a) => <span className="badge pending">{wait(a.submitted)} days</span> },
            { key: "docs", label: "Documents", render: (a) => `${Object.values(docState(a)).filter((d) => d.st === "verified").length}/5` },
            { key: "status", label: "Status", render: (a) => <StatusBadge status={dispStatus(a)[1]} label={dispStatus(a)[0]} /> },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">Review →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSelId(null)} title="Review Application" footer={sel && <>
        <button className="btn btn-primary btn-sm" style={{ width: "100%" }} disabled={!allVerified} onClick={approve}>Approve Agency</button>
        {!allVerified && <div style={{ fontSize: 11.5, color: "#9CA3AF", textAlign: "center" }}>All required documents must be verified before approval.</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setReason(""); setNote(""); setModal("corrections"); }}>Request Corrections</button>
          <button className="btn btn-danger-soft btn-sm" style={{ flex: 1 }} onClick={() => { setReason(""); setModal("reject"); }}>Reject Application</button>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={flag}>Flag for Manual Review</button>
      </>}>
        {sel && sState && <>
          <DrawerHead avatar={initials(sel.name)} title={sel.name} sub={`${sel.city} · Submitted ${sel.submitted}`} right={<StatusBadge status={dispStatus(sel)[1]} label={dispStatus(sel)[0]} />} />
          <div style={{ padding: "2px 22px 18px" }}>
            {sState.status === "correction" && <><Sec>Correction Required</Sec><Row k="Reason"><span style={{ color: "#7C3AED" }}>{sState.reason}</span></Row></>}
            {sState.status === "rejected" && <><Sec>Rejection</Sec><Row k="Reason"><span style={{ color: "#DC2626" }}>{sState.reason}</span></Row></>}

            <Sec>Application Details</Sec>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              {([["Contact Person", sel.contact], ["Phone", sel.phone], ["City", sel.city], ["Submitted Date", sel.submitted]] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ padding: "9px 0", borderBottom: "1px solid #F1F5F9" }}><div style={{ fontSize: 11, color: "#9CA3AF" }}>{k}</div><div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{v}</div></div>
              ))}
            </div>

            <Sec>Document Review</Sec>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}><Icon name="Shield" size={14} /> {verifiedCount} of {ALL_DOCS.length} documents verified</div>
            <DocVerification
              docs={ALL_DOCS.map((doc) => { const d = docState(sel)[doc] || { st: "pending" as const }; return { name: doc, uploadDate: sel.submitted, status: d.st, reason: d.reason }; })}
              onVerify={markVerified}
              onCorrection={requestDocCorrection}
            />

            <Sec>Internal Review Notes</Sec>
            <textarea className="input" value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Add notes for internal reviewers..." />
            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={saveNotes}>Save Notes</button>

            <Sec>Activity Timeline</Sec>
            <Timeline items={[
              ...sState.activity.map((a) => ({ title: a.title, sub: a.time + " · " + a.sub, active: true })),
              { title: "Documents reviewed", sub: sel.submitted, done: true },
              { title: "Submitted by " + sel.name, sub: sel.submitted, done: true },
            ]} />
          </div>
        </>}
      </SideDrawer>

      {/* REQUEST CORRECTIONS */}
      <Modal open={modal === "corrections"} onClose={() => setModal(null)} title="Request Corrections" sub={sel?.name}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={submitCorrections}>Submit</button></>}>
        <div className="form-group"><label className="label">Correction Reason *</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Select reason</option>{["Incomplete information", "Documents need correction", "Pending verification details", "Other"].map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="form-group"><label className="label">Notes</label><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the corrections required..." /></div>
      </Modal>

      {/* REJECT */}
      <Modal open={modal === "reject"} onClose={() => setModal(null)} title="Reject Application" sub={sel?.name}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger-soft btn-sm" onClick={submitReject}>Reject Application</button></>}>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, marginBottom: 14 }}>You are about to reject <b>{sel?.name}</b>&apos;s onboarding application.</p>
        <div className="form-group"><label className="label">Rejection Reason *</label><textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this application is rejected..." /></div>
      </Modal>
    </div>
  );
}
