"use client";
import { useMemo, useState } from "react";
import { revenueData, REASONS, REASON_ACTION, RevenueRow } from "@/data/revenue";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Banner, Icon } from "@/components/ui";
import { PageHeader, DrawerHead, Metrics, ProfGrid, Row, Sec, Timeline } from "./shared";
import { parseAmt, fmtINR } from "@/lib/format";
import type { ModuleProps } from "./registry";

const MULT: Record<string, number> = { Monthly: 1, Quarterly: 3, Yearly: 12 };
const REASON_DETAIL: Record<string, { since: string; owner: string; steps: string[] }> = {
  "Awaiting Finance Approval": { since: "19 Jun 2026", owner: "Kavya Rao · Finance", steps: ["Finance reviews monthly settlement batch", "Approval recorded in payout ledger", "Settlement moves to Processing"] },
  "Missing Invoice": { since: "18 Jun 2026", owner: "Neha Kulkarni · Compliance", steps: ["Agency uploads the pending GST invoice", "Compliance verifies invoice details", "Payout is queued for the next cycle"] },
  "Bank Details Verification Pending": { since: "17 Jun 2026", owner: "Imran Shaikh · Operations", steps: ["Agency confirms bank account & IFSC", "Penny-drop verification completed", "Account marked verified for payouts"] },
};

