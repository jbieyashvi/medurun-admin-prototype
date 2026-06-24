"use client";
import { useMemo, useState } from "react";
import { gpsVehicles, GPS_ST, GpsVehicle } from "@/data/ambulances";
import { SideDrawer, Modal, Icon, useToast } from "@/components/ui";
import { PageHeader, Summary, DrawerHead, ProfGrid, Sec, Row } from "./shared";
import { StatCard } from "@/components/StatCard";
import type { ModuleProps } from "./registry";

const COLOR: Record<string, string> = { available: "#10B981", onride: "#635BFF", offline: "#94A3B8", sos: "#EF4444" };
const onride = (v: GpsVehicle) => v.status === "onride" || v.status === "sos";

export function GPSTracking(_: ModuleProps) {
  const notify = useToast();
  const [q, setQ] = useState(""); const [st, setSt] = useState("All Status");
  const [sel, setSel] = useState<GpsVehicle | null>(null);
  const [view, setView] = useState<"vehicle" | "driver" | "ambulance">("vehicle");
  const [modal, setModal] = useState<null | "ride" | "call">(null);

  const filtered = useMemo(() => gpsVehicles.filter((v) =>
    (!q || v.reg.toLowerCase().includes(q.toLowerCase()) || v.driver.toLowerCase().includes(q.toLowerCase()))
    && (st === "All Status" || GPS_ST[v.status] === st)
  ), [q, st]);

  const openVehicle = (v: GpsVehicle) => { setSel(v); setView("vehicle"); };
  const idx = sel ? gpsVehicles.indexOf(sel) : 0;

  return (
    <div>
      <PageHeader title="GPS Tracking" sub="Live location of online ambulances and drivers" />
      <Summary>
        <StatCard icon="Ambulance" value={gpsVehicles.filter((v) => v.status !== "offline").length} label="Online Ambulances" />
        <StatCard icon="Navigation" value={gpsVehicles.filter((v) => v.status === "onride").length} label="On Ride" />
        <StatCard icon="CircleCheck" value={gpsVehicles.filter((v) => v.status === "available").length} label="Available" />
        <StatCard icon="WifiOff" value={gpsVehicles.filter((v) => v.status === "offline").length} label="Offline / No Signal" />
      </Summary>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, alignItems: "start" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", height: 600, background: "#EEF1F5", borderRadius: 14 }}>
            <svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <g stroke="#DBE0E7" strokeWidth="14" fill="none" strokeLinecap="round">
                <path d="M-20 120 H820" /><path d="M-20 300 H820" /><path d="M-20 460 H820" />
                <path d="M160 -20 V580" /><path d="M400 -20 V580" /><path d="M620 -20 V580" />
              </g>
              <g fill="#E6EAF0">
                <rect x="200" y="150" width="150" height="120" rx="4" /><rect x="440" y="150" width="140" height="120" rx="4" />
                <rect x="200" y="330" width="150" height="100" rx="4" /><rect x="440" y="330" width="140" height="100" rx="4" />
              </g>
            </svg>
            {filtered.map((v) => (
              <button key={v.reg} title={v.reg} onClick={() => openVehicle(v)} style={{ position: "absolute", left: `${v.x}%`, top: `${v.y}%`, transform: "translate(-50%,-50%)", background: "none", border: "none", cursor: "pointer", zIndex: 2 }}>
                <span style={{ display: "block", width: 16, height: 16, borderRadius: "50%", border: "2.5px solid #fff", boxShadow: "0 1px 4px rgba(17,24,39,.25)", background: COLOR[v.status] }} />
              </button>
            ))}
            <div style={{ position: "absolute", left: 14, bottom: 14, background: "#fff", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 12px", display: "flex", gap: 14, fontSize: 11.5, color: "#475569" }}>
              {Object.entries({ Available: "available", "On Ride": "onride", Offline: "offline", "SOS / Issue": "sos" }).map(([l, k]) => (
                <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: "50%", background: COLOR[k] }} />{l}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 0, maxHeight: 600, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 14px 0" }}>
            <input className="filter-input" style={{ width: "100%" }} placeholder="Search ambulance, driver..." value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="filter-input" style={{ width: "100%", marginTop: 10 }} value={st} onChange={(e) => setSt(e.target.value)}>
              {["All Status", "Available", "On Ride", "Offline", "SOS / Issue"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ overflowY: "auto", padding: 8, marginTop: 10, borderTop: "1px solid var(--border)" }}>
            {filtered.map((v) => (
              <div key={v.reg} onClick={() => openVehicle(v)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 10px", borderRadius: 9, cursor: "pointer" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: COLOR[v.status], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>{v.reg}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{v.driver} · {v.city}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: COLOR[v.status] }}>{GPS_ST[v.status]}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{v.updated}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VEHICLE DRAWER */}
      <SideDrawer open={!!sel && view === "vehicle"} onClose={() => setSel(null)} title="Vehicle Details"
        footer={sel && <>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} disabled={!onride(sel)} onClick={() => setModal("ride")}><Icon name="Navigation" size={14} /> View Ride</button>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".6px", color: "#9CA3AF" }}>Profiles</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setView("driver")}><Icon name="User" size={14} /> View Driver Profile</button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setView("ambulance")}><Icon name="Ambulance" size={14} /> View Ambulance Profile</button>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".6px", color: "#DC2626" }}>Emergency</div>
          <button className="btn btn-danger-soft btn-sm" style={{ width: "100%" }} onClick={() => setModal("call")}><Icon name="Phone" size={14} /> Call Driver</button>
        </>}>
        {sel && <>
          <DrawerHead avatar={<Icon name="Ambulance" size={18} />} title={sel.reg} sub={`${sel.agency} · ${sel.type}`} right={<span style={{ fontSize: 12.5, fontWeight: 600, color: COLOR[sel.status] }}>{GPS_ST[sel.status]}</span>} />
          <div style={{ padding: "10px 22px 18px" }}>
            <Sec>Vehicle</Sec>
            <ProfGrid items={[["Ambulance Number", sel.reg], ["Type", sel.type], ["Agency", sel.agency], ["Current Status", GPS_ST[sel.status]]]} />
            <Sec>Driver</Sec>
            <ProfGrid items={[["Driver Name", sel.driver], ["Driver Phone", sel.phone]]} />
            <Sec>Location</Sec>
            <Row k="Current Location">{sel.location}</Row>
            <Row k="Last Updated">{sel.updated}</Row>
            <Sec>Active Ride</Sec>
            {onride(sel) ? <><Row k="Ride ID">{sel.rideId}</Row><Row k="Booking ID">{sel.booking}</Row><Row k="Customer">{sel.customer}</Row></>
              : <div className="text-sm text-muted">No active ride — vehicle is {GPS_ST[sel.status].toLowerCase()}.</div>}
          </div>
        </>}
      </SideDrawer>

      {/* DRIVER PROFILE DRAWER */}
      <SideDrawer open={!!sel && view === "driver"} onClose={() => setView("vehicle")} title="Driver Profile"
        footer={sel && <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => setView("vehicle")}>Back to Vehicle</button>}>
        {sel && <>
          <DrawerHead avatar={sel.driver.charAt(0)} title={sel.driver} sub={`${sel.agency} · ${sel.city}`} right={<span className="badge active">Active</span>} />
          <div style={{ padding: "10px 22px 18px" }}>
            <Sec>Driver Information</Sec>
            <ProfGrid items={[["Name", sel.driver], ["Phone", sel.phone], ["Agency", sel.agency], ["City", sel.city], ["License", "GPS-2024-" + (1000 + idx * 7)], ["Experience", (3 + (idx % 7)) + " years"]]} />
            <Sec>Documents</Sec>
            {["Driving License", "Aadhaar Card", "Medical Certificate", "Police Verification"].map((d) => (
              <div key={d} style={{ fontSize: 13, padding: "7px 0", borderBottom: "1px solid #F1F5F9" }}>{d} · <span style={{ color: "var(--success)" }}>Verified</span></div>
            ))}
            <Sec>Recent Activity</Sec>
            <div className="text-sm text-muted">Completed ride · {sel.city} · 2 hours ago</div>
          </div>
        </>}
      </SideDrawer>

      {/* AMBULANCE PROFILE DRAWER */}
      <SideDrawer open={!!sel && view === "ambulance"} onClose={() => setView("vehicle")} title="Ambulance Profile"
        footer={sel && <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => setView("vehicle")}>Back to Vehicle</button>}>
        {sel && <>
          <DrawerHead avatar={<Icon name="Ambulance" size={18} />} title={sel.reg} sub={`${sel.agency} · ${sel.type}`} right={<span className="badge verified">Operational</span>} />
          <div style={{ padding: "10px 22px 18px" }}>
            <Sec>Ambulance Details</Sec>
            <ProfGrid items={[["Ambulance Number", sel.reg], ["Type", sel.type], ["Agency", sel.agency], ["City", sel.city], ["Verification", "Approved"], ["Fleet Status", GPS_ST[sel.status]]]} />
            <Sec>Operations</Sec>
            <Row k="Equipment">{sel.type === "ICU" ? "Critical care equipped" : sel.type === "ALS" ? "Advanced life support" : "Basic life support"}</Row>
            <Row k="GPS Device"><span className="mono">GPS-{1000 + idx * 7}</span></Row>
            <Row k="Last Service">04 Jun 2026</Row>
            <Row k="Current Location">{sel.location}</Row>
          </div>
        </>}
      </SideDrawer>

      {/* RIDE MODAL */}
      <Modal open={modal === "ride"} onClose={() => setModal(null)} title="Ride Details" sub={sel ? sel.rideId + " · " + sel.customer : ""}
        footer={<>
          <button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Close</button>
          <button className="btn btn-outline btn-sm" onClick={() => notify("Opening customer " + sel?.customer)}><Icon name="User" size={14} /> View Customer</button>
          <button className="btn btn-primary btn-sm" onClick={() => notify("Tracking live route")}><Icon name="Route" size={14} /> Track Live Route</button>
        </>}>
        {sel && <ProfGrid items={[["Ride ID", sel.rideId], ["Booking ID", sel.booking], ["Customer", sel.customer], ["Customer Phone", sel.phone], ["Driver", sel.driver], ["Ambulance", sel.reg], ["Pickup", sel.location], ["Destination", "City General Hospital"], ["Fare", "₹2,140"], ["Start Time", "14:32"], ["Estimated Arrival", "14:48 · ~6 min away"], ["Status", sel.status === "sos" ? "SOS / Issue" : "On Ride"]]} />}
      </Modal>

      {/* CALL MODAL */}
      <Modal open={modal === "call"} onClose={() => setModal(null)} title="Call Driver" sub="Contact details"
        footer={<>
          <button className="btn btn-outline btn-sm" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => { if (sel) navigator.clipboard?.writeText(sel.phone).catch(() => {}); setModal(null); notify("Number copied — " + sel?.phone); }}><Icon name="Copy" size={14} /> Copy Number</button>
        </>}>
        {sel && <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "15px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{sel.driver}</div>
          <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 1 }}>Driver on duty</div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 11, fontSize: 13.5 }}><Icon name="Phone" size={15} className="text-muted" /> {sel.phone}</div>
        </div>}
      </Modal>
    </div>
  );
}
