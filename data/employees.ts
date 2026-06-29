export type Employee = {
  name: string; empId: string; email: string; phone: string; dept: string; role: string;
  status: "online" | "offline" | "suspended" | "invited"; last: string; created: string; by: string;
  perms?: Record<string, Access>; // Super Admin per-employee override of the department default
};

// Finalized departments and their sub-roles (Add/Edit Employee).
export const DEPARTMENTS = ["Top Management", "HR", "Finance & Accounts", "Customer Support"];
export const DEPT_ROLES: Record<string, string[]> = {
  "Top Management": ["Super Admin", "Admin"],
  "HR": ["HR Manager", "HR Executive"],
  "Finance & Accounts": ["Finance Manager", "Accounts Executive"],
  "Customer Support": ["Customer Support Manager", "Customer Support Executive"],
};

export const EMP_ST: Record<string, [string, string]> = {
  online: ["Online", "active"], offline: ["Offline", "inactive"],
  suspended: ["Suspended", "rejected"], invited: ["Invited", "pending"],
};

// Full module list shown in the permission matrix (key → label).
export const EMP_MODULES: [string, string][] = [
  ["dashboard", "Dashboard"], ["agencies", "Agency Data"], ["onboarding", "Onboarding Review"],
  ["drivers-q", "Driver Verification"], ["ambulance-q", "Ambulance Data"], ["gps", "GPS Tracking"],
  ["booking", "Booking Logs"], ["documents", "Document Expiry"],
  ["users", "Customer Data"], ["drivers", "Driver Data"], ["employees", "Employee Management"],
  ["revenue", "Revenue & Commission"], ["payouts", "Payout Management"], ["reports", "Reports"],
  ["analytics", "Platform Analytics"], ["settings", "Platform Settings"],
];

export type Access = "full" | "view" | "none";
export const ACCESS_LEVELS: Access[] = ["full", "view", "none"];
export const ACCESS_META: Record<Access, { label: string; color: string; bg: string }> = {
  full: { label: "Full Access", color: "#059669", bg: "#ECFDF5" },
  view: { label: "View Only", color: "#2563EB", bg: "#EFF6FF" },
  none: { label: "No Access", color: "#94A3B8", bg: "#F1F5F9" },
};

// Finalized client-approved access matrix (Full Access modules per department; everything else is No Access).
export const DEPT_ACCESS: Record<string, "ALL" | string[]> = {
  "Top Management": "ALL",
  "HR": ["employees", "reports"],
  "Finance & Accounts": ["agencies", "drivers", "users", "revenue", "payouts", "booking", "reports"],
  "Customer Support": ["agencies", "drivers", "users", "drivers-q", "ambulance-q", "booking", "documents", "gps", "reports"],
};

export function moduleAccess(dept: string, key: string): Access {
  const a = DEPT_ACCESS[dept];
  if (a === "ALL") return "full";
  return a?.includes(key) ? "full" : "none";
}

export const employees: Employee[] = [
  { name: "Arjun Mehta", empId: "EMP-1001", email: "arjun@medurun.in", phone: "9820000001", dept: "Top Management", role: "Super Admin", status: "online", last: "Active now", created: "02 Jan 2024", by: "System" },
  { name: "Neha Kulkarni", empId: "EMP-1004", email: "neha@medurun.in", phone: "9820000004", dept: "Customer Support", role: "Customer Support Manager", status: "online", last: "2 min ago", created: "14 Feb 2024", by: "Arjun Mehta" },
  { name: "Rohan Desai", empId: "EMP-1007", email: "rohan@medurun.in", phone: "9820000007", dept: "Customer Support", role: "Customer Support Executive", status: "online", last: "12 min ago", created: "21 Mar 2024", by: "Arjun Mehta" },
  { name: "Kavya Rao", empId: "EMP-1009", email: "kavya@medurun.in", phone: "9820000009", dept: "Finance & Accounts", role: "Finance Manager", status: "offline", last: "3 hours ago", created: "05 Apr 2024", by: "Arjun Mehta" },
  { name: "Imran Shaikh", empId: "EMP-1012", email: "imran@medurun.in", phone: "9820000012", dept: "Customer Support", role: "Customer Support Executive", status: "offline", last: "Yesterday", created: "19 May 2024", by: "Rohan Desai" },
  { name: "Sara Pinto", empId: "EMP-1015", email: "sara@medurun.in", phone: "9820000015", dept: "HR", role: "HR Manager", status: "offline", last: "2 days ago", created: "08 Jun 2024", by: "Arjun Mehta" },
  { name: "Vikram Joshi", empId: "EMP-1018", email: "vikram@medurun.in", phone: "9820000018", dept: "Finance & Accounts", role: "Accounts Executive", status: "suspended", last: "1 week ago", created: "22 Jun 2024", by: "Kavya Rao" },
  { name: "Pending Invite", empId: "EMP-1021", email: "newhire@medurun.in", phone: "—", dept: "Customer Support", role: "Customer Support Executive", status: "invited", last: "—", created: "20 Jun 2026", by: "Arjun Mehta" },
];
