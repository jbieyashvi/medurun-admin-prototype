export type Agency = {
  id: number; name: string; city: string;
  status: "active" | "pending" | "inactive" | "rejected" | "offboarded";
  ambulances: number; drivers: number; revenue: string; rating: string;
  contact: string; phone: string; email: string; established: string; type?: string;
  offReason?: string; offNote?: string; offAt?: string;
};

export const agencies: Agency[] = [
  { id: 1, name: "LifeLine Ambulance", city: "Mumbai", status: "active", ambulances: 42, drivers: 67, revenue: "₹38.4L", rating: "4.8", contact: "Rahul Sharma", phone: "9820011234", email: "rahul@lifeline.com", established: "2019", type: "Private" },
  { id: 2, name: "Metro Medic Services", city: "Delhi", status: "active", ambulances: 35, drivers: 58, revenue: "₹31.2L", rating: "4.7", contact: "Priya Nair", phone: "9845112233", email: "priya@metromedic.com", established: "2020", type: "Private" },
  { id: 3, name: "RapidCare Emergency", city: "Bangalore", status: "pending", ambulances: 18, drivers: 24, revenue: "₹14.8L", rating: "4.5", contact: "Vikram Singh", phone: "9845033456", email: "vikram@rapidcare.com", established: "2023", type: "Private" },
  { id: 4, name: "Swift Ambulance Co.", city: "Hyderabad", status: "active", ambulances: 27, drivers: 41, revenue: "₹22.1L", rating: "4.6", contact: "Anita Reddy", phone: "9848456789", email: "anita@swift.com", established: "2021", type: "Private" },
  { id: 5, name: "CarePlus EMS", city: "Chennai", status: "inactive", ambulances: 12, drivers: 18, revenue: "₹9.3L", rating: "4.2", contact: "Ravi Kumar", phone: "9979567890", email: "ravi@careplus.com", established: "2018", type: "Private" },
  { id: 6, name: "Falcon Medical", city: "Pune", status: "active", ambulances: 22, drivers: 33, revenue: "₹18.7L", rating: "4.9", contact: "Sneha Patil", phone: "9820345678", email: "sneha@falcon.com", established: "2022", type: "Private" },
  { id: 7, name: "AidFirst Services", city: "Mumbai", status: "pending", ambulances: 8, drivers: 12, revenue: "—", rating: "—", contact: "Mohan Desai", phone: "9820077890", email: "mohan@aidfirst.com", established: "2024", type: "Private" },
  { id: 8, name: "NovaCare Ambulances", city: "Delhi", status: "active", ambulances: 31, drivers: 50, revenue: "₹27.6L", rating: "4.5", contact: "Sanjay Bose", phone: "9911789012", email: "sanjay@novacare.com", established: "2020", type: "Private" },
  { id: 9, name: "CityRescue EMS", city: "Kolkata", status: "rejected", ambulances: 0, drivers: 0, revenue: "—", rating: "—", contact: "Arif Khan", phone: "9831777888", email: "arif@cityrescue.com", established: "2024", type: "Private" },
  { id: 10, name: "Medivac Pro", city: "Ahmedabad", status: "active", ambulances: 19, drivers: 28, revenue: "₹16.2L", rating: "4.6", contact: "Bindu Shah", phone: "9979000123", email: "bindu@medivac.com", established: "2020", type: "Private" },
];

export const onboardingApps = [
  { id: 1, name: "SkyMedic Healthcare", city: "Pune", contact: "Arjun Tiwari", phone: "9820112233", docs: 5, status: "pending", submitted: "18 Jun 2026" },
  { id: 2, name: "RapidCare Emergency", city: "Bangalore", contact: "Vikram Singh", phone: "9845033456", docs: 3, status: "pending", submitted: "16 Jun 2026" },
  { id: 3, name: "CareFirst EMS", city: "Jaipur", contact: "Meena Sharma", phone: "9783223344", docs: 2, status: "flagged", submitted: "12 Jun 2026" },
  { id: 4, name: "QuickAid Services", city: "Lucknow", contact: "Dhruv Verma", phone: "9839334455", docs: 5, status: "pending", submitted: "10 Jun 2026" },
  { id: 5, name: "AidFirst Services", city: "Mumbai", contact: "Mohan Desai", phone: "9820077890", docs: 2, status: "flagged", submitted: "8 Jun 2026" },
  { id: 6, name: "SafeLife Ambulance", city: "Nagpur", contact: "Rekha Joshi", phone: "9822445566", docs: 4, status: "pending", submitted: "6 Jun 2026" },
  { id: 7, name: "MedRush Emergency", city: "Indore", contact: "Rohit Gupta", phone: "9826556677", docs: 5, status: "pending", submitted: "4 Jun 2026" },
];

export const ALL_DOCS = ["Registration Certificate", "GST Certificate", "Ambulance RC", "NOC Certificate", "Director ID"];
