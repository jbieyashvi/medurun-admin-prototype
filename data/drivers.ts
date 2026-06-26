export type Driver = {
  name: string; phone: string; agency: string; city: string;
  license: string; rides: number; rating: string;
  status: "active" | "inactive" | "blocked" | "offboarded";
  offReason?: string; offNote?: string; offAt?: string;
};

export const drivers: Driver[] = [
  { name: "Ravi Shankar", phone: "9820123456", agency: "LifeLine", city: "Mumbai", license: "MH0120240012345", rides: 284, rating: "4.9", status: "active" },
  { name: "Suresh Kumar", phone: "9845234567", agency: "Metro Medic", city: "Delhi", license: "DL0120230056789", rides: 221, rating: "4.8", status: "active" },
  { name: "Anil Mishra", phone: "9820345678", agency: "Falcon", city: "Pune", license: "MH1220230098765", rides: 178, rating: "4.7", status: "active" },
  { name: "Mohammed Iqbal", phone: "9848456789", agency: "Swift", city: "Hyderabad", license: "TS0920240023456", rides: 312, rating: "4.9", status: "active" },
  { name: "Ramesh Patel", phone: "9979567890", agency: "Medivac", city: "Ahmedabad", license: "GJ0120240034567", rides: 156, rating: "4.5", status: "inactive" },
  { name: "Deepak Nair", phone: "9845678901", agency: "RapidCare", city: "Bangalore", license: "KA0420230045678", rides: 201, rating: "4.6", status: "active" },
  { name: "Santosh Yadav", phone: "9911789012", agency: "NovaCare", city: "Delhi", license: "DL0820230056789", rides: 89, rating: "4.3", status: "inactive" },
];

export type QueueDriver = {
  name: string; phone: string; agency: string; city: string;
  docs: string; status: "pending" | "review"; submitted: string;
};

export const driverQueue: QueueDriver[] = [
  { name: "Ravi Shankar", phone: "9820123456", agency: "LifeLine Ambulance", city: "Mumbai", docs: "4/5", status: "pending", submitted: "20 Jun 2026" },
  { name: "Suresh Kumar", phone: "9845234567", agency: "Metro Medic", city: "Delhi", docs: "5/5", status: "pending", submitted: "19 Jun 2026" },
  { name: "Anil Mishra", phone: "9820345678", agency: "Falcon Medical", city: "Pune", docs: "3/5", status: "review", submitted: "18 Jun 2026" },
  { name: "Mohammed Iqbal", phone: "9848456789", agency: "Swift Ambulance", city: "Hyderabad", docs: "5/5", status: "pending", submitted: "18 Jun 2026" },
  { name: "Ramesh Patel", phone: "9979567890", agency: "Medivac Pro", city: "Ahmedabad", docs: "2/5", status: "review", submitted: "17 Jun 2026" },
  { name: "Deepak Nair", phone: "9845678901", agency: "RapidCare", city: "Bangalore", docs: "4/5", status: "pending", submitted: "16 Jun 2026" },
  { name: "Kiran Thakur", phone: "9820890123", agency: "LifeLine Ambulance", city: "Mumbai", docs: "5/5", status: "pending", submitted: "15 Jun 2026" },
];

export type DriverDoc = { name: string; required: boolean };
export const DRIVER_DOCS: DriverDoc[] = [
  { name: "Driving Licence", required: true },
  { name: "PAN Card", required: true },
  { name: "Aadhaar Card / Voter ID", required: true },
  { name: "Bank Passbook", required: true },
  { name: "Passport Size Photo", required: false },
];

export type Customer = {
  name: string; phone: string; city: string; rides: number; spent: string; last: string;
  status: "active" | "inactive" | "blocked";
};

export const customers: Customer[] = [
  { name: "Priya Mehta", phone: "9820111222", city: "Mumbai", rides: 12, spent: "₹24,800", last: "Today", status: "active" },
  { name: "Rahul Gupta", phone: "9911222333", city: "Delhi", rides: 8, spent: "₹16,400", last: "Yesterday", status: "active" },
  { name: "Ananya Iyer", phone: "9845333444", city: "Bangalore", rides: 21, spent: "₹48,200", last: "Today", status: "active" },
  { name: "Karthik Reddy", phone: "9848444555", city: "Hyderabad", rides: 5, spent: "₹9,800", last: "3 days ago", status: "active" },
  { name: "Sunita Sharma", phone: "9820555666", city: "Mumbai", rides: 34, spent: "₹72,400", last: "Today", status: "active" },
  { name: "Vijay Nair", phone: "9791666777", city: "Chennai", rides: 2, spent: "₹4,200", last: "2 weeks ago", status: "inactive" },
  { name: "Monika Das", phone: "9831777888", city: "Kolkata", rides: 0, spent: "₹0", last: "1 month ago", status: "blocked" },
  { name: "Ashok Jain", phone: "9979888999", city: "Ahmedabad", rides: 15, spent: "₹32,100", last: "Today", status: "active" },
];
