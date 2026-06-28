import { ExpiryStatus, expiryStatus, Doc } from "@/data/documents";

/**
 * Central registry deciding whether a document type carries an expiry date.
 * Expiring docs (RC, Insurance, Fitness, PUC, Road Tax, Driving Licence, etc.)
 * show Document Number + Issue Date (optional) + Expiry Date (required).
 * Non-expiring docs (PAN, GST, Aadhaar, Incorporation, MSME, etc.) hide the Expiry field.
 */
const EXPIRING = [/licen[cs]e/i, /insurance/i, /fitness/i, /pollution|\bpuc\b/i, /road\s*tax/i, /\bpermit\b/i, /\brc\b|registration certificate/i, /medical/i, /police/i, /calibration/i, /\bnoc\b/i, /biomedical|waste authoriz/i, /establishment/i, /trade/i];
const NON_EXPIRING = [/\bpan\b/i, /\bgst\b/i, /aadhaar|aadhar/i, /voter/i, /incorporation/i, /msme/i, /passbook|bank/i, /photo/i, /director/i, /epf|esic/i, /undertaking/i, /organogram/i];

export function docExpires(name: string): boolean {
  if (NON_EXPIRING.some((r) => r.test(name))) return false;
  return EXPIRING.some((r) => r.test(name));
}

// ---- date helpers ----
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}
export function isoToDisplay(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? "—" : fmtDate(d);
}
export function daysUntilISO(iso: string): number {
  const d = new Date(iso + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}
export function todayDisplay(): string { return fmtDate(new Date()); }

// ---- shared store: admin-uploaded docs that feed the Document Expiry Center ----
const KEY = "medurun-uploaded-docs";

export type UploadedDoc = {
  name: string; ownerType: Doc["ownerType"]; owner: string;
  number: string; issueIso?: string; expiryIso: string;
  by: string; city: string; agency: string; assoc: string;
};

export function getUploadedDocs(): UploadedDoc[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function addUploadedDocs(recs: UploadedDoc[]): void {
  if (typeof window === "undefined" || recs.length === 0) return;
  try { localStorage.setItem(KEY, JSON.stringify([...getUploadedDocs(), ...recs])); } catch { /* ignore */ }
}

// Convert a stored upload into a Document Expiry row, with live status from its expiry date.
export function uploadedToDoc(u: UploadedDoc): Doc {
  const days = daysUntilISO(u.expiryIso);
  const status: ExpiryStatus = expiryStatus(days);
  return {
    name: u.name, ownerType: u.ownerType, owner: u.owner, number: u.number,
    issue: isoToDisplay(u.issueIso), expiry: isoToDisplay(u.expiryIso), status, days,
    updated: "Just now", by: u.by, on: u.by ? todayDisplay() : "—", agency: u.agency, assoc: u.assoc, city: u.city,
    followUp: status === "expired" || status === "expiring7",
  };
}
