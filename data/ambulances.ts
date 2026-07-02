import { getVariant, ServiceClass } from "./ambulanceTypes";

export type Equip = { oxygen: boolean; aed: boolean; stretcher: boolean; monitor: boolean };
export type Ambulance = {
  reg: string; agency: string; city: string; year: string;
  ambulanceType: string; serviceClass: ServiceClass; shortName: string;
  equip: Equip; status: "pending" | "approved" | "rejected" | "flagged";
  missingDocs?: string[];
};

type AmbSeed = Omit<Ambulance, "ambulanceType" | "serviceClass" | "shortName"> & { short: string };
const mkAmb = ({ short, ...rest }: AmbSeed): Ambulance => {
  const v = getVariant(short)!;
  return { ...rest, ambulanceType: v.full, serviceClass: v.serviceClass, shortName: v.shortName };
};

export const ambulanceQueue: Ambulance[] = ([
  { reg: "MH01-AB-1234", short: "BLS Winger", agency: "LifeLine Ambulance", city: "Mumbai", year: "2023", equip: { oxygen: true, aed: true, stretcher: true, monitor: true }, status: "pending", missingDocs: [] },
  { reg: "DL02-CD-5678", short: "ALS Tempo", agency: "Metro Medic", city: "Delhi", year: "2022", equip: { oxygen: false, aed: true, stretcher: true, monitor: true }, status: "pending", missingDocs: ["Insurance"] },
  { reg: "KA03-EF-9012", short: "ALS Bolero", agency: "RapidCare", city: "Bangalore", year: "2024", equip: { oxygen: true, aed: true, stretcher: true, monitor: true }, status: "pending", missingDocs: [] },
  { reg: "TN04-GH-3456", short: "BLS Bolero", agency: "CarePlus", city: "Chennai", year: "2021", equip: { oxygen: true, aed: false, stretcher: true, monitor: true }, status: "pending", missingDocs: ["PUC (Pollution Certificate)"] },
  { reg: "GJ05-IJ-7890", short: "Neo ALS Winger", agency: "Medivac Pro", city: "Ahmedabad", year: "2023", equip: { oxygen: true, aed: true, stretcher: true, monitor: true }, status: "pending", missingDocs: ["Road Tax Certificate"] },
  { reg: "MH02-KL-2468", short: "ALS Winger", agency: "Falcon Medical", city: "Pune", year: "2020", equip: { oxygen: false, aed: false, stretcher: true, monitor: false }, status: "pending", missingDocs: ["Registration Certificate (RC)", "Fitness Certificate"] },
] as AmbSeed[]).map(mkAmb);

export type AmbDoc = { name: string; required: boolean; requiredLabel?: string };
export const AMB_DOCS: AmbDoc[] = [
  { name: "Registration Certificate (RC)", required: true },
  { name: "Insurance", required: true },
  { name: "PUC (Pollution Certificate)", required: true },
  { name: "Road Tax Certificate", required: true },
  { name: "Fitness Certificate", required: true },
  { name: "Calibration Certificate", required: false, requiredLabel: "Conditional" },
];

export const AMB_PHOTO_GROUPS: { section: string; items: string[] }[] = [
  { section: "Exterior Photos", items: ["Front Side", "Right Side", "Left Side", "Rear Side", "Odometer"] },
  { section: "Interior Photos", items: ["Interior with all Lights & Fans", "Stretcher", "Attender's Seat", "Oxygen Chamber"] },
];
export const AMB_PHOTOS: string[] = AMB_PHOTO_GROUPS.flatMap((g) => g.items);

export const AMB_VIDEOS: string[] = [
  "Equipment in Switch-On Condition",
  "Siren & Glowing Blinkers with Horn",
];

export type GpsVehicle = {
  reg: string; driver: string; phone: string; agency: string; city: string;
  status: "available" | "onride" | "offline" | "sos";
  updated: string; location: string; type: string;
  rideId?: string; customer?: string; booking?: string; x: number; y: number;
};

export const gpsVehicles: GpsVehicle[] = [
  { reg: "MH01-AB-1234", driver: "Ravi Shankar", phone: "9820123456", agency: "LifeLine Ambulance", city: "Mumbai", status: "onride", updated: "12 sec ago", location: "Andheri East, Mumbai", type: "ALS Winger", rideId: "RID-48211", customer: "Priya Mehta", booking: "BK-90231", x: 24, y: 30 },
  { reg: "DL02-CD-5678", driver: "Suresh Kumar", phone: "9845234567", agency: "Metro Medic", city: "Delhi", status: "available", updated: "8 sec ago", location: "Connaught Place, Delhi", type: "BLS Winger", x: 52, y: 22 },
  { reg: "KA03-EF-9012", driver: "Deepak Nair", phone: "9845678901", agency: "RapidCare", city: "Bangalore", status: "available", updated: "20 sec ago", location: "Koramangala, Bangalore", type: "ALS Bolero", x: 70, y: 46 },
  { reg: "TN04-GH-3456", driver: "Mohammed Iqbal", phone: "9848456789", agency: "Swift Ambulance", city: "Hyderabad", status: "onride", updated: "5 sec ago", location: "Banjara Hills, Hyderabad", type: "BLS Tempo", rideId: "RID-48207", customer: "Karthik Reddy", booking: "BK-90228", x: 44, y: 58 },
  { reg: "MH02-KL-2468", driver: "Anil Mishra", phone: "9820345678", agency: "Falcon Medical", city: "Pune", status: "sos", updated: "2 sec ago", location: "Hinjewadi, Pune", type: "ALS Tempo", rideId: "RID-48199", customer: "Sunita Sharma", booking: "BK-90220", x: 33, y: 44 },
  { reg: "GJ05-IJ-7890", driver: "Ramesh Patel", phone: "9979567890", agency: "Medivac Pro", city: "Mumbai", status: "available", updated: "15 sec ago", location: "Bandra West, Mumbai", type: "BLS Bolero", x: 18, y: 64 },
  { reg: "DL08-MN-1357", driver: "Santosh Yadav", phone: "9911789012", agency: "NovaCare", city: "Delhi", status: "offline", updated: "6 min ago", location: "Last seen: Saket, Delhi", type: "BLS Eeco", x: 60, y: 70 },
  { reg: "MH07-OP-2469", driver: "Kiran Thakur", phone: "9820890123", agency: "LifeLine Ambulance", city: "Mumbai", status: "onride", updated: "10 sec ago", location: "Powai, Mumbai", type: "Neo ALS Winger", rideId: "RID-48215", customer: "Ashok Jain", booking: "BK-90235", x: 80, y: 28 },
  { reg: "KA09-QR-3580", driver: "Vijay Nair", phone: "9791666777", agency: "RapidCare", city: "Bangalore", status: "available", updated: "25 sec ago", location: "Whitefield, Bangalore", type: "BLS Winger", x: 88, y: 60 },
  { reg: "TN11-ST-4691", driver: "Rahul Gupta", phone: "9911222333", agency: "CarePlus", city: "Hyderabad", status: "offline", updated: "12 min ago", location: "Last seen: Gachibowli", type: "ALS Bolero", x: 50, y: 84 },
];

export const GPS_ST: Record<string, string> = { available: "Available", onride: "On Ride", offline: "Offline", sos: "SOS / Issue" };
