"use client";
import { AMB_TYPE_GROUPS, getVariant, serviceClassClass } from "@/data/ambulanceTypes";

/** Service-class badge — shown next to a selected/displayed ambulance type. */
export function ServiceClassBadge({ short }: { short?: string }) {
  const v = getVariant(short);
  if (!v) return null;
  return <span className={`badge ${serviceClassClass(v.serviceClass)}`}>{v.serviceClass}</span>;
}

/** Full type + service-class badge + short name — reusable display block. */
export function AmbTypeDisplay({ short }: { short?: string }) {
  const v = getVariant(short);
  if (!v) return <span className="text-muted">—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{v.shortName}</span>
      <ServiceClassBadge short={v.shortName} />
      <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>{v.full}</span>
    </span>
  );
}

/**
 * Grouped ambulance-type dropdown (ACLS / BLS / Specialty section labels).
 * Stores the short name; shows full type + service-class badge below when selected.
 */
export function AmbTypePicker({
  value, onChange, placeholder = "Select ambulance type", details = true,
}: {
  value: string; onChange: (short: string) => void; placeholder?: string; details?: boolean;
}) {
  const v = getVariant(value);
  return (
    <div>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {AMB_TYPE_GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map((t) => <option key={t.shortName} value={t.shortName}>{t.shortName} — {t.full}</option>)}
          </optgroup>
        ))}
      </select>
      {details && v && (
        <div style={{ marginTop: 8, border: "1px solid var(--border)", borderRadius: 9, padding: "9px 12px", background: "#FBFAFF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{v.shortName}</span>
            <ServiceClassBadge short={v.shortName} />
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B" }}>{v.full}</div>
        </div>
      )}
    </div>
  );
}
