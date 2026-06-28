"use client";
import { useMemo, useState } from "react";
import { bookings as SEED, Booking, BOOKING_STATUS_META } from "@/data/bookings";
import { DataTable } from "@/components/DataTable";
import { SideDrawer, StatusBadge, Icon } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, Sec, Row, Timeline } from "./shared";
import { StatCard } from "@/components/StatCard";
import { fmtINR } from "@/lib/format";
import type { ModuleProps } from "./registry";

const PAY_META: Record<Booking["fare"]["paymentStatus"], string> = {
  paid: "paid", pending: "pending", failed: "rejected", refunded: "offboarded",
};
const PAY_LABEL: Record<Booking["fare"]["paymentStatus"], string> = {
  paid: "Paid", pending: "Pending", failed: "Failed", refunded: "Refunded",
};
const PAY_DOT: Record<Booking["fare"]["paymentStatus"], string> = {
  paid: "#059669", pending: "#D97706", failed: "#DC2626", refunded: "#64748B",
};

const uniq = (xs: (string | undefined)[]) => Array.from(new Set(xs.filter(Boolean) as string[]));
const RIDE_TYPES = uniq(SEED.map((b) => b.rideType));
const AMB_TYPES = uniq(SEED.map((b) => b.ambType));
const AGENCIES = uniq(SEED.map((b) => b.agency?.name));
const CITIES = uniq(SEED.map((b) => b.city));

