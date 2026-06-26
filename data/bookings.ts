export type BookingStatus = "ongoing" | "completed" | "cancelled" | "scheduled" | "issue";

export type TimelineStep = { label: string; time?: string; done: boolean; active?: boolean };

export type Booking = {
  id: string;
  status: BookingStatus;
  rideType: string;
  ambType: string;
  bookedAt: string;
  pickup: string;
  drop: string;
  customer: { name: string; phone: string; email?: string };
  driver: { name: string; phone: string; driverId: string };
  agency?: { name: string; contact: string; agencyId: string };
  timeline: TimelineStep[];
  fare: {
    base: number; distance: number; waiting?: number; discount?: number;
    taxes: number; final: number; method: string; paymentStatus: "paid" | "pending" | "failed" | "refunded";
  };
};

export const BOOKING_STATUS_META: Record<BookingStatus, [string, string]> = {
  ongoing: ["Ongoing", "active"],
  completed: ["Completed", "verified"],
  cancelled: ["Cancelled", "rejected"],
  scheduled: ["Scheduled", "pending"],
  issue: ["Issue Raised", "review"],
};

const TL_COMPLETED = (start: string): TimelineStep[] => [
  { label: "Booking Created", time: start, done: true },
  { label: "Driver Assigned", time: "2 min later", done: true },
  { label: "Ambulance En Route", time: "3 min later", done: true },
  { label: "Arrived at Pickup", time: "12 min later", done: true },
  { label: "Ride Started", time: "14 min later", done: true },
  { label: "Ride Completed", time: "48 min later", done: true },
];
const TL_ONGOING = (start: string): TimelineStep[] => [
  { label: "Booking Created", time: start, done: true },
  { label: "Driver Assigned", time: "1 min later", done: true },
  { label: "Ambulance En Route", time: "2 min later", done: true },
  { label: "Arrived at Pickup", time: "10 min later", done: true },
  { label: "Ride Started", time: "12 min later", done: true, active: true },
  { label: "Ride Completed", done: false },
];
const TL_CANCELLED = (start: string): TimelineStep[] => [
  { label: "Booking Created", time: start, done: true },
  { label: "Driver Assigned", time: "3 min later", done: true },
  { label: "Ambulance En Route", time: "4 min later", done: true },
  { label: "Cancelled by Customer", time: "6 min later", done: true, active: true },
];
const TL_SCHEDULED = (start: string): TimelineStep[] => [
  { label: "Booking Created", time: start, done: true, active: true },
  { label: "Driver Assigned", done: false },
  { label: "Ambulance En Route", done: false },
  { label: "Arrived at Pickup", done: false },
  { label: "Ride Started", done: false },
  { label: "Ride Completed", done: false },
];

