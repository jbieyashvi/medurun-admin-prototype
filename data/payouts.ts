export type Payout = {
  agency: string; city: string; gross: string; commission: string; net: string;
  bank: string; status: "paid" | "processing" | "pending" | "failed";
};

export const payoutsData: Payout[] = [
  { agency: "LifeLine Ambulance", city: "Mumbai", gross: "₹38,42,400", commission: "₹5,76,360", net: "₹32,66,040", bank: "HDFC ••4521", status: "paid" },
  { agency: "Metro Medic Services", city: "Delhi", gross: "₹31,16,800", commission: "₹4,67,520", net: "₹26,49,280", bank: "SBI ••8823", status: "paid" },
  { agency: "NovaCare Ambulances", city: "Delhi", gross: "₹27,56,200", commission: "₹4,13,430", net: "₹23,42,770", bank: "ICICI ••2341", status: "paid" },
  { agency: "Swift Ambulance", city: "Hyderabad", gross: "₹22,12,600", commission: "₹3,31,890", net: "₹18,80,710", bank: "Axis ••6612", status: "processing" },
  { agency: "Falcon Medical", city: "Pune", gross: "₹18,74,400", commission: "₹2,81,160", net: "₹15,93,240", bank: "HDFC ••9901", status: "pending" },
  { agency: "Medivac Pro", city: "Ahmedabad", gross: "₹16,22,100", commission: "₹2,43,315", net: "₹13,78,785", bank: "Kotak ••3344", status: "pending" },
  { agency: "RapidCare Emergency", city: "Bangalore", gross: "₹14,81,200", commission: "₹2,22,180", net: "₹12,59,020", bank: "SBI ••7788", status: "failed" },
  { agency: "CarePlus EMS", city: "Chennai", gross: "₹9,31,200", commission: "₹1,39,680", net: "₹7,91,520", bank: "Canara ••5566", status: "paid" },
];

export const FAIL_REASONS = ["Invalid account number", "IFSC mismatch", "Account frozen by bank", "Beneficiary name mismatch"];
