"use client";
import { StatusBadge, Icon } from "./ui";
import { docExpires } from "@/lib/docExpiry";

export type DocMeta = { up: boolean; number: string; issue: string; expiry: string };
export const emptyMeta = (): DocMeta => ({ up: false, number: "", issue: "", expiry: "" });
// uploaded + (if it expires) an expiry date present
export const docComplete = (name: string, m?: DocMeta) => !!m?.up && (!docExpires(name) || !!m.expiry);

/**
 * Reusable upload row used across onboarding flows (Driver, Vehicle, Agency).
 * On upload, captures metadata. Expiry-bearing doc types (validity period) show
 * Document Number + Issue Date (optional) + Expiry Date (required); permanent
 * documents show only Document Number. Expiry feeds the Document Expiry Center.
 */
export function DocUploadRow({ name, required, meta, onToggle, onField }: {
  name: string; required?: boolean; meta?: DocMeta;
  onToggle: () => void; onField: (field: "number" | "issue" | "expiry", val: string) => void;
}) {
  const up = !!meta?.up;
  const expires = docExpires(name);
  const needsExpiry = up && expires && !meta?.expiry;
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="modal-x" style={{ width: 34, height: 34, border: "none", background: up ? "#ECFDF5" : "var(--bg)", color: up ? "var(--success)" : "#94A3B8", flexShrink: 0 }}>
          <Icon name={up ? "FileCheck" : "FileText"} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
          <div style={{ marginTop: 3, display: "flex", gap: 6 }}>
            {required ? <StatusBadge status="reupload" label="Required" /> : <StatusBadge status="pending" label="Optional" />}
            {expires && <StatusBadge status="expiring30" label="Has Expiry" />}
          </div>
        </div>
        {up
          ? <button className="btn btn-outline btn-xs" onClick={onToggle} style={{ color: "var(--success)", borderColor: "#A7F3D0" }}>Uploaded ✓</button>
          : <button className="btn btn-outline btn-xs" onClick={onToggle}>Upload</button>}
      </div>
      {up && (
        <div style={{ marginTop: 11, paddingTop: 11, borderTop: "1px dashed var(--border)" }}>
          <div className="form-group" style={{ marginBottom: expires ? 10 : 0 }}>
            <label className="label">Document Number</label>
            <input className="input" value={meta?.number || ""} onChange={(e) => onField("number", e.target.value)} placeholder="e.g. document / registration no." />
          </div>
          {expires && (
            <div className="grid2" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Issue Date</label>
                <input type="date" className="input" value={meta?.issue || ""} onChange={(e) => onField("issue", e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Expiry Date <span style={{ color: "#DC2626" }}>*</span></label>
                <input type="date" className="input" value={meta?.expiry || ""} onChange={(e) => onField("expiry", e.target.value)} style={needsExpiry ? { borderColor: "#FCA5A5" } : undefined} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
