"use client";
import { ReactNode } from "react";
import { Icon } from "@/components/ui";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Summary({ children }: { children: ReactNode }) {
  return <div className="summary">{children}</div>;
}

export function DrawerHead({ avatar, title, sub, right }: { avatar: ReactNode; title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="drawer-head">
      <div className="drawer-avatar">{avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dh-title">{title}</div>
        {sub && <div className="text-sm text-muted">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function Metrics({ items }: { items: [ReactNode, string][] }) {
  return (
    <div className="drawer-metrics">
      {items.map(([v, l], i) => (
        <div className="drawer-metric" key={i}>
          <div className="drawer-metric-val">{v}</div>
          <div className="drawer-metric-label">{l}</div>
        </div>
      ))}
    </div>
  );
}

export function Sec({ children }: { children: ReactNode }) {
  return <div className="dsec">{children}</div>;
}

export function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="stat-row">
      <span className="k">{k}</span>
      <span style={{ fontWeight: 600 }}>{children}</span>
    </div>
  );
}

export function ProfGrid({ items }: { items: [string, ReactNode][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
      {items.map(([k, v], i) => (
        <div key={i} style={{ padding: "9px 0", borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{k}</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: [string, string][]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map(([k, label]) => (
        <button key={k} className={`tab ${active === k ? "active" : ""}`} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

export function Timeline({ items }: { items: { title: string; sub: string; done?: boolean; active?: boolean }[] }) {
  return (
    <div style={{ position: "relative", paddingLeft: 6 }}>
      {items.map((it, i) => (
        <div key={i} style={{ position: "relative", paddingLeft: 24, paddingBottom: i === items.length - 1 ? 0 : 16 }}>
          {i < items.length - 1 && <span style={{ position: "absolute", left: 5, top: 14, bottom: -2, width: 2, background: it.done ? "var(--success)" : "var(--border)" }} />}
          <span style={{ position: "absolute", left: 0, top: 2, width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff", boxShadow: `0 0 0 1px ${it.done ? "var(--success)" : it.active ? "var(--primary)" : "var(--border)"}`, background: it.done ? "var(--success)" : it.active ? "var(--primary)" : "#fff" }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>{it.title}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{it.sub}</div>
        </div>
      ))}
    </div>
  );
}

export const fwt = (v: ReactNode, color?: string) => <span style={{ fontWeight: 700, color }}>{v}</span>;
