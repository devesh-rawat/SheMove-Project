export type Status =
  | "AWAITING_VEHICLE" | "ACTIVE" | "CHECKIN_PENDING"
  | "ALERT_RAISED" | "COMPLETED" | "RESOLVED" | "CANCELLED";

export interface Pt { lat: number; lng: number; ts: string }
export interface Loc extends Pt { accuracy_m?: number }

export interface Alert {
  id: string;
  type: string; // SOS | USER_REPORTED_UNSAFE | MISSED_CHECKIN | PHONE_UNREACHABLE | NO_VEHICLE_INFO | TRIP_OVERDUE | LOW_BATTERY_LAST_LOCATION
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "FALSE_ALARM";
  raised_at: string;
}

/** GET /public/track/{token} */
export interface Trip {
  traveller_name: string;          // first name only
  traveller_phone?: string | null; // optional; hides "Call" button if absent
  status: Status;
  vehicle_number?: string | null;
  started_at: string;
  ends_at: string;
  completed_at?: string | null;
  last_location?: Loc | null;
  battery?: number | null;
  last_checkin_at?: string | null;
  alert?: Alert | null;
  trail: Pt[];
}

/** WS /ws/track/{token} envelope */
export interface WsEvent {
  type: "location" | "status" | "alert" | "checkin" | "completed";
  ts: string;
  data: any;
}
