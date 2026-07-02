"use client";
import { useState } from "react";
import { Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { AGENCY_DOC_GROUPS } from "@/data/agencies";
import { docExpires, addUploadedDocs, UploadedDoc } from "@/lib/docExpiry";
import { DocUploadRow, DocMeta, emptyMeta, docComplete } from "@/components/DocUpload";

const STEPS = ["Agency Information", "Contact & Banking", "Fleet Information", "Documents"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Jaipur", "Lucknow", "Nagpur", "Indore"];
const TYPES = ["Private", "Government", "Hospital", "Trust / NGO"];
const ALL_AGENCY_DOCS = AGENCY_DOC_GROUPS.flatMap((g) => g.docs);
const REQUIRED_DOCS = ALL_AGENCY_DOCS.filter((d) => d.required);

const makeBlank = () => ({
  name: "", type: "", city: "", reg: "", gst: "",
  contact: "", phone: "", email: "", bankName: "", accHolder: "", accNo: "", ifsc: "",
  acls: 0, bls: 0, specialty: 0,
  docs: {} as Record<string, DocMeta>,
});

export type NewAgency = {
  name: string; type: string; city: string; contact: string; phone: string; email: string; ambulances: number;
};

export function AddAgencyWizard({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (a: NewAgency) => void }) {
  const notify = useToast();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(makeBlank());

  const set = <K extends keyof ReturnType<typeof makeBlank>>(k: K, v: ReturnType<typeof makeBlank>[K]) => setF((p) => ({ ...p, [k]: v }));
  const reset = () => { setStep(0); setF(makeBlank()); };
  const close = () => { reset(); onClose(); };

  const fleetTotal = f.acls + f.bls + f.specialty;

  const toggleDoc = (name: string) => setF((p) => ({ ...p, docs: { ...p.docs, [name]: { ...(p.docs[name] || emptyMeta()), up: !p.docs[name]?.up } } }));
  const setDocField = (name: string, field: "number" | "issue" | "expiry", val: string) =>
    setF((p) => ({ ...p, docs: { ...p.docs, [name]: { ...(p.docs[name] || emptyMeta()), [field]: val } } }));

  const docsValid = REQUIRED_DOCS.every((d) => f.docs[d.name]?.up) && ALL_AGENCY_DOCS.every((d) => !f.docs[d.name]?.up || docComplete(d.name, f.docs[d.name]));
  const canNext = (() => {
    if (step === 0) return !!(f.name && f.type && f.city);
    if (step === 1) return !!(f.contact && f.phone && f.email && f.bankName && f.accNo && f.ifsc);
    if (step === 2) return fleetTotal >= 1;
    if (step === 3) return docsValid;
    return true;
  })();

  const next = () => {
    if (!canNext) { notify("Complete the required fields to continue", "warning"); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const create = () => {
    // Feed every uploaded validity document into the Document Expiry Center.
    const recs: UploadedDoc[] = ALL_AGENCY_DOCS.filter((d) => f.docs[d.name]?.up && docExpires(d.name) && f.docs[d.name].expiry).map((d) => {
      const m = f.docs[d.name];
      return { name: d.name, ownerType: "Agency", owner: f.name, number: m.number, issueIso: m.issue || undefined, expiryIso: m.expiry, by: "Arjun Mehta", city: f.city, agency: f.name, assoc: `${f.name} (Agency)` };
    });
    addUploadedDocs(recs);
    onCreated?.({ name: f.name, type: f.type, city: f.city, contact: f.contact, phone: f.phone, email: f.email, ambulances: fleetTotal });
    notify(`"${f.name}" submitted — sent to Onboarding Review Queue${recs.length ? ` · ${recs.length} document(s) tracked for expiry` : ""}`);
    close();
  };

  const fleetField = (label: string, k: "acls" | "bls" | "specialty") => (
    <div className="form-group"><label className="label">{label}</label>
      <input className="input" type="number" min={0} value={f[k]} onChange={(e) => set(k, Math.max(0, +e.target.value || 0))} /></div>
  );

  return (
    <Modal open={open} onClose={close} wide title="Add Agency" sub={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
      footer={<>
        {step > 0 && <button className="btn btn-outline btn-sm" onClick={back} style={{ marginRight: "auto" }}>← Previous</button>}
        <button className="btn btn-outline btn-sm" onClick={close}>Cancel</button>
        {step < STEPS.length - 1
          ? <button className="btn btn-primary btn-sm" onClick={next}>Next →</button>
          : <button className="btn btn-primary btn-sm" onClick={create}>Create Agency</button>}
      </>}>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: i < step ? "var(--success)" : i === step ? "var(--primary)" : "#fff",
                color: i <= step ? "#fff" : "#94A3B8",
                border: i > step ? "1px solid var(--border)" : "none",
              }}>{i < step ? <Icon name="Check" size={14} /> : i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: i === step ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ flex: 1, height: 2, margin: "0 10px", background: i < step ? "var(--success)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      {/* STEP 1 — Agency Information */}
      {step === 0 && <>
        <div className="form-group"><label className="label">Agency Name *</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. LifeLine Ambulance" /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Agency Type *</label><select className="input" value={f.type} onChange={(e) => set("type", e.target.value)}><option value="">Select type</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label className="label">City *</label><select className="input" value={f.city} onChange={(e) => set("city", e.target.value)}><option value="">Select city</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="form-group"><label className="label">Registration Number</label><input className="input" value={f.reg} onChange={(e) => set("reg", e.target.value)} placeholder="REG-2026-000000" /></div>
          <div className="form-group"><label className="label">GST Number</label><input className="input" value={f.gst} onChange={(e) => set("gst", e.target.value)} placeholder="27AAACL1234C1Z5" /></div>
        </div>
      </>}

      {/* STEP 2 — Contact & Banking */}
      {step === 1 && <>
        <div className="dsec" style={{ marginTop: 0 }}>Primary Contact</div>
        <div className="form-group"><label className="label">Contact Person *</label><input className="input" value={f.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Full name" /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Mobile Number *</label><input className="input" maxLength={10} value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/[^0-9]/g, ""))} placeholder="9820000000" /></div>
          <div className="form-group"><label className="label">Official Email *</label><input className="input" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="agency@email.com" /></div>
        </div>
        <div className="dsec">Bank / Payout Details</div>
        <div className="grid2">
          <div className="form-group"><label className="label">Bank Name *</label><input className="input" value={f.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="HDFC Bank" /></div>
          <div className="form-group"><label className="label">Account Holder Name</label><input className="input" value={f.accHolder} onChange={(e) => set("accHolder", e.target.value)} placeholder="As per bank records" /></div>
          <div className="form-group"><label className="label">Account Number *</label><input className="input" value={f.accNo} onChange={(e) => set("accNo", e.target.value.replace(/[^0-9]/g, ""))} placeholder="000000000000" /></div>
          <div className="form-group"><label className="label">IFSC Code *</label><input className="input mono" value={f.ifsc} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} placeholder="HDFC0002000" /></div>
        </div>
      </>}

      {/* STEP 3 — Fleet Information */}
      {step === 2 && <>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>Enter the agency's fleet count by service class (ACLS, BLS, Specialty). Total is calculated automatically.</div>
        <div className="grid2">
          {fleetField("ACLS Ambulances", "acls")}
          {fleetField("BLS Ambulances", "bls")}
          {fleetField("Specialty Vehicles", "specialty")}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFC", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginTop: 4 }}>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Total Ambulances</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>Auto-calculated from fleet types</div></div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", letterSpacing: "-.5px" }}>{fleetTotal}</div>
        </div>
      </>}

      {/* STEP 4 — Documents */}
      {step === 3 && <>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>Upload required and optional documents. Validity documents (licenses, permits, NOCs) require an expiry date — these sync with the Document Expiry Center. Permanent documents only need the document number.</div>
        {AGENCY_DOC_GROUPS.map((g) => (
          <div key={g.section}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", color: "#64748B", margin: "12px 0 7px" }}>{g.section}</div>
            {g.docs.map((d) => (
              <DocUploadRow key={d.name} name={d.name} required={d.required} meta={f.docs[d.name]}
                onToggle={() => toggleDoc(d.name)} onField={(field, val) => setDocField(d.name, field, val)} />
            ))}
          </div>
        ))}
      </>}
    </Modal>
  );
}
