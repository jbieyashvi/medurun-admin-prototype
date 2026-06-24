export type Doc = {
  name: string; ownerType: "Agency" | "Driver" | "Ambulance"; owner: string;
  number: string; issue: string; expiry: string;
  status: "verified" | "pending" | "expired" | "expiring" | "reupload" | "exception";
  days: number; updated: string; by: string; on: string; agency: string; assoc: string; city: string;
  reason?: string; exceptionNote?: string;
};

export const DOC_ST: Record<string, string> = {
  verified: "Verified", pending: "Pending", expired: "Expired",
  expiring: "Expiring Soon", reupload: "Re-upload Requested", exception: "Exception Approved",
};

export const documents: Doc[] = [
  { name: "Driving License", ownerType: "Driver", owner: "Ravi Shankar", number: "MH01-2024-0012345", issue: "15 Jul 2021", expiry: "15 Jul 2026", status: "expiring", days: 23, updated: "2 days ago", by: "Ravi Shankar", on: "15 Jul 2021", agency: "LifeLine Ambulance", assoc: "Ravi Shankar (Driver)", city: "Mumbai" },
  { name: "Insurance Certificate", ownerType: "Ambulance", owner: "MH01-AB-1234", number: "INS-2023-778812", issue: "01 Jun 2023", expiry: "31 May 2026", status: "expired", days: -22, updated: "5 days ago", by: "LifeLine Ambulance", on: "01 Jun 2023", agency: "LifeLine Ambulance", assoc: "MH01-AB-1234 (Ambulance)", city: "Mumbai" },
  { name: "GST Certificate", ownerType: "Agency", owner: "LifeLine Ambulance", number: "27AAACL1234C1Z5", issue: "10 Apr 2022", expiry: "—", status: "verified", days: 9999, updated: "1 week ago", by: "Rahul Sharma", on: "10 Apr 2022", agency: "LifeLine Ambulance", assoc: "LifeLine Ambulance (Agency)", city: "Mumbai" },
  { name: "Police Verification", ownerType: "Driver", owner: "Anil Mishra", number: "PV-2024-556677", issue: "12 Feb 2024", expiry: "12 Feb 2027", status: "pending", days: 600, updated: "3 hours ago", by: "Falcon Medical", on: "12 Feb 2024", agency: "Falcon Medical", assoc: "Anil Mishra (Driver)", city: "Pune" },
  { name: "Fitness Certificate", ownerType: "Ambulance", owner: "DL02-CD-5678", number: "FIT-2025-101122", issue: "05 Jan 2025", expiry: "05 Jul 2026", status: "expiring", days: 13, updated: "Yesterday", by: "Metro Medic", on: "05 Jan 2025", agency: "Metro Medic", assoc: "DL02-CD-5678 (Ambulance)", city: "Delhi" },
  { name: "Registration Certificate", ownerType: "Agency", owner: "RapidCare", number: "REG-KA-2023-4521", issue: "18 Mar 2023", expiry: "18 Mar 2028", status: "verified", days: 9999, updated: "2 weeks ago", by: "Vikram Singh", on: "18 Mar 2023", agency: "RapidCare", assoc: "RapidCare (Agency)", city: "Bangalore" },
  { name: "Aadhaar Card", ownerType: "Driver", owner: "Mohammed Iqbal", number: "XXXX-XXXX-8821", issue: "—", expiry: "—", status: "reupload", days: 9999, updated: "1 hour ago", by: "Swift Ambulance", on: "10 Jan 2024", agency: "Swift Ambulance", assoc: "Mohammed Iqbal (Driver)", city: "Hyderabad" },
  { name: "Ambulance RC", ownerType: "Ambulance", owner: "TN04-GH-3456", number: "RC-TN-2021-9087", issue: "22 Aug 2021", expiry: "22 Aug 2026", status: "verified", days: 61, updated: "4 days ago", by: "CarePlus", on: "22 Aug 2021", agency: "CarePlus", assoc: "TN04-GH-3456 (Ambulance)", city: "Chennai" },
  { name: "NOC Certificate", ownerType: "Agency", owner: "CarePlus", number: "NOC-2022-3344", issue: "30 Sep 2022", expiry: "30 Sep 2025", status: "expired", days: -265, updated: "1 month ago", by: "Ravi Kumar", on: "30 Sep 2022", agency: "CarePlus", assoc: "CarePlus (Agency)", city: "Chennai" },
  { name: "Medical Certificate", ownerType: "Driver", owner: "Deepak Nair", number: "MED-2024-7788", issue: "08 Apr 2024", expiry: "08 Jul 2026", status: "expiring", days: 16, updated: "6 days ago", by: "RapidCare", on: "08 Apr 2024", agency: "RapidCare", assoc: "Deepak Nair (Driver)", city: "Bangalore" },
  { name: "Director ID", ownerType: "Agency", owner: "Falcon Medical", number: "XXXX-XXXX-2210", issue: "—", expiry: "—", status: "reupload", days: 9999, updated: "2 hours ago", by: "Falcon Medical", on: "19 Sep 2023", agency: "Falcon Medical", assoc: "Falcon Medical (Agency)", city: "Pune" },
  { name: "Driving License", ownerType: "Driver", owner: "Kiran Thakur", number: "MH01-2024-0067890", issue: "27 Jun 2022", expiry: "27 Jun 2026", status: "expiring", days: 5, updated: "Today", by: "LifeLine Ambulance", on: "27 Jun 2022", agency: "LifeLine Ambulance", assoc: "Kiran Thakur (Driver)", city: "Mumbai" },
];
