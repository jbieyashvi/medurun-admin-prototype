export type ExpiryStatus = "expired" | "expiring7" | "expiring30" | "valid";

export type Doc = {
  name: string; ownerType: "Agency" | "Driver" | "Ambulance"; owner: string;
  number: string; issue: string; expiry: string;
  status: ExpiryStatus;
  days: number; updated: string; by: string; on: string; agency: string; assoc: string; city: string;
  followUp: boolean;
};

export const DOC_ST: Record<ExpiryStatus, string> = {
  expired: "Expired",
  expiring7: "Expiring in 7 Days",
  expiring30: "Expiring in 30 Days",
  valid: "Valid",
};

// Derive expiry status from days remaining. No-expiry docs (days >= NO_EXPIRY) are always Valid.
export const NO_EXPIRY = 9999;
export function expiryStatus(days: number): ExpiryStatus {
  if (days < 0) return "expired";
  if (days <= 7) return "expiring7";
  if (days <= 30) return "expiring30";
  return "valid";
}
// "-5 days" / "3 days" / "245 days"; no-expiry docs show "—".
export function daysLeftLabel(days: number): string {
  if (days >= NO_EXPIRY) return "—";
  return `${days} days`;
}

export const documents: Doc[] = [
  { name: "Driving License", ownerType: "Driver", owner: "Ravi Shankar", number: "MH01-2024-0012345", issue: "15 Jul 2021", expiry: "15 Jul 2026", status: "expiring30", days: 23, updated: "2 days ago", by: "Ravi Shankar", on: "15 Jul 2021", agency: "LifeLine Ambulance", assoc: "Ravi Shankar (Driver)", city: "Mumbai", followUp: false },
  { name: "Insurance Certificate", ownerType: "Ambulance", owner: "MH01-AB-1234", number: "INS-2023-778812", issue: "01 Jun 2023", expiry: "31 May 2026", status: "expired", days: -22, updated: "5 days ago", by: "LifeLine Ambulance", on: "01 Jun 2023", agency: "LifeLine Ambulance", assoc: "MH01-AB-1234 (Ambulance)", city: "Mumbai", followUp: true },
  { name: "GST Certificate", ownerType: "Agency", owner: "LifeLine Ambulance", number: "27AAACL1234C1Z5", issue: "10 Apr 2022", expiry: "—", status: "valid", days: NO_EXPIRY, updated: "1 week ago", by: "Rahul Sharma", on: "10 Apr 2022", agency: "LifeLine Ambulance", assoc: "LifeLine Ambulance (Agency)", city: "Mumbai", followUp: false },
  { name: "Police Verification", ownerType: "Driver", owner: "Anil Mishra", number: "PV-2024-556677", issue: "12 Feb 2024", expiry: "12 Feb 2027", status: "valid", days: 600, updated: "3 hours ago", by: "Falcon Medical", on: "12 Feb 2024", agency: "Falcon Medical", assoc: "Anil Mishra (Driver)", city: "Pune", followUp: false },
  { name: "Fitness Certificate", ownerType: "Ambulance", owner: "DL02-CD-5678", number: "FIT-2025-101122", issue: "05 Jan 2025", expiry: "05 Jul 2026", status: "expiring30", days: 13, updated: "Yesterday", by: "Metro Medic", on: "05 Jan 2025", agency: "Metro Medic", assoc: "DL02-CD-5678 (Ambulance)", city: "Delhi", followUp: false },
  { name: "Registration Certificate", ownerType: "Agency", owner: "RapidCare", number: "REG-KA-2023-4521", issue: "18 Mar 2023", expiry: "18 Mar 2028", status: "valid", days: 627, updated: "2 weeks ago", by: "Vikram Singh", on: "18 Mar 2023", agency: "RapidCare", assoc: "RapidCare (Agency)", city: "Bangalore", followUp: false },
  { name: "Aadhaar Card", ownerType: "Driver", owner: "Mohammed Iqbal", number: "XXXX-XXXX-8821", issue: "—", expiry: "—", status: "valid", days: NO_EXPIRY, updated: "1 hour ago", by: "Swift Ambulance", on: "10 Jan 2024", agency: "Swift Ambulance", assoc: "Mohammed Iqbal (Driver)", city: "Hyderabad", followUp: false },
  { name: "Ambulance RC", ownerType: "Ambulance", owner: "TN04-GH-3456", number: "RC-TN-2021-9087", issue: "22 Aug 2021", expiry: "22 Aug 2026", status: "valid", days: 61, updated: "4 days ago", by: "CarePlus", on: "22 Aug 2021", agency: "CarePlus", assoc: "TN04-GH-3456 (Ambulance)", city: "Chennai", followUp: false },
  { name: "NOC Certificate", ownerType: "Agency", owner: "CarePlus", number: "NOC-2022-3344", issue: "30 Sep 2022", expiry: "30 Sep 2025", status: "expired", days: -265, updated: "1 month ago", by: "Ravi Kumar", on: "30 Sep 2022", agency: "CarePlus", assoc: "CarePlus (Agency)", city: "Chennai", followUp: true },
  { name: "Medical Certificate", ownerType: "Driver", owner: "Deepak Nair", number: "MED-2024-7788", issue: "08 Apr 2024", expiry: "08 Jul 2026", status: "expiring7", days: 6, updated: "6 days ago", by: "RapidCare", on: "08 Apr 2024", agency: "RapidCare", assoc: "Deepak Nair (Driver)", city: "Bangalore", followUp: true },
  { name: "Director ID", ownerType: "Agency", owner: "Falcon Medical", number: "XXXX-XXXX-2210", issue: "—", expiry: "—", status: "valid", days: NO_EXPIRY, updated: "2 hours ago", by: "Falcon Medical", on: "19 Sep 2023", agency: "Falcon Medical", assoc: "Falcon Medical (Agency)", city: "Pune", followUp: false },
  { name: "Driving License", ownerType: "Driver", owner: "Kiran Thakur", number: "MH01-2024-0067890", issue: "27 Jun 2022", expiry: "27 Jun 2026", status: "expiring7", days: 5, updated: "Today", by: "LifeLine Ambulance", on: "27 Jun 2022", agency: "LifeLine Ambulance", assoc: "Kiran Thakur (Driver)", city: "Mumbai", followUp: true },
];