export function RevenueCommission({ onNavigate }: ModuleProps) {
  const notify = useToast();
  const [period, setPeriod] = useState("Monthly");
  const [q, setQ] = useState(""); const [city, setCity] = useState("All Cities"); const [st, setSt] = useState("All Status");
  const [sort, setSort] = useState<{ k: string; dir: number } | null>(null);
  const [sel, setSel] = useState<RevenueRow | null>(null);
  const [modal, setModal] = useState<null | "export" | "invoices" | "settlements" | "reason">(null);
  const mult = MULT[period];

  const totals = useMemo(() => { let g = 0, c = 0, r = 0; revenueData.forEach((x) => { g += parseAmt(x.gross); c += parseAmt(x.commission); r += x.rides; }); return { g: g * mult, c: c * mult, r: r * mult }; }, [mult]);
  const filtered = useMemo(() => {
    let list = revenueData.filter((x) => (!q || x.agency.toLowerCase().includes(q.toLowerCase()) || x.city.toLowerCase().includes(q.toLowerCase())) && (city === "All Cities" || x.city === city) && (st === "All Status" || x.status === st.toLowerCase()));
    if (sort) list = [...list].sort((a, b) => ((sort.k === "rides" ? a.rides : parseAmt((a as any)[sort.k])) - (sort.k === "rides" ? b.rides : parseAmt((b as any)[sort.k]))) * sort.dir);
    return list;
  }, [q, city, st, sort]);
  const doSort = (k: string) => setSort(sort?.k === k ? { k, dir: -sort.dir } : { k, dir: -1 });
  const reason = sel ? REASONS[revenueData.indexOf(sel) % 3] : "";

  return (
    <div>
      <PageHeader title="Revenue & Commission" sub={`${period} · 2026`}
        action={<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["Monthly", "Quarterly", "Yearly"].map((p) => <button key={p} className="btn btn-outline btn-sm" style={period === p ? { background: "var(--primary-light)", borderColor: "#C7D2FE", color: "var(--primary)" } : {}} onClick={() => setPeriod(p)}>{p}</button>)}
          <button className="btn btn-outline btn-sm" onClick={() => notify("Exporting revenue report")}>Export</button>
        </div>} />
      <div className="kpi-grid">
        {[["Total Revenue", fmtINR(totals.g)], ["Platform Commission", fmtINR(totals.c)], ["Total Rides", totals.r.toLocaleString("en-IN")], ["Average Ride Value", "₹" + Math.round(totals.g / totals.r).toLocaleString("en-IN")]].map(([l, v]) => (
          <div className="kpi" key={l}><div className="kpi-top"><span className="kpi-label">{l}</span></div><div className="kpi-val">{v}</div></div>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search agency..." />
          <Select value={city} onChange={setCity} options={["All Cities", "Mumbai", "Delhi", "Hyderabad", "Pune", "Ahmedabad", "Chennai"]} />
          <Select value={st} onChange={setSt} options={["All Status", "Paid", "Processing", "Pending"]} />
        </FilterRow>
        <DataTable<RevenueRow>
          rows={filtered} onRowClick={setSel}
          columns={[
            { key: "agency", label: "Agency", render: (r) => <b>{r.agency}</b> },
            { key: "city", label: "City" },
            { key: "rides", label: "Total Rides ⇅", onSort: () => doSort("rides"), render: (r) => (r.rides * mult).toLocaleString("en-IN") },
            { key: "gross", label: "Gross ⇅", onSort: () => doSort("gross"), render: (r) => <b>{fmtINR(parseAmt(r.gross) * mult)}</b> },
            { key: "commission", label: "Commission ⇅", onSort: () => doSort("commission"), render: (r) => <span style={{ color: "var(--primary)", fontWeight: 600 }}>{fmtINR(parseAmt(r.commission) * mult)}</span> },
            { key: "net", label: "Net Payout ⇅", onSort: () => doSort("net"), render: (r) => <span style={{ color: "var(--success)", fontWeight: 700 }}>{fmtINR(parseAmt(r.net) * mult)}</span> },
            { key: "status", label: "Settlement", render: (r) => <StatusBadge status={r.status} /> },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">Details</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Revenue Details" footer={sel && (sel.status === "pending"
        ? <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal("invoices")}>View Invoices</button>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setSel(null); onNavigate("payouts"); }}>Open Payout Management</button>
        </div>
        : <>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setModal("export")}>Download Revenue Report</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal("invoices")}>View Invoices</button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal("settlements")}>{sel.status === "processing" ? "Settlement Timeline" : "Settlement History"}</button>
          </div>
        </>)}>
        {sel && <>
          <DrawerHead avatar={sel.agency.charAt(0)} title={sel.agency} sub={`${sel.city} · 15% commission`} right={<StatusBadge status={sel.status} />} />
          <Metrics items={[[sel.gross, "Gross"], [sel.commission, "Commission"], [sel.net, "Net Payout"]]} />
          <div style={{ padding: "14px 22px 18px" }}>
            {sel.status === "paid" && <Banner tone="green" icon="CircleCheck" title="Settlement Paid" msg="Net payout has been settled to the agency." />}
            {sel.status === "processing" && <Banner tone="blue" icon="Loader" title="Settlement Processing" msg="Payment initiated, awaiting bank confirmation." />}
            {sel.status === "pending" && <Banner tone="yellow" icon="CircleAlert" title="Settlement Pending" msg="Agency payout has not been released yet. Action required." />}
            <Sec>Financial Summary</Sec>
            <Row k="Gross Revenue">{sel.gross}</Row>
            <Row k="Platform Commission"><span style={{ color: "var(--primary)" }}>− {sel.commission}</span></Row>
            <Row k="Net Payout"><span style={{ color: "var(--success)" }}>{sel.net}</span></Row>
            {sel.status === "paid" && <><Sec>Settlement Information</Sec><Row k="Settlement Date">18 Jun 2026</Row></>}
            {sel.status === "processing" && <><Sec>Settlement Information</Sec><Row k="Settlement Initiated">21 Jun 2026</Row><Row k="Expected Completion">24 Jun 2026</Row></>}
            {sel.status === "pending" && <>
              <Sec>Settlement Information</Sec>
              <Row k="Outstanding Amount"><span style={{ color: "var(--warning)" }}>{sel.net}</span></Row>
              <Row k="Due Date">30 Jun 2026</Row>
              <Row k="Settlement Cycle">Jun 2026 · Monthly</Row>
              <Sec>Pending Reason</Sec>
              <div onClick={() => setModal("reason")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "1px solid #FDE68A", background: "#FFFBEB", borderRadius: 10, padding: "11px 13px", cursor: "pointer" }}>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{reason}</div><div className="text-sm text-muted" style={{ marginTop: 2 }}>Tap for details &amp; resolution steps</div></div>
                <Icon name="ChevronRight" size={16} className="text-muted" />
              </div>
              <div style={{ display: "flex", gap: 9, marginTop: 10, fontSize: 12.5 }}>
                <Icon name="Info" size={15} className="text-muted" />
                <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", color: "#9CA3AF" }}>Required Action</div><div style={{ color: "#374151", lineHeight: 1.5, marginTop: 2 }}>{REASON_ACTION[reason]}</div></div>
              </div>
            </>}
            {sel.status !== "pending" && <><Sec>Invoice Summary</Sec><ProfGrid items={[["Total Invoices", Math.max(1, Math.round(sel.rides / 30))], ["Paid Invoices", sel.status === "paid" ? Math.max(1, Math.round(sel.rides / 30)) : Math.round(sel.rides / 30 * 0.75)], ["Pending Invoices", sel.status === "paid" ? 0 : Math.round(sel.rides / 30 * 0.25)], ["Commission Rate", "15%"]]} /></>}
            <Sec>Ride Performance</Sec>
            <ProfGrid items={[["Total Rides", sel.rides.toLocaleString()], ["Completed", Math.round(sel.rides * 0.95).toLocaleString()], ["Cancelled", (sel.rides - Math.round(sel.rides * 0.95)).toLocaleString()], ["Average Fare", "₹" + Math.round(parseAmt(sel.gross) / sel.rides).toLocaleString("en-IN")]]} />
          </div>
        </>}
      </SideDrawer>

      {/* EXPORT */}
      <Modal open={modal === "export"} onClose={() => setModal(null)} title="Download Revenue Report" sub={sel ? sel.agency + " · revenue report" : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        <div className="text-sm text-muted" style={{ marginBottom: 12 }}>Choose a format to export this agency&apos;s revenue report.</div>
        {["PDF", "CSV"].map((f) => <button key={f} className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }} onClick={() => { setModal(null); notify("Revenue report exported (" + f + ")"); }}><span><Icon name={f === "PDF" ? "FileText" : "Table"} size={14} /> Export as {f}</span><Icon name="Download" size={14} /></button>)}
      </Modal>
      {/* INVOICES */}
      <Modal open={modal === "invoices"} onClose={() => setModal(null)} title="Invoice History" wide sub={sel ? sel.agency + " · invoice history" : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <div className="table-wrap"><table>
          <thead><tr><th>Invoice Number</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>{["Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026"].map((m, k) => (
            <tr key={k}>
              <td className="mono" style={{ fontWeight: 600 }}>INV-2026{String(6 - k).padStart(2, "0")}-{(revenueData.indexOf(sel) * 7 + k).toString().padStart(3, "0")}</td>
              <td style={{ fontWeight: 600 }}>{fmtINR(Math.round(parseAmt(sel.gross) * (0.9 + k * 0.03)))}</td>
              <td className="text-sm text-muted">{m}</td>
              <td><StatusBadge status={k === 0 && sel.status !== "paid" ? "pending" : "paid"} /></td>
              <td><button className="btn btn-outline btn-xs" onClick={() => notify("Downloading invoice PDF")}>PDF</button></td>
            </tr>
          ))}</tbody>
        </table></div>}
      </Modal>
      {/* SETTLEMENTS */}
      <Modal open={modal === "settlements"} onClose={() => setModal(null)} title="Settlement History" wide sub={sel ? sel.agency + " · settlement history" : ""}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && <div className="table-wrap"><table>
          <thead><tr><th>Settlement Date</th><th>Amount</th><th>Status</th><th>Transaction Reference</th></tr></thead>
          <tbody>{[{ d: sel.status === "paid" ? "18 Jun 2026" : "Pending", s: sel.status, r: sel.status === "paid" ? "TXN-2026-0061123" : "—" }, { d: "15 May 2026", s: "paid", r: "TXN-2026-0051098" }, { d: "16 Apr 2026", s: "paid", r: "TXN-2026-0041077" }].map((x, k) => (
            <tr key={k}><td className="text-sm">{x.d}</td><td style={{ fontWeight: 600 }}>{fmtINR(Math.round(parseAmt(sel.net) * (1 - k * 0.08)))}</td><td><StatusBadge status={x.s} /></td><td className="text-sm text-muted mono">{x.r}</td></tr>
          ))}</tbody>
        </table></div>}
      </Modal>
      {/* REASON DETAIL */}
      <Modal open={modal === "reason"} onClose={() => setModal(null)} title="Pending Reason" sub={sel ? sel.agency + " · settlement blocked" : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { setModal(null); setSel(null); onNavigate("payouts"); }}>Open Payout Management</button></>}>
        {sel && (() => { const d = REASON_DETAIL[reason]; return <>
          <Banner tone="yellow" icon="CircleAlert" title={reason} msg={REASON_ACTION[reason]} />
          <Row k="Blocked Since">{d.since}</Row>
          <Row k="Required Action">{REASON_ACTION[reason]}</Row>
          <Row k="Assigned Owner">{d.owner}</Row>
          <Sec>Resolution Steps</Sec>
          <Timeline items={d.steps.map((s, i) => ({ title: "Step " + (i + 1), sub: s, active: i === 0 }))} />
        </>; })()}
      </Modal>
    </div>
  );
}
