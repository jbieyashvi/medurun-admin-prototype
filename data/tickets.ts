export type TicketSource = "Customer" | "Driver" | "Agency" | "Support Agent";

export type Ticket = {
  id: string; user: string; cid: string; phone: string; booking: string;
  category: string; priority: "urgent" | "high" | "medium" | "low";
  status: "open" | "under-review" | "in-progress" | "resolved";
  dept: string; created: string; issue: string; team: string; live: boolean;
  source: TicketSource;
  slaDeadline: string; slaRemaining: string; slaBreached: boolean;
  driverStatus?: string; location?: string;
};

export const tickets: Ticket[] = [
  { id: "TKT-10293", user: "Priya Mehta", cid: "CUST-90231", phone: "9820111222", booking: "BK-90231", category: "Billing", priority: "high", status: "open", dept: "Finance", created: "22 Jun 2026", issue: "Customer charged twice for booking BK-90231. Requesting refund for the duplicate transaction.", team: "Finance Support", live: false, source: "Customer", slaDeadline: "23 Jun 2026 · 10:32 AM", slaRemaining: "4h 12m left", slaBreached: false },
  { id: "TKT-10292", user: "Ravi Shankar", cid: "DRV-1042", phone: "9820123456", booking: "BK-90228", category: "Driver App", priority: "urgent", status: "in-progress", dept: "Tech Support", created: "22 Jun 2026", issue: "Driver app crashes while accepting rides. Driver unable to go online.", team: "Tech Support", live: true, source: "Driver", slaDeadline: "22 Jun 2026 · 02:32 PM", slaRemaining: "Breached by 1h 20m", slaBreached: true, driverStatus: "On Ride", location: "Andheri East, Mumbai" },
  { id: "TKT-10291", user: "Karthik Reddy", cid: "CUST-90228", phone: "9848444555", booking: "BK-90228", category: "Ride Issue", priority: "urgent", status: "open", dept: "Operations", created: "22 Jun 2026", issue: "Ambulance reached late during emergency. Need urgent review of dispatch.", team: "Operations", live: true, source: "Customer", slaDeadline: "22 Jun 2026 · 01:10 PM", slaRemaining: "38m left", slaBreached: false, driverStatus: "Available", location: "Bandra West, Mumbai" },
  { id: "TKT-10290", user: "Sunita Sharma", cid: "CUST-90220", phone: "9820555666", booking: "BK-90220", category: "Safety / SOS", priority: "urgent", status: "under-review", dept: "Operations", created: "21 Jun 2026", issue: "SOS button triggered mid-ride. Requesting incident report and immediate follow-up.", team: "Operations", live: true, source: "Customer", slaDeadline: "21 Jun 2026 · 06:00 PM", slaRemaining: "Breached by 2h 05m", slaBreached: true, driverStatus: "SOS Active", location: "Western Express Hwy, Mumbai" },
  { id: "TKT-10289", user: "Metro Medic", cid: "AGN-2", phone: "9845234567", booking: "—", category: "Payout", priority: "medium", status: "under-review", dept: "Finance", created: "21 Jun 2026", issue: "Monthly payout not received for May cycle. Settlement pending.", team: "Finance Support", live: false, source: "Agency", slaDeadline: "24 Jun 2026 · 12:00 PM", slaRemaining: "1d 6h left", slaBreached: false },
  { id: "TKT-10288", user: "Ananya Iyer", cid: "CUST-90215", phone: "9845333444", booking: "BK-90215", category: "Billing", priority: "low", status: "open", dept: "Finance", created: "20 Jun 2026", issue: "Invoice GST details incorrect, need corrected invoice.", team: "Finance Support", live: false, source: "Customer", slaDeadline: "25 Jun 2026 · 10:00 AM", slaRemaining: "2d 4h left", slaBreached: false },
  { id: "TKT-10287", user: "Mohammed Iqbal", cid: "DRV-1088", phone: "9848456789", booking: "—", category: "Verification", priority: "medium", status: "in-progress", dept: "Compliance", created: "20 Jun 2026", issue: "Police verification document rejected, needs re-review.", team: "Compliance", live: false, source: "Driver", slaDeadline: "23 Jun 2026 · 05:00 PM", slaRemaining: "9h 40m left", slaBreached: false },
  { id: "TKT-10286", user: "Rahul Gupta", cid: "CUST-90208", phone: "9911222333", booking: "BK-90208", category: "Ride Issue", priority: "high", status: "resolved", dept: "Operations", created: "19 Jun 2026", issue: "Wrong drop location recorded. Resolved with corrected fare.", team: "Operations", live: false, source: "Support Agent", slaDeadline: "20 Jun 2026 · 11:00 AM", slaRemaining: "Resolved within SLA", slaBreached: false, driverStatus: "Offline", location: "Powai, Mumbai" },
  { id: "TKT-10285", user: "CarePlus EMS", cid: "AGN-6", phone: "9979567890", booking: "—", category: "Onboarding", priority: "low", status: "resolved", dept: "Compliance", created: "19 Jun 2026", issue: "NOC document upload failing. Resolved after portal fix.", team: "Compliance", live: false, source: "Agency", slaDeadline: "21 Jun 2026 · 03:00 PM", slaRemaining: "Resolved within SLA", slaBreached: false },
];

export const TK_STATUS: Record<string, [string, string]> = {
  open: ["Open", "pending"], "under-review": ["Under Review", "review"],
  "in-progress": ["In Progress", "processing"], resolved: ["Resolved", "verified"],
};
export const TK_PRIO: Record<string, string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };
export const GPS_CATEGORIES = ["Ride Issue", "Safety / SOS", "Driver App"];
