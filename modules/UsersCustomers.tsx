"use client";
import { useMemo, useState } from "react";
import { customers, Customer } from "@/data/drivers";
import { DataTable, FilterRow, Search, Select } from "@/components/DataTable";
import { SideDrawer, StatusBadge, useToast } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, Metrics, ProfGrid, Row, Sec } from "./shared";
import { StatCard } from "@/components/StatCard";
import { initials, parseAmt } from "@/lib/format";
import type { ModuleProps } from "./registry";

export function UsersCustomers(_: ModuleProps) {
  const notify = useToast();
  const [rows, setRows] = useState(customers);
  const [q, setQ] = useState(""); const [status, setStatus] = useState("All Status");
  const [sel, setSel] = useState<Customer | null>(null);
  const filtered = useMemo(() => rows.filter((u) =>
    (!q || u.name.toLowerCase().includes(q.toLowerCase())) && (status === "All Status" || u.status === status.toLowerCase())
  ), [rows, q, status]);

  return (
    <div>
      <PageHeader title="Users / Customers" sub="92,341 registered users" />
      <Summary>
        <StatCard icon="Users" value="92,341" label="Total Users" />
        <StatCard icon="CircleDot" value="34,127" label="Active (30d)" />
        <StatCard icon="Smartphone" value="1.14L" label="App Installs" />
        <StatCard icon="Ban" value="284" label="Blocked" />
      </Summary>
      <div className="card" style={{ padding: 0 }}>
        <FilterRow>
          <Search value={q} onChange={setQ} placeholder="Search user..." />
          <Select value={status} onChange={setStatus} options={["All Status", "Active", "Inactive", "Blocked"]} />
        </FilterRow>
        <DataTable<Customer>
          rows={filtered} onRowClick={setSel}
          columns={[
            { key: "name", label: "User", render: (u) => <b>{u.name}</b> },
            { key: "phone", label: "Phone" },
            { key: "city", label: "City" },
            { key: "rides", label: "Total Rides" },
            { key: "spent", label: "Spent", render: (u) => <b>{u.spent}</b> },
            { key: "last", label: "Last Active", className: "text-sm text-muted" },
            { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status} /> },
            { key: "x", label: "", render: () => <button className="btn btn-outline btn-xs">View</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Customer Details"
        footer={sel && (sel.status === "blocked"
          ? <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => { setRows(rows.map(r => r === sel ? { ...r, status: "active" } : r)); notify("User unblocked"); setSel(null); }}>Unblock User</button>
          : <button className="btn btn-danger-soft btn-sm" style={{ width: "100%" }} onClick={() => { setRows(rows.map(r => r === sel ? { ...r, status: "blocked" } : r)); notify("User blocked", "danger"); setSel(null); }}>Block User</button>)}>
        {sel && <>
          <DrawerHead avatar={initials(sel.name)} title={sel.name} sub={sel.city} right={<StatusBadge status={sel.status} />} />
          <Metrics items={[[sel.rides, "Rides"], [sel.spent, "Spent"], [sel.rides ? "₹" + Math.round(parseAmt(sel.spent) / sel.rides).toLocaleString("en-IN") : "—", "Avg Fare"]]} />
          <div style={{ padding: "10px 22px 18px" }}>
            <Sec>Profile</Sec>
            <Row k="City">{sel.city}</Row><Row k="Phone">{sel.phone}</Row><Row k="Last Active">{sel.last}</Row>
            <Sec>Ride Summary</Sec>
            <ProfGrid items={[["Total Rides", sel.rides], ["Completed", Math.round(sel.rides * 0.92)], ["Cancelled", sel.rides - Math.round(sel.rides * 0.92)], ["Lifetime Spend", sel.spent]]} />
          </div>
        </>}
      </SideDrawer>
    </div>
  );
}
