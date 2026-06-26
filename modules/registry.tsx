import { ComponentType } from "react";
import { Dashboard } from "./Dashboard";
import { AgencyManagement } from "./AgencyManagement";
import { OnboardingReview } from "./OnboardingReview";
import { DriverVerification } from "./DriverVerification";
import { AmbulanceQueue } from "./AmbulanceQueue";
import { CustomerSupport } from "./CustomerSupport";
import { GPSTracking } from "./GPSTracking";
import { TicketsQueries } from "./TicketsQueries";
import { FeedbackManagement } from "./FeedbackManagement";
import { DocumentCenter } from "./DocumentCenter";
import { RevenueCommission } from "./RevenueCommission";
import { PayoutManagement } from "./PayoutManagement";
import { EmployeeManagement } from "./EmployeeManagement";
import { DriverOverview } from "./DriverOverview";
import { UsersCustomers } from "./UsersCustomers";
import { PlatformAnalytics } from "./PlatformAnalytics";
import { PlatformSettings } from "./PlatformSettings";

export type ModuleProps = { onNavigate: (key: string) => void };

export const SCREENS: Record<string, ComponentType<ModuleProps>> = {
  dashboard: Dashboard,
  agencies: AgencyManagement,
  onboarding: OnboardingReview,
  "drivers-q": DriverVerification,
  "ambulance-q": AmbulanceQueue,
  support: CustomerSupport,
  gps: GPSTracking,
  tickets: TicketsQueries,
  feedback: FeedbackManagement,
  documents: DocumentCenter,
  revenue: RevenueCommission,
  payouts: PayoutManagement,
  employees: EmployeeManagement,
  drivers: DriverOverview,
  users: UsersCustomers,
  analytics: PlatformAnalytics,
  settings: PlatformSettings,
};
