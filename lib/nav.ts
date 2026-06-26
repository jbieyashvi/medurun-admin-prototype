export type NavItem = { key: string; label: string; icon: string; badge?: number };
export type NavSection = { title: string; items: NavItem[] };

export const NAV: NavSection[] = [
  { title: "Overview", items: [{ key: "dashboard", label: "Dashboard", icon: "LayoutDashboard" }] },
  {
    title: "Management",
    items: [
      { key: "agencies", label: "Agency Data", icon: "Building2" },
      { key: "onboarding", label: "Onboarding Review", icon: "ClipboardCheck", badge: 7 },
      { key: "drivers-q", label: "Driver Verification", icon: "UserCheck", badge: 12 },
      { key: "ambulance-q", label: "Ambulance Data", icon: "Ambulance", badge: 5 },
      { key: "support", label: "Customer Support", icon: "Headset" },
    ],
  },
  {
    title: "Finance",
    items: [
      { key: "revenue", label: "Revenue & Commission", icon: "IndianRupee" },
      { key: "payouts", label: "Payout Management", icon: "CreditCard" },
    ],
  },
  {
    title: "People",
    items: [
      { key: "drivers", label: "Driver Data", icon: "Car" },
      { key: "users", label: "Customer Data", icon: "Users" },
      { key: "employees", label: "Employee Management", icon: "UserCog" },
    ],
  },
  { title: "Insights", items: [{ key: "analytics", label: "Platform Analytics", icon: "LineChart" }] },
  { title: "System", items: [{ key: "settings", label: "Platform Settings", icon: "Settings" }] },
];

export const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard", agencies: "Agency Data", onboarding: "Onboarding Review",
  "drivers-q": "Driver Verification Queue", "ambulance-q": "Ambulance Data", support: "Customer Support", gps: "GPS Tracking",
  tickets: "Tickets & Queries", feedback: "Feedback Management", documents: "Document Center", revenue: "Revenue & Commission",
  payouts: "Payout Management", drivers: "Driver Data", users: "Customer Data",
  employees: "Employee Management", analytics: "Platform Analytics", settings: "Platform Settings",
};