export const bookings: Booking[] = [
  {
    id: "BK-90231", status: "ongoing", rideType: "Emergency", ambType: "ALS",
    bookedAt: "22 Jun 2026 · 03:42 PM",
    pickup: "Andheri East, Mumbai — Powai Hospital",
    drop: "Lilavati Hospital, Bandra West, Mumbai",
    customer: { name: "Priya Mehta", phone: "9820011001", email: "priya.m@gmail.com" },
    driver: { name: "Ravi Shankar", phone: "9820123456", driverId: "DRV-1001" },
    agency: { name: "LifeLine Ambulance", contact: "Rahul Sharma · 9820011234", agencyId: "AG-0001" },
    timeline: TL_ONGOING("03:42 PM"),
    fare: { base: 800, distance: 920, waiting: 60, taxes: 318, final: 2098, method: "UPI", paymentStatus: "pending" },
  },
  {
    id: "BK-90228", status: "completed", rideType: "Pre-booked", ambType: "BLS",
    bookedAt: "22 Jun 2026 · 02:10 PM",
    pickup: "Banjara Hills, Hyderabad",
    drop: "Apollo Hospital, Jubilee Hills, Hyderabad",
    customer: { name: "Karthik Reddy", phone: "9848112233", email: "karthik.r@outlook.com" },
    driver: { name: "Mohammed Iqbal", phone: "9848456789", driverId: "DRV-1042" },
    agency: { name: "Swift Ambulance", contact: "Anita Reddy · 9848456789", agencyId: "AG-0004" },
    timeline: TL_COMPLETED("02:10 PM"),
    fare: { base: 600, distance: 740, taxes: 241, discount: 100, final: 1481, method: "Card", paymentStatus: "paid" },
  },
  {
    id: "BK-90220", status: "issue", rideType: "Emergency", ambType: "ALS",
    bookedAt: "22 Jun 2026 · 01:05 PM",
    pickup: "Hinjewadi Phase 2, Pune",
    drop: "Ruby Hall Clinic, Pune",
    customer: { name: "Sunita Sharma", phone: "9820345001" },
    driver: { name: "Anil Mishra", phone: "9820345678", driverId: "DRV-1078" },
    agency: { name: "Falcon Medical", contact: "Sneha Patil · 9820345678", agencyId: "AG-0006" },
    timeline: TL_ONGOING("01:05 PM"),
    fare: { base: 800, distance: 1100, waiting: 180, taxes: 374, final: 2454, method: "UPI", paymentStatus: "failed" },
  },
  {
    id: "BK-90215", status: "completed", rideType: "Pre-booked", ambType: "ICU",
    bookedAt: "22 Jun 2026 · 11:48 AM",
    pickup: "Powai, Mumbai",
    drop: "Tata Memorial Hospital, Parel, Mumbai",
    customer: { name: "Ashok Jain", phone: "9820890001", email: "ashok.jain@gmail.com" },
    driver: { name: "Kiran Thakur", phone: "9820890123", driverId: "DRV-1109" },
    agency: { name: "LifeLine Ambulance", contact: "Rahul Sharma · 9820011234", agencyId: "AG-0001" },
    timeline: TL_COMPLETED("11:48 AM"),
    fare: { base: 1200, distance: 1480, taxes: 482, final: 3162, method: "UPI", paymentStatus: "paid" },
  },
  {
    id: "BK-90211", status: "cancelled", rideType: "Emergency", ambType: "BLS",
    bookedAt: "22 Jun 2026 · 10:32 AM",
    pickup: "Koramangala 4th Block, Bangalore",
    drop: "Manipal Hospital, HAL Old Airport Rd",
    customer: { name: "Deepa Iyer", phone: "9845112002" },
    driver: { name: "Deepak Nair", phone: "9845678901", driverId: "DRV-1133" },
    agency: { name: "RapidCare Emergency", contact: "Vikram Singh · 9845033456", agencyId: "AG-0003" },
    timeline: TL_CANCELLED("10:32 AM"),
    fare: { base: 600, distance: 0, taxes: 108, final: 708, method: "UPI", paymentStatus: "refunded" },
  },
  {
    id: "BK-90207", status: "completed", rideType: "Emergency", ambType: "BLS",
    bookedAt: "22 Jun 2026 · 09:15 AM",
    pickup: "Connaught Place, Delhi",
    drop: "AIIMS Delhi",
    customer: { name: "Manish Verma", phone: "9911445566", email: "manish.v@yahoo.com" },
    driver: { name: "Suresh Kumar", phone: "9845234567", driverId: "DRV-1054" },
    agency: { name: "Metro Medic Services", contact: "Priya Nair · 9845112233", agencyId: "AG-0002" },
    timeline: TL_COMPLETED("09:15 AM"),
    fare: { base: 600, distance: 580, taxes: 212, final: 1392, method: "Cash", paymentStatus: "paid" },
  },
  {
    id: "BK-90203", status: "scheduled", rideType: "Pre-booked", ambType: "Neonatal",
    bookedAt: "23 Jun 2026 · 07:00 AM (scheduled)",
    pickup: "Bandra West, Mumbai (Home pickup)",
    drop: "Hinduja Hospital, Mahim, Mumbai",
    customer: { name: "Bindu Shah", phone: "9979000123", email: "bindu.shah@hotmail.com" },
    driver: { name: "Ramesh Patel", phone: "9979567890", driverId: "DRV-1162" },
    agency: { name: "Medivac Pro", contact: "Bindu Shah · 9979000123", agencyId: "AG-0010" },
    timeline: TL_SCHEDULED("21 Jun 2026 · 06:20 PM"),
    fare: { base: 1500, distance: 0, taxes: 270, final: 1770, method: "UPI", paymentStatus: "pending" },
  },
  {
    id: "BK-90199", status: "completed", rideType: "Pre-booked", ambType: "BLS",
    bookedAt: "21 Jun 2026 · 05:45 PM",
    pickup: "Whitefield, Bangalore",
    drop: "Columbia Asia, Yeshwanthpur, Bangalore",
    customer: { name: "Vinod Krishnan", phone: "9791666222" },
    driver: { name: "Vijay Nair", phone: "9791666777", driverId: "DRV-1187" },
    timeline: TL_COMPLETED("05:45 PM"),
    fare: { base: 600, distance: 880, taxes: 266, discount: 50, final: 1696, method: "Card", paymentStatus: "paid" },
  },
];
