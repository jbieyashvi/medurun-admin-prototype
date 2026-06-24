"use client";
import { useMemo, useState } from "react";
import { payoutsData as SEED, FAIL_REASONS, Payout } from "@/data/payouts";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, Modal, StatusBadge, useToast, Banner, Icon } from "@/components/ui";
import { PageHeader, DrawerHead, Metrics, Row, Sec, ProfGrid } from "./shared";
import { parseAmt, fmtINR } from "@/lib/format";
import type { ModuleProps } from "./registry";

const BANNERS: Record<string, [string, string, string, string]> = {
  pending: ["yellow", "CircleAlert", "Payout Pending", "Awaiting finance approval before release."],
  processing: ["blue", "Loader", "Transfer Processing", "Awaiting bank confirmation."],
  paid: ["green", "CircleCheck", "Payout Completed", "Funds settled successfully."],
  failed: ["red", "CircleX", "Transfer Failed", "Action required."],
};

export function PayoutManagement(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState<Payout[]>(SEED);
  const [q, setQ] = useState(""); const [city, setCity] = useState("All Cities"); const [st, setSt] = useState("All Status");
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const [modal, setModal] = useState<null | "txn" | "invoices" | "bank">(null);
  const [bankName, setBankName] = useState(""); const [bankAcc, setBankAcc] = useState(""); const [bankIfsc, setBankIfsc] = useState("");
  const sel = selIdx === null ? null : rows[selIdx];

  const filtered = useMemo(() => rows.map((p, i) => ({ p, i })).filter(({ p }) =>
    (!q || p.agency.toLowerCase().includes(q.toLowerCase()))
    && (city === "All Cities" || p.city === city)
    && (st === "All Status" || p.status === st.toLowerCase())
  ), [rows, q, city, st]);

  const setStatus = (i: number, status: Payout["status"], msg: string, tone: any = "success") => {
    setRows(rows.map((r, k) => (k === i ? { ...r, status } : r))); notify(msg, tone);
  };
  const txn = (i: number) => "TXN-2026-00" + (611 + i) + "2";
  const openBank = () => { if (!sel) return; const m = sel.bank.match(/(\w+)\s*••(\d+)/); setBankName(m?.[1] || ""); setBankAcc("000000" + (m?.[2] || "")); setBankIfsc((m?.[1] || "BANK").toUpperCase().slice(0, 4) + "0" + (2000 + (selIdx || 0) * 7)); setModal("bank"); };
  const saveBank = () => { if (selIdx === null || !bankName || bankAcc.length < 4) { notify("Enter valid bank details", "warning"); return; } setRows(rows.map((r, k) => (k === selIdx ? { ...r, bank: bankName.toUpperCase().slice(0, 5) + " ••" + bankAcc.slice(-4) } : r))); setModal(null); notify("Bank details updated"); };

  return (
    <div>
      <PageHeader title="Payout Management" sub="June 2026 · ₹18.4L pending"
        action={<div style={{ display: "flex", gap: 8 }}>
          <select className="filter-input"><option>June 2026</option><option>May 2026</option></select>
          <button className="btn btn-outline btn-sm" onClick={() => notify("Exporting payout report")}>Export Report</button>
        </div>} />
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search agency..." />
          <Select value={city} onChange={setCity} options={["All Cities", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Chennai"]} />
          <Select value={st} onChange={setSt} options={["All Status", "Pending", "Processing", "Paid", "Failed"]} />
        </FilterRow>
        <DataTable
          rows={filtered} onRowClick={({ i }) => setSelIdx(i)}
          columns={[
            { key: "agency", label: "Agency", render: ({ p }: any) => <b>{p.agency}</b> },
            { key: "city", label: "City", render: ({ p }: any) => p.city },
            { key: "gross", label: "Gross Earnings", render: ({ p }: any) => p.gross },
            { key: "commission", label: "Commission", render: ({ p }: any) => <span style={{ color: "var(--primary)", fontWeight: 600 }}>{p.commission}</span> },
            { key: "net", label: "Net Payable", render: ({ p }: any) => <span style={{ color: "var(--success)", fontWeight: 700 }}>{p.net}</span> },
            { key: "bank", label: "Bank Account", render: ({ p }: any) => <span className="text-sm text-muted">{p.bank}</span> },
            { key: "status", label: "Status", render: ({ p }: any) => <StatusBadge status={p.status} /> },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">Manage →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSelIdx(null)} title="Payout Operations" footer={sel && selIdx !== null && (() => {
        const i = selIdx;
        if (sel.status === "pending") return <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setStatus(i, "processing", "Approved — transfer started")}>Approve &amp; Start Transfer</button>;
        if (sel.status === "processing") return <>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setStatus(i, "paid", "Transfer confirmed — payout paid")}>Confirm Transfer</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal("txn")}>Transaction Ref</button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setStatus(i, "processing", "Retrying transfer", "warning")}>Retry Transfer</button>
          </div>
        </>;
        if (sel.status === "failed") return <>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setStatus(i, "processing", "Retrying transfer", "warning")}>Retry Transfer</button>
          <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={openBank}>Update Bank Details</button>
        </>;
        return <>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => notify("Downloading receipt")}>Download Receipt</button>
          <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => setModal("invoices")}>Invoice Bundle</button>
        </>;
      })()}>
        {sel && selIdx !== null && (() => {
          const [tone, ic, bt, bm] = BANNERS[sel.status];
          return <>
            <DrawerHead avatar={sel.agency.charAt(0)} title={sel.agency} sub={`${sel.city} · ${sel.bank}`} right={<StatusBadge status={sel.status} />} />
            <Metrics items={[[sel.gross, "Gross"], [sel.commission, "Commission"], [sel.net, "Net Payable"]]} />
            <div style={{ padding: "14px 22px 18px" }}>
              <Banner tone={tone} icon={ic} title={bt} msg={bm} />
              <Sec>{sel.status === "failed" ? "Failure Details" : sel.status === "paid" ? "Settlement Details" : sel.status === "processing" ? "Transfer Details" : "Payout Details"}</Sec>
              {sel.status === "failed" && <><Row k="Failure Reason"><span style={{ color: "#DC2626" }}>{FAIL_REASONS[selIdx % 4]}</span></Row><Row k="Last Attempt">21 Jun 2026 · 02:14 PM</Row></>}
              {sel.status === "paid" && <Row k="Settlement Date">18 Jun 2026</Row>}
              {sel.status === "processing" && <Row k="Transfer Initiated">21 Jun 2026 · 02:14 PM</Row>}
              {(sel.status === "processing" || sel.status === "paid") && <Row k="Transaction Reference"><span className="mono">{txn(selIdx)}</span></Row>}
              <Row k="Net Payable"><span style={{ color: "var(--success)" }}>{sel.net}</span></Row>
              <Row k="Bank Account"><span className="mono">{sel.bank}</span></Row>
              <Row k="Settlement Cycle">Jun 2026 · Monthly</Row>
            </div>
          </>;
        })()}
      </SideDrawer>

      {/* TXN REF */}
      <Modal open={modal === "txn"} onClose={() => setModal(null)} title="Transaction Reference" sub={sel?.agency}
        footer={<button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>}>
        {sel && selIdx !== null && <ProfGrid items={[["Reference ID", txn(selIdx)], ["UTR Number", "HDFCN" + (52600000 + selIdx * 131)], ["Initiated", "21 Jun 2026 · 02:14 PM"], ["Amount", sel.net], ["Mode", "NEFT"], ["Status", sel.status]]} />}
      </Modal>
      {/* INVOICE BUNDLE */}
      <Modal open={modal === "invoices"} onClose={() => setModal(null)} title="Invoice Bundle" wide sub={sel ? sel.agency + " · linked invoices" : ""}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button><button className="btn btn-primary btn-sm" onClick={() => notify("Downloading invoice bundle (ZIP)")}>Download All</button></>}>
        {sel && selIdx !== null && <div className="table-wrap"><table>
          <thead><tr><th>Invoice Number</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {["Jun 2026", "May 2026", "Apr 2026", "Mar 2026"].map((m, k) => (
              <tr key={k}>
                <td className="mono" style={{ fontWeight: 600 }}>INV-2026{String(6 - k).padStart(2, "0")}-{(selIdx * 7 + k).toString().padStart(3, "0")}</td>
                <td style={{ fontWeight: 600 }}>{fmtINR(Math.round(parseAmt(sel.gross) * (0.9 + k * 0.03)))}</td>
                <td className="text-sm text-muted">{m}</td>
                <td><StatusBadge status="paid" /></td>
                <td><button className="btn btn-outline btn-xs" onClick={() => notify("Downloading invoice PDF")}>PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>}
      </Modal>
      {/* UPDATE BANK */}
      <Modal open={modal === "bank"} onClose={() => setModal(null)} title="Update Bank Details" sub={sel?.agency}
        footer={<><button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveBank}>Save &amp; Re-verify</button></>}>
        <div className="form-group"><label className="label">Bank Name</label><input className="input" value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>
        <div className="form-group"><label className="label">Account Number</label><input className="input" value={bankAcc} onChange={(e) => setBankAcc(e.target.value)} /></div>
        <div className="form-group"><label className="label">IFSC Code</label><input className="input" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} /></div>
      </Modal>
    </div>
  );
}
