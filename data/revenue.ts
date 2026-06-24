export type RevenueRow = {
  agency: string; city: string; rides: number;
  gross: string; commission: string; net: string;
  status: "paid" | "processing" | "pending";
};

export const revenueData: RevenueRow[] = [
  { agency: "LifeLine Ambulance", city: "Mumbai", rides: 1842, gross: "₹38,42,400", commission: "₹5,76,360", net: "₹32,66,040", status: "paid" },
  { agency: "Metro Medic Services", city: "Delhi", rides: 1520, gross: "₹31,16,800", commission: "₹4,67,520", net: "₹26,49,280", status: "paid" },
  { agency: "NovaCare Ambulances", city: "Delhi", rides: 1102, gross: "₹27,56,200", commission: "₹4,13,430", net: "₹23,42,770", status: "paid" },
  { agency: "Swift Ambulance", city: "Hyderabad", rides: 932, gross: "₹22,12,600", commission: "₹3,31,890", net: "₹18,80,710", status: "processing" },
  { agency: "Falcon Medical", city: "Pune", rides: 812, gross: "₹18,74,400", commission: "₹2,81,160", net: "₹15,93,240", status: "pending" },
  { agency: "Medivac Pro", city: "Ahmedabad", rides: 672, gross: "₹16,22,100", commission: "₹2,43,315", net: "₹13,78,785", status: "pending" },
  { agency: "CarePlus EMS", city: "Chennai", rides: 392, gross: "₹9,31,200", commission: "₹1,39,680", net: "₹7,91,520", status: "paid" },
];

export const REV_REASONS: Record<number, string> = {};
export const REASONS = ["Awaiting Finance Approval", "Missing Invoice", "Bank Details Verification Pending"];
export const REASON_ACTION: Record<string, string> = {
  "Awaiting Finance Approval": "Finance team must approve the settlement before payout can be released.",
  "Missing Invoice": "Upload invoice before payout can be released.",
  "Bank Details Verification Pending": "Verify the agency bank account before initiating transfer.",
};
