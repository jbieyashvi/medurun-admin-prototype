"use client";
import { useEffect, useMemo, useState } from "react";
import { documents as seed, DOC_ST, daysLeftLabel, Doc } from "@/data/documents";
import { getUploadedDocs, uploadedToDoc } from "@/lib/docExpiry";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, Icon, useToast } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Row, Sec } from "./shared";
import { StatCard } from "@/components/StatCard";
import type { ModuleProps } from "./registry";

const ENTITY_NAV: Record<Doc["ownerType"], string> = { Driver: "drivers", Agency: "agencies", Ambulance: "ambulance-q" };
const DAYS_COLOR: Record<Doc["status"], string> = { expired: "#DC2626", expiring7: "#EA580C", expiring30: "#A16207", valid: "#059669" };

export function DocumentExpiry({ onNavigate }: ModuleProps) {
  const notify = useToast();
  // Admin-uploaded docs (from onboarding flows) feed in with live status computed from their expiry date.
  const [uploaded, setUploaded] = useState<Doc[]>([]);
  useEffect(() => { setUploaded(getUploadedDocs().map(uploadedToDoc)); }, []);
  const rows = useMemo(() => [...uploaded, ...seed], [uploaded]);
  const [q, setQ] = useState(""); const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Status"); const [city, setCity] = useState("All Cities");
  const [sel, setSel] = useState<Doc | null>(null);
  const [preview, setPreview] = useState(false);

  const filtered = useMemo(() => rows.filter((d) =>
    (!q || d.name.toLowerCase().includes(q.toLowerCase()) || d.owner.toLowerCase().includes(q.toLowerCase()) || d.number.toLowerCase().includes(q.toLowerCase()))
    && (type === "All Types" || d.ownerType === type)
    && (status === "All Status" || DOC_ST[d.status] === status)
    && (city === "All Cities" || d.city === city)
  ), [rows, q, type, status, city]);

  const counts = {
    expired: rows.filter((d) => d.status === "expired").length,
    seven: rows.filter((d) => d.status === "expiring7").length,
    thirty: rows.filter((d) => d.status === "expiring30").length,
    followUp: rows.filter((d) => d.followUp).length,
  };

  const openEntity = (d: Doc) => { onNavigate(ENTITY_NAV[d.ownerType]); };

  return (
    <div>
      <PageHeader title="Document Expiry" sub="Track document expiry, compliance status, and upcoming renewals across the platform." />
      <Summary>
        <StatCard icon="CircleX" value={counts.expired} label="Expired Documents" />
        <StatCard icon="Clock" value={counts.seven} label="Expiring in 7 Days" />
        <StatCard icon="CalendarClock" value={counts.thirty} label="Expiring in 30 Days" />
        <StatCard icon="BellRing" value={counts.followUp} label="Follow-ups Pending" />
      </Summary>

      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search document, owner, or number..." />
          <Select value={type} onChange={setType} options={["All Types", "Driver", "Ambulance", "Agency"]} />
          <Select value={status} onChange={setStatus} options={["All Status", "Expired", "Expiring in 7 Days", "Expiring in 30 Days", "Valid"]} />
          <Select value={city} onChange={setCity} options={["All Cities", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"]} />
        </FilterRow>
        <DataTable<Doc>
          rows={filtered} onRowClick={(d) => setSel(d)}
          columns={[
            { key: "name", label: "Document Name", render: (d) => <b>{d.name}</b> },
            { key: "ownerType", label: "Entity Type" },
            { key: "owner", label: "Owner / Entity Name" },
            { key: "number", label: "Document Number", className: "text-sm mono" },
            { key: "expiry", label: "Expiry Date", render: (d) => <span style={d.status === "expired" ? { color: "#DC2626", fontWeight: 600 } : { color: "var(--muted)" }}>{d.expiry}</span> },
            { key: "days", label: "Days Left", render: (d) => <span style={{ color: DAYS_COLOR[d.status], fontWeight: 600 }}>{daysLeftLabel(d.days)}</span> },
            { key: "status", label: "Status", render: (d) => <span className={`badge ${d.status}`}>{DOC_ST[d.status]}</span> },
            { key: "updated", label: "Last Updated", className: "text-sm text-muted" },
            { key: "x", label: "Action", render: () => <button className="btn btn-outline btn-xs">View →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Document Details"
        footer={sel && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-outline btn-sm" style={{ flex: "1 1 calc(50% - 4px)" }} onClick={() => setPreview(true)}>View Document</button>
            <button className="btn btn-outline btn-sm" style={{ flex: "1 1 calc(50% - 4px)" }} onClick={() => notify("Document downloaded successfully.")}>Download</button>
            <button className="btn btn-outline btn-sm" style={{ flex: "1 1 calc(50% - 4px)" }} onClick={() => notify("Renewal reminder sent successfully.")}>Send Reminder</button>
            <button className="btn btn-primary btn-sm" style={{ flex: "1 1 calc(50% - 4px)" }} onClick={() => openEntity(sel)}>Open Related Entity</button>
          </div>
        )}>
        {sel && <>
          <DrawerHead avatar="📄" title={sel.name} sub={`${sel.ownerType} · ${sel.owner}`} right={<span className={`badge ${sel.status}`}>{DOC_ST[sel.status]}</span>} />
          <div style={{ padding: "10px 22px 18px" }}>
            <Sec>Overview</Sec>
            <ProfGrid items={[
              ["Document Name", sel.name],
              ["Owner", sel.owner],
              ["Entity Type", sel.ownerType],
              ["Document Number", <span className="mono" key="n">{sel.number}</span>],
              ["Issue Date", sel.issue],
              ["Expiry Date", sel.expiry],
              ["Days Remaining", <span style={{ color: DAYS_COLOR[sel.status], fontWeight: 600 }} key="d">{daysLeftLabel(sel.days)}</span>],
              ["Status", <span className={`badge ${sel.status}`} key="s">{DOC_ST[sel.status]}</span>],
              ["Uploaded By", sel.by],
              ["Uploaded On", sel.on],
            ]} />
            <Sec>Association</Sec>
            <Row k={`Associated ${sel.ownerType}`}>{sel.assoc}</Row>
            <Row k="Associated Agency">{sel.agency}</Row>
          </div>
        </>}
      </SideDrawer>

      {/* VIEW DOCUMENT PREVIEW (read-only) */}
      <Modal open={preview} onClose={() => setPreview(false)} title={sel?.name || "Document"} sub="Document preview"
        footer={<><button className="btn btn-outline btn-sm" onClick={() => notify("Document downloaded successfully.")}>Download</button><button className="btn btn-primary btn-sm" onClick={() => setPreview(false)}>Close</button></>}>
        {sel && <>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "#FAFBFC", height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8", marginBottom: 14 }}>
            <Icon name="FileText" size={46} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{sel.name.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf</div>
            <div style={{ fontSize: 11.5 }}>PDF · 1 page · 2.4 MB</div>
          </div>
          <div className="stat-row"><span className="k">Document Number</span><span style={{ fontWeight: 600 }} className="mono">{sel.number}</span></div>
          <div className="stat-row"><span className="k">Expiry Date</span><span style={{ fontWeight: 600 }}>{sel.expiry}</span></div>
          <div className="stat-row"><span className="k">Status</span><span className={`badge ${sel.status}`}>{DOC_ST[sel.status]}</span></div>
        </>}
      </Modal>
    </div>
  );
}
