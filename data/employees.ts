export type Employee = {
  name: string; empId: string; email: string; phone: string; dept: string; role: string;
  status: "online" | "offline" | "suspended" | "invited"; last: string; created: string; by: string;
  perms?: Record<string, string[]>;
};

export const EMP_MODULES: [string, string][] = [
  // Visible permission matrix (per client meeting)
  ["agencies", "Agency Data"], ["users", "Customer Data"],
  ["drivers", "Driver Data"], ["booking", "Booking Logs"],
  ["vehicle", "Vehicle Logs"], ["revenue", "Revenue & Commission"],
  ["payouts", "Payout Management"], ["reports", "Reports"],
  ["feedback", "Feedback"], ["employees", "Employee Management"],
  // Hidden / out-of-scope — kept in code, not shown in permission matrix
  ["onboarding", "Onboarding Review"], ["drivers-q", "Driver Verification"],
  ["ambulance-q", "Ambulance Data"], ["gps", "GPS Tracking"],
  ["tickets", "Tickets & Queries"], ["settings", "Pricing & Settings"],
];
export const PERM_TYPES = ["View", "Create", "Edit", "Delete", "Approve"];
export const EMP_ST: Record<string, [string, string]> = {
  online: ["Online", "active"], offline: ["Offline", "inactive"],
  suspended: ["Suspended", "rejected"], invited: ["Invited", "pending"],
};
export const roleModules: Record<string, string[]> = {
  "Top Management": EMP_MODULES.map((m) => m[0]),
  HR: ["reports", "employees", "feedback"],
  "Finance & Accounts": ["users", "drivers", "agencies", "revenue", "booking", "payouts", "reports"],
  "Customer Support": ["users", "drivers", "agencies", "booking", "vehicle", "reports", "feedback"],
};

export const employees: Employee[] = [
  { name: "Arjun Mehta", empId: "EMP-1001", email: "arjun@medurun.in", phone: "9820000001", dept: "Administration", role: "Top Management", status: "online", last: "Active now", created: "02 Jan 2024", by: "System" },
  { name: "Neha Kulkarni", empId: "EMP-1004", email: "neha@medurun.in", phone: "9820000004", dept: "Customer Support", role: "Customer Support", status: "online", last: "2 min ago", created: "14 Feb 2024", by: "Arjun Mehta" },
  { name: "Rohan Desai", empId: "EMP-1007", email: "rohan@medurun.in", phone: "9820000007", dept: "Operations", role: "Customer Support", status: "online", last: "12 min ago", created: "21 Mar 2024", by: "Arjun Mehta" },
  { name: "Kavya Rao", empId: "EMP-1009", email: "kavya@medurun.in", phone: "9820000009", dept: "Finance", role: "Finance & Accounts", status: "offline", last: "3 hours ago", created: "05 Apr 2024", by: "Arjun Mehta" },
  { name: "Imran Shaikh", empId: "EMP-1012", email: "imran@medurun.in", phone: "9820000012", dept: "Operations", role: "Customer Support", status: "offline", last: "Yesterday", created: "19 May 2024", by: "Rohan Desai" },
  { name: "Sara Pinto", empId: "EMP-1015", email: "sara@medurun.in", phone: "9820000015", dept: "Marketing", role: "HR", status: "offline", last: "2 days ago", created: "08 Jun 2024", by: "Arjun Mehta" },
  { name: "Vikram Joshi", empId: "EMP-1018", email: "vikram@medurun.in", phone: "9820000018", dept: "Finance", role: "Finance & Accounts", status: "suspended", last: "1 week ago", created: "22 Jun 2024", by: "Kavya Rao" },
  { name: "Pending Invite", empId: "EMP-1021", email: "newhire@medurun.in", phone: "—", dept: "Customer Support", role: "Customer Support", status: "invited", last: "—", created: "20 Jun 2026", by: "Arjun Mehta" },
];

export function accessLevel(perms: string[]): [string, string] {
  const n = perms.length;
  if (n === 0) return ["No Access", "none"];
  if (n >= 5) return ["Full Access", "full"];
  if (n === 1 && perms[0] === "View") return ["View Only", "view"];
  return ["Manage", "manage"];
}
export function seedPerms(role: string): Record<string, string[]> {
  const allowed = roleModules[role] || ["reports"];
  const full = role === "Top Management";
  const p: Record<string, string[]> = {};
  EMP_MODULES.forEach(([k]) => {
    if (full) p[k] = [...PERM_TYPES];
    else if (allowed.includes(k)) p[k] = k === "reports" ? ["View"] : ["View", "Create", "Edit"];
    else p[k] = [];
  });
  return p;
}
