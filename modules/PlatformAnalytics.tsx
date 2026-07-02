"use client";
import { PageHeader } from "./shared";
import { Icon } from "@/components/ui";
import type { ModuleProps } from "./registry";

const PRIMARY = "#635BFF";

/* ---------- Compact KPI ---------- */
function Kpi({ icon, value, label, trend, up }: { icon: string; value: string; label: string; trend: string; up: boolean }) {
  return (
    <div className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F1F5F9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={icon} size={16} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.5px", lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: up ? "#059669" : "#DC2626" }}>{up ? "▲" : "▼"} {trend}</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

/* ---------- Rides by City ---------- */
function CityBars() {
  const rows: [string, number][] = [["Mumbai", 14842], ["Delhi", 12614], ["Bangalore", 9619], ["Hyderabad", 6980], ["Pune", 4236]];
  const max = rows[0][1];
  return (
    <div>
      {rows.map(([city, v]) => (
        <div key={city} style={{ margin: "9px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: "#334155" }}>{city}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{v.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ height: 6, background: "#F1F5F9", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ width: `${Math.round((v / max) * 100)}%`, height: "100%", background: PRIMARY, borderRadius: 20 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Ambulance Type Donut ---------- */
function Donut() {
  const segs: [string, number, string][] = [["BLS", 46, "#635BFF"], ["ACLS", 42, "#8B85FF"], ["Specialty", 12, "#B7B3FF"]];
  const R = 56, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
      <svg width={144} height={144} viewBox="0 0 144 144">
        <g transform="rotate(-90 72 72)">
          {segs.map(([name, pct, color]) => {
            const len = (pct / 100) * C;
            const el = <circle key={name} cx={72} cy={72} r={R} fill="none" stroke={color} strokeWidth={22} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
            offset += len;
            return el;
          })}
        </g>
        <text x={72} y={68} textAnchor="middle" style={{ fontSize: 19, fontWeight: 800, fill: "#0F172A" }}>48.3k</text>
        <text x={72} y={85} textAnchor="middle" style={{ fontSize: 11, fill: "#94A3B8" }}>rides</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segs.map(([name, pct, color]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "#334155", minWidth: 60 }}>{name}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Peak Hours ---------- */
function PeakHours() {
  const data = [8, 5, 3, 2, 2, 4, 10, 22, 38, 44, 40, 33, 30, 28, 26, 30, 42, 48, 45, 36, 28, 22, 16, 11];
  const peaks = new Set([8, 9, 10, 16, 17, 18]);
  const max = Math.max(...data);
  const labels = ["12AM", "6AM", "12PM", "6PM", "11PM"];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 96 }}>
        {data.map((v, h) => (
          <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }} title={`${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "AM" : "PM"} · ${v}`}>
            <div style={{ height: `${Math.round((v / max) * 100)}%`, background: peaks.has(h) ? PRIMARY : "#E0DEFF", borderRadius: "3px 3px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#94A3B8", marginTop: 6 }}>
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11.5, color: "#64748B" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: PRIMARY }} /> Peak hours</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#E0DEFF" }} /> Off-peak</span>
      </div>
    </div>
  );
}

function Card({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className="card" style={{ padding: 15, ...(full ? { gridColumn: "1 / -1" } : {}) }}>
      <div className="section-title" style={{ marginBottom: 11, fontSize: 13.5 }}>{title}</div>
      {children}
    </div>
  );
}

export function PlatformAnalytics(_: ModuleProps) {
  return (
    <div>
      <PageHeader title="Platform Analytics" sub="June 2026 Summary" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 12 }}>
        <Kpi icon="Route" value="48,291" label="Total Rides" trend="6.2%" up />
        <Kpi icon="Timer" value="8.4 min" label="Avg Response Time" trend="0.3 min" up />
        <Kpi icon="CircleX" value="4.2%" label="Cancellation Rate" trend="0.4%" up={false} />
        <Kpi icon="Star" value="4.6" label="Avg Rating" trend="0.1" up />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Rides by City"><CityBars /></Card>
        <Card title="Ambulance Type Utilization"><Donut /></Card>
        <Card title="Peak Hours" full><PeakHours /></Card>
      </div>
    </div>
  );
}
