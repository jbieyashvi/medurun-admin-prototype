"use client";
import { useMemo, useState } from "react";
import { Modal, StatusBadge, useToast, Icon } from "@/components/ui";
import { DRIVER_DOCS } from "@/data/drivers";
import { agencies } from "@/data/agencies";
import { ambulanceQueue, AMB_DOCS } from "@/data/ambulances";
import { docExpires, addUploadedDocs, UploadedDoc } from "@/lib/docExpiry";
import { DocUploadRow, DocMeta, emptyMeta, docComplete } from "@/components/DocUpload";

type DriverType = "individual" | "agency";
const STEPS = ["Driver Details", "Documents", "Vehicle Assignment", "Review & Create"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata"];
const AMB_TYPES = ["BLS", "ALS", "ICU", "Neonatal"];
const EQUIPMENT = ["Oxygen Cylinder", "AED / Defibrillator", "Stretcher", "Patient Monitor", "Suction Machine", "First-Aid Kit"];
const MAX_INDIVIDUAL_VEHICLES = 2;

type OwnVehicle = { reg: string; ambType: string; makeModel: string; year: string; equip: Record<string, boolean>; docs: Record<string, DocMeta> };
const emptyVehicle = (): OwnVehicle => ({ reg: "", ambType: "", makeModel: "", year: "", equip: {}, docs: {} });

const makeBlank = () => ({
  type: "individual" as DriverType,
  name: "", phone: "", email: "", city: "",
  agencyId: "",
  docs: {} as Record<string, DocMeta>,
  ownVehicles: [emptyVehicle()] as OwnVehicle[],
  agencyVehicle: "",
});

export function AddDriverWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notify = useToast();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(makeBlank());

  const set = <K extends keyof ReturnType<typeof makeBlank>>(k: K, v: ReturnType<typeof makeBlank>[K]) => setF((p) => ({ ...p, [k]: v }));
  const reset = () => { setStep(0); setF(makeBlank()); };
  const close = () => { reset(); onClose(); };

  const selectedAgency = useMemo(() => agencies.find((a) => String(a.id) === f.agencyId), [f.agencyId]);

  // Agency driver → vehicles belonging to the selected agency only.
  const agencyPool = useMemo(() => {
    if (!selectedAgency) return [];
    const n = selectedAgency.name.toLowerCase();
    return ambulanceQueue.filter((v) => n.includes(v.agency.toLowerCase()) || v.agency.toLowerCase().includes(n.split(" ")[0]));
  }, [selectedAgency]);

  const setType = (t: DriverType) => setF((p) => ({ ...p, type: t, agencyId: "", agencyVehicle: "", ownVehicles: [emptyVehicle()] }));
  const setAgency = (id: string) => setF((p) => ({ ...p, agencyId: id, agencyVehicle: "" }));

  // ---- driver document metadata ----
  const toggleDoc = (name: string) => setF((p) => ({ ...p, docs: { ...p.docs, [name]: { ...(p.docs[name] || emptyMeta()), up: !p.docs[name]?.up } } }));
  const setDocField = (name: string, field: "number" | "issue" | "expiry", val: string) =>
    setF((p) => ({ ...p, docs: { ...p.docs, [name]: { ...(p.docs[name] || emptyMeta()), [field]: val } } }));

  // ---- individual own-vehicle handlers ----
  const patchVehicle = (idx: number, patch: Partial<OwnVehicle>) =>
    setF((p) => ({ ...p, ownVehicles: p.ownVehicles.map((v, i) => (i === idx ? { ...v, ...patch } : v)) }));
  const toggleVehicleEquip = (idx: number, item: string) =>
    setF((p) => ({ ...p, ownVehicles: p.ownVehicles.map((v, i) => (i === idx ? { ...v, equip: { ...v.equip, [item]: !v.equip[item] } } : v)) }));
  const toggleVehicleDoc = (idx: number, item: string) =>
    setF((p) => ({ ...p, ownVehicles: p.ownVehicles.map((v, i) => (i === idx ? { ...v, docs: { ...v.docs, [item]: { ...(v.docs[item] || emptyMeta()), up: !v.docs[item]?.up } } } : v)) }));
  const setVehicleDocField = (idx: number, item: string, field: "number" | "issue" | "expiry", val: string) =>
    setF((p) => ({ ...p, ownVehicles: p.ownVehicles.map((v, i) => (i === idx ? { ...v, docs: { ...v.docs, [item]: { ...(v.docs[item] || emptyMeta()), [field]: val } } } : v)) }));
  const addVehicle = () => {
    if (f.ownVehicles.length >= MAX_INDIVIDUAL_VEHICLES) { notify(`Maximum ${MAX_INDIVIDUAL_VEHICLES} vehicles allowed`, "warning"); return; }
    set("ownVehicles", [...f.ownVehicles, emptyVehicle()]);
  };
  const removeVehicle = (idx: number) => set("ownVehicles", f.ownVehicles.filter((_, i) => i !== idx));

  const vehicleValid = (v: OwnVehicle) =>
    !!(v.reg.trim() && v.ambType && v.makeModel.trim() && v.year.trim()) && AMB_DOCS.every((doc) => docComplete(doc.name, v.docs[doc.name]) || !v.docs[doc.name]?.up);
  const requiredDocs = DRIVER_DOCS.filter((d) => d.required);
  const driverDocsValid = requiredDocs.every((d) => f.docs[d.name]?.up) && DRIVER_DOCS.every((d) => !f.docs[d.name]?.up || docComplete(d.name, f.docs[d.name]));

  const canNext = (() => {
    if (step === 0) return !!(f.name && f.phone && f.city && (f.type === "individual" || f.agencyId));
    if (step === 1) return driverDocsValid;
    if (step === 2) return f.type === "individual" ? f.ownVehicles.every(vehicleValid) : !!f.agencyVehicle;
    return true;
  })();

  const stepTitle = (i: number) => (i === 2 && f.type === "individual" ? "Add Vehicle" : STEPS[i]);
  const next = () => {
    if (!canNext) { notify("Complete the required fields (including expiry dates) to continue", "warning"); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const create = () => {
    // Feed every uploaded doc that carries an expiry date into the Document Expiry Center.
    const driverRecs: UploadedDoc[] = DRIVER_DOCS.filter((d) => f.docs[d.name]?.up && docExpires(d.name) && f.docs[d.name].expiry).map((d) => {
      const m = f.docs[d.name];
      return { name: d.name, ownerType: "Driver", owner: f.name, number: m.number, issueIso: m.issue || undefined, expiryIso: m.expiry, by: "Arjun Mehta", city: f.city, agency: selectedAgency?.name || "—", assoc: `${f.name} (Driver)` };
    });
    const vehicleRecs: UploadedDoc[] = f.type === "individual"
      ? f.ownVehicles.flatMap((v) => AMB_DOCS.filter((doc) => v.docs[doc.name]?.up && docExpires(doc.name) && v.docs[doc.name].expiry).map((doc) => {
          const m = v.docs[doc.name];
          return { name: doc.name, ownerType: "Ambulance" as const, owner: v.reg || "New Vehicle", number: m.number, issueIso: m.issue || undefined, expiryIso: m.expiry, by: "Arjun Mehta", city: f.city, agency: "—", assoc: `${f.name} (Driver)` };
        }))
      : [];
    addUploadedDocs([...driverRecs, ...vehicleRecs]);
    const fed = driverRecs.length + vehicleRecs.length;
    notify(`${f.name} onboarded successfully${fed ? ` · ${fed} document(s) tracked for expiry` : ""}`);
    close();
  };

  const labelCol = { fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: ".4px" };

  return (
    <Modal open={open} onClose={close} wide title="Add Driver" sub={`Step ${step + 1} of ${STEPS.length} · ${stepTitle(step)}`}
      footer={<>
        {step > 0 && <button className="btn btn-outline btn-sm" onClick={back} style={{ marginRight: "auto" }}>← Back</button>}
        <button className="btn btn-outline btn-sm" onClick={close}>Cancel</button>
        {step < STEPS.length - 1
          ? <button className="btn btn-primary btn-sm" onClick={next}>Next →</button>
          : <button className="btn btn-primary btn-sm" onClick={create}>Create Driver</button>}
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
              <span style={{ fontSize: 12, fontWeight: 600, color: i === step ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap" }}>{stepTitle(i)}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ flex: 1, height: 2, margin: "0 10px", background: i < step ? "var(--success)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      {/* STEP 1 — Driver Details */}
      {step === 0 && <>
        <div className="form-group">
          <label className="label">Driver Type *</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {([["individual", "Individual Driver", "Independent driver — register up to 2 of their own vehicles"],
               ["agency", "Agency Driver", "Belongs to an agency — assign one of that agency's vehicles"]] as [DriverType, string, string][]
            ).map(([val, title, desc]) => {
              const on = f.type === val;
              return (
                <button key={val} type="button" onClick={() => setType(val)} style={{
                  textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                  border: on ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                  background: on ? "var(--primary-light)" : "#fff",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", border: on ? "5px solid var(--primary)" : "2px solid var(--border)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 5, paddingLeft: 24 }}>{desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {f.type === "agency" && (
          <div className="form-group">
            <label className="label">Agency *</label>
            <select className="input" value={f.agencyId} onChange={(e) => setAgency(e.target.value)}>
              <option value="">Select agency</option>
              {agencies.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name} · {a.city}</option>)}
            </select>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>Vehicle assignment will use this agency's fleet.</div>
          </div>
        )}

        <div className="form-group"><label className="label">Full Name *</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ravi Shankar" /></div>
        <div className="grid2">
          <div className="form-group"><label className="label">Phone *</label><input className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit mobile" /></div>
          <div className="form-group"><label className="label">Email</label><input className="input" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="driver@email.com" /></div>
          <div className="form-group"><label className="label">City *</label><select className="input" value={f.city} onChange={(e) => set("city", e.target.value)}><option value="">Select city</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>
      </>}

      {/* STEP 2 — Documents */}
      {step === 1 && <>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>Upload all required driver documents. Documents with an expiry require an expiry date — these feed the Document Expiry Center.</div>
        {DRIVER_DOCS.map((d) => (
          <DocUploadRow key={d.name} name={d.name} required={d.required} meta={f.docs[d.name]}
            onToggle={() => toggleDoc(d.name)} onField={(field, val) => setDocField(d.name, field, val)} />
        ))}
      </>}

      {/* STEP 3 — Add Vehicle (individual) / Vehicle Assignment (agency) */}
      {step === 2 && f.type === "individual" && <>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
          Register the driver's own vehicle(s). Up to {MAX_INDIVIDUAL_VEHICLES} vehicles ({f.ownVehicles.length}/{MAX_INDIVIDUAL_VEHICLES} added).
        </div>
        {f.ownVehicles.map((v, idx) => (
          <div key={idx} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <div className="modal-x" style={{ width: 30, height: 30, border: "none", background: "var(--primary-light)", color: "var(--primary)", marginRight: 9 }}><Icon name="Ambulance" size={15} /></div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>Vehicle {idx + 1}</div>
              {f.ownVehicles.length > 1 && <button className="btn btn-outline btn-xs" style={{ marginLeft: "auto", color: "#DC2626", borderColor: "#FECACA" }} onClick={() => removeVehicle(idx)}>Remove</button>}
            </div>

            <div className="form-group"><label className="label">Registration Number *</label><input className="input mono" value={v.reg} onChange={(e) => patchVehicle(idx, { reg: e.target.value.toUpperCase() })} placeholder="e.g. MH01-AB-1234" /></div>
            <div className="grid2">
              <div className="form-group"><label className="label">Ambulance Type *</label><select className="input" value={v.ambType} onChange={(e) => patchVehicle(idx, { ambType: e.target.value })}><option value="">Select type</option>{AMB_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="label">Manufacturing Year *</label><input className="input" value={v.year} onChange={(e) => patchVehicle(idx, { year: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })} placeholder="e.g. 2023" /></div>
            </div>
            <div className="form-group"><label className="label">Make &amp; Model *</label><input className="input" value={v.makeModel} onChange={(e) => patchVehicle(idx, { makeModel: e.target.value })} placeholder="e.g. Force Traveller Ambulance" /></div>

            <div className="form-group">
              <label className="label">Equipment Checklist</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {EQUIPMENT.map((item) => {
                  const on = !!v.equip[item];
                  return (
                    <button key={item} type="button" onClick={() => toggleVehicleEquip(idx, item)} style={{
                      fontSize: 12, fontWeight: 500, borderRadius: 8, padding: "5px 11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                      border: on ? "1px solid #C7D2FE" : "1px solid var(--border)", background: on ? "var(--primary-light)" : "#fff", color: on ? "var(--primary)" : "#475569",
                    }}>{on && <Icon name="Check" size={12} />}{item}</button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">Vehicle Documents</label>
              {AMB_DOCS.map((doc) => (
                <DocUploadRow key={doc.name} name={doc.name} required={doc.required} meta={v.docs[doc.name]}
                  onToggle={() => toggleVehicleDoc(idx, doc.name)} onField={(field, val) => setVehicleDocField(idx, doc.name, field, val)} />
              ))}
            </div>
          </div>
        ))}
        {f.ownVehicles.length < MAX_INDIVIDUAL_VEHICLES &&
          <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={addVehicle}>+ Add Another Vehicle</button>}
      </>}

      {step === 2 && f.type === "agency" && <>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
          Assign one vehicle from {selectedAgency?.name || "the agency"}'s fleet.
        </div>
        {agencyPool.length === 0
          ? <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: 12.5 }}>No vehicles available in this agency's fleet yet.</div>
          : agencyPool.map((v) => {
            const on = f.agencyVehicle === v.reg;
            return (
              <button key={v.reg} type="button" onClick={() => set("agencyVehicle", v.reg)} style={{
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
                border: on ? "1.5px solid var(--primary)" : "1px solid var(--border)", borderRadius: 10, padding: "11px 14px",
                background: on ? "var(--primary-light)" : "#fff", cursor: "pointer",
              }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: on ? "5px solid var(--primary)" : "2px solid var(--border)" }} />
                <div className="modal-x" style={{ width: 34, height: 34, border: "none", background: "var(--bg)", color: "var(--primary)", flexShrink: 0 }}><Icon name="Ambulance" size={16} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }} className="mono">{v.reg}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}>{v.type} · {v.agency} · {v.city}</div>
                </div>
              </button>
            );
          })}
      </>}

      {/* STEP 4 — Review & Create */}
      {step === 3 && <>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>Review all details before creating the driver.</div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--muted)", marginBottom: 10 }}>Driver Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
            <div><div style={labelCol}>Driver Type</div><div style={{ fontSize: 13, fontWeight: 600 }}>{f.type === "individual" ? "Individual Driver" : "Agency Driver"}</div></div>
            <div><div style={labelCol}>Name</div><div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div></div>
            <div><div style={labelCol}>Phone</div><div style={{ fontSize: 13, fontWeight: 600 }}>{f.phone}</div></div>
            <div><div style={labelCol}>Email</div><div style={{ fontSize: 13, fontWeight: 600 }}>{f.email || "—"}</div></div>
            <div><div style={labelCol}>City</div><div style={{ fontSize: 13, fontWeight: 600 }}>{f.city}</div></div>
            {f.type === "agency" && <div><div style={labelCol}>Agency</div><div style={{ fontSize: 13, fontWeight: 600 }}>{selectedAgency?.name || "—"}</div></div>}
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--muted)", marginBottom: 10 }}>Documents</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {DRIVER_DOCS.filter((d) => f.docs[d.name]?.up).map((d) => <span key={d.name} style={{ fontSize: 11.5, fontWeight: 600 }}><StatusBadge status="verified" label={docExpires(d.name) && f.docs[d.name].expiry ? `${d.name} · exp ${f.docs[d.name].expiry}` : d.name} /></span>)}
            {DRIVER_DOCS.every((d) => !f.docs[d.name]?.up) && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>No documents uploaded</span>}
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--muted)", marginBottom: 10 }}>{f.type === "individual" ? "Registered Vehicles" : "Vehicle Assignment"}</div>
          {f.type === "individual"
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {f.ownVehicles.map((v, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "var(--primary-light)", color: "var(--primary)" }}>{v.reg || "—"}</span>
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{[v.ambType, v.makeModel, v.year].filter(Boolean).join(" · ") || "—"}</span>
                  </div>
                ))}
              </div>
            : (f.agencyVehicle
                ? <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "var(--primary-light)", color: "var(--primary)" }}>{f.agencyVehicle}</span>
                : <span style={{ fontSize: 12.5, color: "var(--muted)" }}>No vehicle assigned</span>)}
        </div>
      </>}
    </Modal>
  );
}
