"use client";
import { Icon } from "@/components/ui";
import { PageHeader } from "./shared";
import type { ModuleProps } from "./registry";

const KPIS = [
  { label: "Total Agencies", icon: "Building2", val: "189", meta: "↑ 4 this month", up: true },
  { label: "Total Drivers", icon: "UserCheck", val: "3,841", meta: "↑ 128 this month", up: true },
  { label: "Total Revenue", icon: "IndianRupee", val: "₹2.41Cr", meta: "↑ 18% this month", up: true },
  { label: "Pending Reviews", icon: "Clock", val: "24", meta: "Needs attention", up: false },
];

const ACTIONS = [
  { key: "onboarding", icon: "ClipboardCheck", title: "Agency Reviews", sub: "Onboarding applications", count: 7 },
  { key: "drivers-q", icon: "UserCheck", title: "Driver Verifications", sub: "Documents to verify", count: 12 },
  { key: "ambulance-q", icon: "Ambulance", title: "Ambulance Verifications", sub: "Vehicles pending checks", count: 5 },
];

const ACTIVITY = [
  ["check", "#ECFDF5", "var(--success)", "LifeLine Ambulance approved", "Mumbai · 2 min ago"],
  ["plus", "#EEF2FF", "var(--primary)", "New agency registered — RapidCare", "Pune · 8 min ago"],
  ["flag", "#FFFBEB", "var(--warning)", "Driver Rahul flagged — incomplete docs", "Delhi · 22 min ago"],
  ["indian-rupee", "#EFF6FF", "var(--info)", "Payout ₹2.4L processed — Metro Medic", "Bangalore · 1 hr ago"],
];
const LUC: Record<string, string> = { check: "Check", plus: "Plus", flag: "Flag", "indian-rupee": "IndianRupee" };

export function Dashboard({ onNavigate }: ModuleProps) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.5px" }}>Good evening, Arjun</div>
        <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>Sunday, 22 June 2026 · Here&apos;s your platform at a glance</div>
      </div>

      <div className="kpi-grid">
        {KPIS.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-top">
              <span className="kpi-label">{k.label}</span>
              <span className="kpi-ic"><Icon name={k.icon} size={16} /></span>
            </div>
            <div className="kpi-val">{k.val}</div>
            <div className={`kpi-meta ${k.up ? "up" : "down"}`}>{k.meta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card pad">
          <div className="section-title" style={{ marginBottom: 4 }}>Pending Actions</div>
          <div className="text-sm text-muted" style={{ marginBottom: 14 }}>Items awaiting your decision</div>
          {ACTIONS.map((a) => (
            <div key={a.key} onClick={() => onNavigate(a.key)} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}>
              <span className="kpi-ic" style={{ width: 36, height: 36 }}><Icon name={a.icon} size={17} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.sub}</div>
              </div>
              <span className="badge pending">{a.count}</span>
              <Icon name="ChevronRight" size={16} className="text-muted" />
            </div>
          ))}
        </div>
        <div className="card pad">
          <div className="section-title" style={{ marginBottom: 4 }}>Recent Activity</div>
          <div className="text-sm text-muted" style={{ marginBottom: 16 }}>Latest platform events</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {ACTIVITY.map(([ic, bg, fg, title, sub], i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={LUC[ic]} size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