export function BookingLogs(_: ModuleProps) {
  const [q, setQ] = useState("");
  const [st, setSt] = useState("All Status");
  const [range, setRange] = useState("All Time");
  const [rideType, setRideType] = useState("All Ride Types");
  const [ambType, setAmbType] = useState("All Ambulance Types");
  const [agency, setAgency] = useState("All Agencies");
  const [city, setCity] = useState("All Cities");
  const [pay, setPay] = useState("All Payments");
  const [sel, setSel] = useState<Booking | null>(null);

  const counts = useMemo(() => ({
    total: SEED.length,
    ongoing: SEED.filter((b) => b.status === "ongoing").length,
    completed: SEED.filter((b) => b.status === "completed").length,
    cancelled: SEED.filter((b) => b.status === "cancelled").length,
  }), []);

  const filtered = useMemo(() => SEED.filter((b) => {
    const needle = q.trim().toLowerCase();
    const hit = !needle ||
      b.id.toLowerCase().includes(needle) ||
      b.customer.name.toLowerCase().includes(needle) ||
      b.customer.phone.includes(needle);
    const okSt = st === "All Status" || BOOKING_STATUS_META[b.status][0] === st;
    const okRide = rideType === "All Ride Types" || b.rideType === rideType;
    const okAmb = ambType === "All Ambulance Types" || b.ambType === ambType;
    const okAgency = agency === "All Agencies" || b.agency?.name === agency;
    const okCity = city === "All Cities" || b.city === city;
    const okPay = pay === "All Payments" || PAY_LABEL[b.fare.paymentStatus] === pay;
    return hit && okSt && okRide && okAmb && okAgency && okCity && okPay;
  }), [q, st, range, rideType, ambType, agency, city, pay]);

  const openDrawer = (b: Booking) => setSel(b);

  return (
    <div>
      <PageHeader title="Booking Logs" sub="View and track every booking across the platform in one place." />
      <Summary>
        <StatCard icon="ClipboardList" value={counts.total} label="Total Bookings" />
        <StatCard icon="Activity" value={counts.ongoing} label="Ongoing" />
        <StatCard icon="CircleCheck" value={counts.completed} label="Completed" />
        <StatCard icon="CircleX" value={counts.cancelled} label="Cancelled" />
      </Summary>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap", padding: "14px 16px 0", overflowX: "auto" }}>
          <input className="filter-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Booking ID, customer, phone..."
            style={{ height: 34, fontSize: 12.5, flex: "0 1 210px", minWidth: 150 }} />
          {([
            [st, setSt, ["All Status", "Ongoing", "Scheduled", "Completed", "Cancelled", "Issue Raised", "Payment Pending"]],
            [range, setRange, ["All Time", "Today", "Last 7 Days", "Last 30 Days"]],
            [rideType, setRideType, ["All Ride Types", ...RIDE_TYPES]],
            [ambType, setAmbType, ["All Ambulance Types", ...AMB_TYPES]],
            [agency, setAgency, ["All Agencies", ...AGENCIES]],
            [city, setCity, ["All Cities", ...CITIES]],
            [pay, setPay, ["All Payments", "Paid", "Pending", "Failed", "Refunded"]],
          ] as [string, (v: string) => void, string[]][]).map(([val, setter, opts], i) => (
            <select key={i} className="filter-input" value={val} onChange={(e) => setter(e.target.value)}
              style={{ height: 34, fontSize: 12.5, padding: "0 20px 0 8px", flex: "0 1 auto", maxWidth: 122 }}>
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
        <DataTable<Booking>
          rows={filtered} getKey={(b) => b.id} onRowClick={openDrawer}
          columns={[
            { key: "id", label: "Booking ID", render: (b) => <span className="mono" style={{ fontWeight: 600 }}>{b.id}</span> },
            { key: "customer", label: "Customer", render: (b) => <div style={{ minWidth: 0, maxWidth: 140 }}><div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.customer.name}</div><div className="text-sm text-muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.customer.phone} · {b.rideType}</div></div> },
            { key: "route", label: "Route", render: (b) => (
              <div style={{ minWidth: 0, maxWidth: 160 }}>
                <div className="text-sm" style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={b.pickup}>
                  <Icon name="MapPin" size={12} className="text-muted" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{b.pickup}</span>
                </div>
                <div className="text-sm" style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2, color: "#64748B" }} title={b.drop}>
                  <Icon name="ArrowDown" size={12} className="text-muted" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{b.drop}</span>
                </div>
              </div>
            ) },
            { key: "driverAgency", label: "Driver & Agency", render: (b) => <div style={{ minWidth: 0, maxWidth: 140 }}><div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.driver.name}</div><div className="text-sm text-muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.agency ? b.agency.name : "—"}</div></div> },
            { key: "status", label: "Status", render: (b) => (
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                <StatusBadge status={BOOKING_STATUS_META[b.status][1]} label={BOOKING_STATUS_META[b.status][0]} />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: PAY_DOT[b.fare.paymentStatus], flexShrink: 0 }} />
                  {PAY_LABEL[b.fare.paymentStatus]}
                </span>
              </div>
            ) },
            { key: "date", label: "Date", render: (b) => { const [d, ...t] = b.bookedAt.split(" · "); const time = t.join(" · ").replace(/\s*\(scheduled\)/i, "").trim(); return <div style={{ whiteSpace: "nowrap" }}><div style={{ fontWeight: 500 }}>{d}</div><div className="text-sm text-muted">{time || "—"}</div></div>; } },
            { key: "x", label: "", render: (b) => <button className="btn btn-outline btn-xs" onClick={(e) => { e.stopPropagation(); openDrawer(b); }}>View →</button> },
          ]}
        />
      </div>

      <SideDrawer open={!!sel} onClose={() => setSel(null)} title="Booking Details">
        {sel && <>
          <DrawerHead
            avatar={<Icon name="Route" size={18} />}
            title={sel.id}
            sub={`${sel.customer.name} · ${sel.bookedAt}`}
            right={<StatusBadge status={BOOKING_STATUS_META[sel.status][1]} label={BOOKING_STATUS_META[sel.status][0]} />}
          />
          <div style={{ padding: "10px 22px 22px" }}>
            <div style={{ paddingBottom: 22 }}>
              <Sec>Booking</Sec>
              <Row k="Booking ID"><span className="mono">{sel.id}</span></Row>
              <Row k="Booking Status"><StatusBadge status={BOOKING_STATUS_META[sel.status][1]} label={BOOKING_STATUS_META[sel.status][0]} /></Row>
              <Row k="Booking Date & Time">{sel.bookedAt}</Row>
              <Row k="Ride Type">{sel.rideType}</Row>
              <Row k="Ambulance Type">{sel.ambType}</Row>
              <Row k="City">{sel.city}</Row>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 6, paddingBottom: 22 }}>
              <Sec>Ride Timeline</Sec>
              <Timeline items={sel.timeline.map((t) => ({ title: t.label, sub: t.time || "Pending", done: t.done, active: t.active }))} />
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 6, paddingBottom: 22 }}>
              <Sec>Locations</Sec>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 11 }}>
                <div className="modal-x" style={{ width: 30, height: 30, background: "var(--primary-light)", border: "none", color: "var(--primary)" }}><Icon name="MapPin" size={14} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".5px" }}>Pickup Location</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{sel.pickup}</div>
                </div>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 11 }}>
                <div className="modal-x" style={{ width: 30, height: 30, background: "#FEF2F2", border: "none", color: "#DC2626" }}><Icon name="Flag" size={14} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".5px" }}>Drop Location</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{sel.drop}</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 6, paddingBottom: 22 }}>
              <Sec>Fare Details</Sec>
              <Row k="Base Fare">{fmtINR(sel.fare.base)}</Row>
              <Row k="Distance Fare">{fmtINR(sel.fare.distance)}</Row>
              {sel.fare.waiting !== undefined && sel.fare.waiting > 0 && <Row k="Waiting Charges">{fmtINR(sel.fare.waiting)}</Row>}
              {sel.fare.discount !== undefined && sel.fare.discount > 0 && <Row k="Discount"><span style={{ color: "#059669" }}>− {fmtINR(sel.fare.discount)}</span></Row>}
              <Row k="Taxes">{fmtINR(sel.fare.taxes)}</Row>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "12px 14px", background: "var(--primary-light)", border: "1px solid #C7D2FE", borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: ".5px" }}>Final Fare</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{sel.fare.method} · <StatusBadge status={PAY_META[sel.fare.paymentStatus]} label={PAY_LABEL[sel.fare.paymentStatus]} /></div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", letterSpacing: "-.3px" }}>{fmtINR(sel.fare.final)}</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {([
                ["User", "Customer", sel.customer.name, [["Phone", sel.customer.phone], ...(sel.customer.email ? [["Email", sel.customer.email]] : [])] as [string, string][]],
                ["UserCheck", "Driver", sel.driver.name, [["Phone", sel.driver.phone], ["Driver ID", sel.driver.driverId]] as [string, string][]],
                ...(sel.agency ? [["Building2", "Agency", sel.agency.name, [["Contact", sel.agency.contact], ["Agency ID", sel.agency.agencyId]] as [string, string][]] as [string, string, string, [string, string][]]] : []),
              ] as [string, string, string, [string, string][]][]).map(([icon, role, name, lines]) => (
                <div key={role} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12 }}>
                  <div className="modal-x" style={{ width: 36, height: 36, background: "var(--primary-light)", border: "none", color: "var(--primary)", flexShrink: 0 }}><Icon name={icon} size={16} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 600 }}>{role}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{name}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px", marginTop: 10 }}>
                      {lines.map(([k, v]) => (
                        <div key={k} style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 10.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".4px" }}>{k}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={v}>{k === "Driver ID" || k === "Agency ID" ? <span className="mono">{v}</span> : v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>}
      </SideDrawer>
    </div>
  );
}
