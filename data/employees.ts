export type Employee = {
  name: string; empId: string; email: string; phone: string; dept: string; role: string;
  status: "online" | "offline" | "suspended" | "invited"; last: string; created: string; by: string;
  perms?: Record<string, string[]>;
};

export const EMP_MODULES: [string, string][] = [
  ["agencies", "Agency Data"], ["onboarding", "Onboarding Review"],
  ["drivers-q", "Driver Verification"], ["ambulance-q", "Ambulance Data"],
  ["gps", "GPS Tracking"], ["tickets", "Tickets & Queries"],
  ["revenue", "Revenue & Commission"], ["payouts", "Payout Management"],
  ["reports", "Reports"], ["users", "Customer Data"],
  ["settings", "Pricing & Settings"], ["employees", "Employee Management"],
];
export const PERM_TYPES = ["View", "Create", "Edit", "Delete", "Approve"];
export const EMP_ST: Record<string, [string, string]> = {
  online: ["Online", "active"], offline: ["Offline", "inactive"],
  suspended: ["Suspended", "rejected"], invited: ["Invited", "pending"],
};
export const roleModules: Record<string, string[]> = {
  "Super Admin": EMP_MODULES.map((m) => m[0]),
  Operations: ["agencies", "onboarding", "drivers-q", "ambulance-q", "gps"],
  Finance: ["revenue", "payouts", "reports"],
  "Customer Support": ["tickets", "reports"],
  Marketing: ["reports"],
  "Custom Role": ["agencies", "tickets"],
};

export const employees: Employee[] = [
  { name: "Arjun Mehta", empId: "EMP-1001", email: "arjun@medurun.in", phone: "9820000001", dept: "Administration", role: "Super Admin", status: "online", last: "Active now", created: "02 Jan 2024", by: "System" },
  { name: "Neha Kulkarni", empId: "EMP-1004", email: "neha@medurun.in", phone: "9820000004", dept: "Customer Support", role: "Customer Support", status: "online", last: "2 min ago", created: "14 Feb 2024", by: "Arjun Mehta" },
  { name: "Rohan Desai", empId: "EMP-1007", email: "rohan@medurun.in", phone: "9820000007", dept: "Operations", role: "Operations", status: "online", last: "12 min ago", created: "21 Mar 2024", by: "Arjun Mehta" },
  { name: "Kavya Rao", empId: "EMP-1009", email: "kavya@medurun.in", phone: "9820000009", dept: "Finance", role: "Finance", status: "offline", last: "3 hours ago", created: "05 Apr 2024", by: "Arjun Mehta" },
  { name: "Imran Shaikh", empId: "EMP-1012", email: "imran@medurun.in", phone: "9820000012", dept: "Operations", role: "Operations", status: "offline", last: "Yesterday", created: "19 May 2024", by: "Rohan Desai" },
  { name: "Sara Pinto", empId: "EMP-1015", email: "sara@medurun.in", phone: "9820000015", dept: "Marketing", role: "Marketing", status: "offline", last: "2 days ago", created: "08 Jun 2024", by: "Arjun Mehta" },
  { name: "Vikram Joshi", empId: "EMP-1018", email: "vikram@medurun.in", phone: "9820000018", dept: "Finance", role: "Finance", status: "suspended", last: "1 week ago", created: "22 Jun 2024", by: "Kavya Rao" },
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
  const full = role === "Super Admin";
  const p: Record<string, string[]> = {};
  EMP_MODULES.forEach(([k]) => {
    if (full) p[k] = [...PERM_TYPES];
    else if (allowed.includes(k)) p[k] = k === "reports" ? ["View"] : ["View", "Create", "Edit"];
    else p[k] = [];
  });
  return p;
}
