"use client";
import { useState } from "react";
import { Modal, StatusBadge, useToast, Icon } from "./ui";

export type DocStatus = "verified" | "pending" | "reupload" | "rejected";
export type DocItem = { name: string; uploadDate: string; status: DocStatus; reason?: string; required?: boolean };

export const DOC_STATUS_META: Record<DocStatus, [string, string, string]> = {
  verified: ["Verified", "Check", "verified"],
  pending: ["Pending Review", "Clock", "pending"],
  reupload: ["Correction Required", "TriangleAlert", "reupload"],
  rejected: ["Rejected", "X", "rejected"],
};
export const CORRECTION_REASONS = ["Expired Document", "Incorrect Upload", "Missing Information", "Unreadable Document", "Other"];

/**
 * Reusable document verification list — identical everywhere.
 * Rows show ONLY: icon, name, uploaded date, status badge, eye, download.
 * Verify / Request Correction decisions happen inside the preview modal.
 */
export function DocVerification({
  docs, onVerify, onCorrection,
}: {
  docs: DocItem[];
  onVerify: (name: string) => void;
  onCorrection: (name: string, reason: string, note: string) => void;
}) {
  const notify = useToast();
  const [preview, setPreview] = useState<DocItem | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [reason, setReason] = useState(""); const [note, setNote] = useState("");

  const closePreview = () => { setPreview(null); setCorrecting(false); setReason(""); setNote(""); };
  const verify = () => { if (preview) { onVerify(preview.name); notify(`"${preview.name}" marked Verified`); } closePreview(); };
  const submitCorrection = () => {
    if (!preview) return;
    if (!reason) { notify("Select a correction reason", "warning"); return; }
    onCorrection(preview.name, reason, note);
    notify(`Correction requested for "${preview.name}"`, "warning");
    closePreview();
  };

  return (
    <>
      {docs.map((d) => {
        const [label, ic, cls] = DOC_STATUS_META[d.status];
        return (
          <div key={d.name} style={{ border: "1px solid var(--border)", borderRadius: 9, padding: "10px 12px", marginBottom: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div className="modal-x" style={{ width: 30, height: 30, border: "1px solid var(--border)", color: "#64748B" }}><Icon name="FileText" size={14} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={d.name}>{d.name}</span>
                  {d.required !== undefined && (
                    <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", padding: "2px 7px", borderRadius: 20, background: d.required ? "#FEF2F2" : "#F1F5F9", color: d.required ? "#DC2626" : "#64748B" }}>{d.required ? "Required" : "Optional"}</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 1, whiteSpace: "nowrap" }}>Uploaded {d.uploadDate}</div>
              </div>
              <span className={`badge ${cls}`} style={{ whiteSpace: "nowrap", flexShrink: 0 }}><Icon name={ic} size={12} /> {label}</span>
              <button className="modal-x" style={{ width: 28, height: 28 }} title="Preview" onClick={() => { setCorrecting(false); setReason(""); setNote(""); setPreview(d); }}><Icon name="Eye" size={13} /></button>
              <button className="modal-x" style={{ width: 28, height: 28 }} title="Download" onClick={() => notify("Document downloaded")}><Icon name="Download" size={13} /></button>
            </div>
            {d.reason && <div style={{ fontSize: 11.5, color: "#9CA3AF", margin: "6px 0 0 41px" }}>Reason: {d.reason}</div>}
          </div>
        );
      })}

      {/* PREVIEW MODAL — all verify / correction decisions happen here */}
      <Modal open={!!preview} onClose={closePreview} title={preview?.name || ""} sub="Document preview"
        footer={preview && (correcting
          ? <><button className="btn btn-outline btn-sm" onClick={() => setCorrecting(false)}>Back</button><button className="btn btn-primary btn-sm" onClick={submitCorrection}>Submit Correction</button></>
          : <>
            <button className="btn btn-outline btn-sm" onClick={closePreview}>Close</button>
            <button className="btn btn-outline btn-sm" onClick={() => setCorrecting(true)}><Icon name="RotateCw" size={14} /> Request Correction</button>
            <button className="btn btn-primary btn-sm" onClick={verify}><Icon name="Check" size={14} /> Verify Document</button>
          </>)}>
        {preview && <>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "#FAFBFC", height: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8", marginBottom: 14 }}>
            <Icon name="FileText" size={40} /><div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{preview.name.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf</div><div style={{ fontSize: 11.5 }}>PDF · 1 page · 2.4 MB</div>
          </div>
          <div className="stat-row"><span className="k">Document Name</span><span style={{ fontWeight: 600 }}>{preview.name}</span></div>
          <div className="stat-row"><span className="k">Uploaded Date</span><span style={{ fontWeight: 600 }}>{preview.uploadDate}</span></div>
          <div className="stat-row"><span className="k">Current Status</span><StatusBadge status={DOC_STATUS_META[preview.status][2]} label={DOC_STATUS_META[preview.status][0]} /></div>
          {preview.reason && <div className="stat-row"><span className="k">Correction Reason</span><span style={{ fontWeight: 600, color: "#7C3AED" }}>{preview.reason}</span></div>}

          {correcting && <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <div className="dsec" style={{ marginTop: 0 }}>Request Correction</div>
            <div className="form-group"><label className="label">Reason *</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Select reason</option>{CORRECTION_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="form-group"><label className="label">Notes</label><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add details for the agency / driver (optional)..." /></div>
          </div>}
        </>}
      </Modal>
    </>
  );
}
