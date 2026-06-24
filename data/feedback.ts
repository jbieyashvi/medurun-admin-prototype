export type FType = "Driver" | "Agency" | "Ambulance" | "Platform";
export type FStatus = "new" | "review" | "escalated" | "resolved";

export type FbNote = { name: string; time: string; text: string };
export type FbLog = { time: string; icon: string; text: string };

export type Feedback = {
  id: string; by: string; userType: "Customer" | "Driver" | "Agency";
  type: FType; target: string; agency: string;
  rating: number; category: string; comment: string;
  status: FStatus; date: string;
  notes: FbNote[]; activity: FbLog[]; resolution?: string; resolvedBy?: string; resolvedAt?: string;
};

export const FB_ST: Record<FStatus, [string, string]> = {
  new: ["New", "pending"], review: ["Under Review", "processing"],
  escalated: ["Escalated", "expiring"], resolved: ["Resolved", "verified"],
};

export const FB_CATEGORIES = [
  "Late Arrival", "Driver Behaviour", "Vehicle Cleanliness", "Booking Experience",
  "Payment Experience", "App Issue", "Customer Support",
];

const log = (date: string, t: string, icon: string, text: string): FbLog => ({ time: `${date} · ${t}`, icon, text });

export const feedback: Feedback[] = [
  {
    id: "FB-50231", by: "Priya Mehta", userType: "Customer", type: "Driver", target: "Ravi Shankar", agency: "LifeLine Ambulance",
    rating: 2, category: "Late Arrival", comment: "Ambulance arrived 18 minutes late during an emergency. Driver did not respond to calls while en route.",
    status: "new", date: "22 Jun 2026",
    notes: [], activity: [log("22 Jun 2026", "10:12 AM", "Plus", "Feedback submitted via customer app")],
  },
  {
    id: "FB-50230", by: "Karthik Reddy", userType: "Customer", type: "Agency", target: "Metro Medic Services", agency: "Metro Medic Services",
    rating: 1, category: "Customer Support", comment: "No response from agency support line for a billing dispute. Extremely poor experience.",
    status: "review", date: "22 Jun 2026",
    notes: [{ name: "Neha Kulkarni", time: "22 Jun 2026 · 11:20 AM", text: "Repeated complaint pattern against this agency this month." }],
    activity: [log("22 Jun 2026", "09:40 AM", "Plus", "Feedback submitted via web"), log("22 Jun 2026", "11:00 AM", "UserCheck", "Assigned for review · Neha Kulkarni"), log("22 Jun 2026", "11:20 AM", "StickyNote", "Internal note added · Neha Kulkarni")],
  },
  {
    id: "FB-50229", by: "Ananya Iyer", userType: "Customer", type: "Driver", target: "Anil Mishra", agency: "Falcon Medical",
    rating: 1, category: "Driver Behaviour", comment: "Driver was rude and refused to follow the hospital route requested. Felt unsafe during the ride.",
    status: "escalated", date: "21 Jun 2026",
    notes: [{ name: "Neha Kulkarni", time: "21 Jun 2026 · 02:10 PM", text: "Escalated to Operations Team — driver behaviour pattern." }],
    activity: [log("21 Jun 2026", "01:00 PM", "Plus", "Feedback submitted via customer app"), log("21 Jun 2026", "01:30 PM", "UserCheck", "Assigned for review · Neha Kulkarni"), log("21 Jun 2026", "02:10 PM", "TrendingUp", "Escalated to Operations · Neha Kulkarni")],
  },
  {
    id: "FB-50228", by: "Sunita Sharma", userType: "Customer", type: "Ambulance", target: "MH01-AB-1234", agency: "LifeLine Ambulance",
    rating: 3, category: "Vehicle Cleanliness", comment: "Vehicle interior was not properly sanitized. Oxygen equipment looked old.",
    status: "review", date: "21 Jun 2026",
    notes: [], activity: [log("21 Jun 2026", "08:15 AM", "Plus", "Feedback submitted via web"), log("21 Jun 2026", "09:00 AM", "UserCheck", "Assigned for review · Rohan Desai")],
  },
  {
    id: "FB-50227", by: "Rahul Gupta", userType: "Customer", type: "Platform", target: "Medurun App", agency: "—",
    rating: 2, category: "App Issue", comment: "Booking screen freezes when selecting ICU ambulance. Had to retry 4 times.",
    status: "new", date: "20 Jun 2026",
    notes: [], activity: [log("20 Jun 2026", "06:50 PM", "Plus", "Feedback submitted via customer app")],
  },
  {
    id: "FB-50226", by: "Mohammed Iqbal", userType: "Driver", type: "Platform", target: "Medurun App", agency: "Swift Ambulance",
    rating: 4, category: "App Issue", comment: "Driver app navigation is good but ride acceptance sometimes lags by a few seconds.",
    status: "resolved", date: "20 Jun 2026",
    notes: [{ name: "Rohan Desai", time: "20 Jun 2026 · 03:00 PM", text: "Forwarded to product team; patch scheduled." }],
    activity: [log("20 Jun 2026", "10:00 AM", "Plus", "Feedback submitted via driver app"), log("20 Jun 2026", "11:00 AM", "UserCheck", "Assigned for review · Rohan Desai"), log("20 Jun 2026", "03:30 PM", "Check", "Marked resolved · Rohan Desai")],
    resolution: "Acknowledged and forwarded to product team. Performance patch scheduled for next release.", resolvedBy: "Rohan Desai", resolvedAt: "20 Jun 2026 · 03:30 PM",
  },
  {
    id: "FB-50225", by: "Deepak Nair", userType: "Customer", type: "Agency", target: "RapidCare", agency: "RapidCare",
    rating: 5, category: "Booking Experience", comment: "Excellent service, quick response and professional staff. Highly recommend.",
    status: "resolved", date: "19 Jun 2026",
    notes: [], activity: [log("19 Jun 2026", "12:00 PM", "Plus", "Feedback submitted via web"), log("19 Jun 2026", "01:00 PM", "Check", "Marked resolved · Neha Kulkarni")],
    resolution: "Positive feedback acknowledged. Shared with agency.", resolvedBy: "Neha Kulkarni", resolvedAt: "19 Jun 2026 · 01:00 PM",
  },
  {
    id: "FB-50224", by: "Vijay Nair", userType: "Customer", type: "Platform", target: "Medurun App", agency: "—",
    rating: 2, category: "Payment Experience", comment: "Double charged for one booking. Refund still pending after 3 days.",
    status: "escalated", date: "19 Jun 2026",
    notes: [{ name: "Neha Kulkarni", time: "19 Jun 2026 · 04:20 PM", text: "Escalated to Finance for refund processing." }],
    activity: [log("19 Jun 2026", "02:00 PM", "Plus", "Feedback submitted via customer app"), log("19 Jun 2026", "03:00 PM", "UserCheck", "Assigned for review · Neha Kulkarni"), log("19 Jun 2026", "04:20 PM", "TrendingUp", "Escalated to Finance · Neha Kulkarni")],
  },
  {
    id: "FB-50223", by: "Ashok Jain", userType: "Customer", type: "Driver", target: "Suresh Kumar", agency: "Metro Medic Services",
    rating: 4, category: "Driver Behaviour", comment: "Driver was courteous and calm during a stressful situation. Minor delay in arrival.",
    status: "new", date: "18 Jun 2026",
    notes: [], activity: [log("18 Jun 2026", "07:30 AM", "Plus", "Feedback submitted via web")],
  },
  {
    id: "FB-50222", by: "Sunita Sharma", userType: "Customer", type: "Driver", target: "Anil Mishra", agency: "Falcon Medical",
    rating: 2, category: "Late Arrival", comment: "Second late arrival this month from the same driver. Needs attention.",
    status: "review", date: "18 Jun 2026",
    notes: [{ name: "Rohan Desai", time: "18 Jun 2026 · 10:00 AM", text: "Repeated complaint against this driver — flag for Operations." }],
    activity: [log("18 Jun 2026", "08:00 AM", "Plus", "Feedback submitted via customer app"), log("18 Jun 2026", "09:30 AM", "UserCheck", "Assigned for review · Rohan Desai"), log("18 Jun 2026", "10:00 AM", "StickyNote", "Internal note added · Rohan Desai")],
  },
];
