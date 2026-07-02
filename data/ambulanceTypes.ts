// Final ambulance type list (PM-approved). Grouped by service class.
export type ServiceClass = "ACLS" | "BLS" | "Specialty";

export type AmbulanceVariant = {
  full: string;        // ambulanceType — full label
  shortName: string;   // shortName — display / stored key
  serviceClass: ServiceClass;
};

export const AMBULANCE_TYPES: AmbulanceVariant[] = [
  // ACLS
  { full: "ALS (TATA WINGER AMBULANCE)", shortName: "ALS Winger", serviceClass: "ACLS" },
  { full: "ALS (FORCE TEMPO TRAVELLER AMBULANCE)", shortName: "ALS Tempo", serviceClass: "ACLS" },
  { full: "ALS (BOLERO AMBULANCE)", shortName: "ALS Bolero", serviceClass: "ACLS" },
  { full: "NEONATAL ALS (TATA WINGER AMBULANCE)", shortName: "Neo ALS Winger", serviceClass: "ACLS" },
  { full: "NEONATAL (FORCE TEMPO TRAVELLER AMBULANCE)", shortName: "Neo Tempo", serviceClass: "ACLS" },
  // BLS
  { full: "BLS (TATA WINGER AMBULANCE)", shortName: "BLS Winger", serviceClass: "BLS" },
  { full: "BLS (FORCE TEMPO TRAVELLER AMBULANCE)", shortName: "BLS Tempo", serviceClass: "BLS" },
  { full: "BLS (BOLERO AMBULANCE)", shortName: "BLS Bolero", serviceClass: "BLS" },
  { full: "BLS (EECO AMBULANCE)", shortName: "BLS Eeco", serviceClass: "BLS" },
  // Specialty
  { full: "FREEZER BOX MORTUARY VAN (FORCE TEMPO TRAVELLER AMBULANCE)", shortName: "Freezer Van", serviceClass: "Specialty" },
  { full: "HEARSE VAN", shortName: "Hearse", serviceClass: "Specialty" },
];

export const SERVICE_CLASSES: ServiceClass[] = ["ACLS", "BLS", "Specialty"];

export const AMB_TYPE_GROUPS: { label: ServiceClass; items: AmbulanceVariant[] }[] =
  SERVICE_CLASSES.map((label) => ({ label, items: AMBULANCE_TYPES.filter((t) => t.serviceClass === label) }));

export const AMB_SHORT_NAMES: string[] = AMBULANCE_TYPES.map((t) => t.shortName);

const BY_SHORT = new Map(AMBULANCE_TYPES.map((t) => [t.shortName, t]));
const BY_FULL = new Map(AMBULANCE_TYPES.map((t) => [t.full, t]));

// Resolve a variant from either short name or full label (tolerant of legacy values).
export const getVariant = (v?: string): AmbulanceVariant | undefined =>
  (v ? BY_SHORT.get(v) || BY_FULL.get(v) : undefined);

// Service-class badge CSS class (defined in globals.css)
export const serviceClassClass = (sc: ServiceClass): string =>
  sc === "ACLS" ? "acls" : sc === "BLS" ? "bls-class" : "specialty";
