export type UserRole = 'TRAVELLER' | 'POLICE' | 'ADMIN';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export type AlertType =
  | 'SOS'
  | 'USER_REPORTED_UNSAFE'
  | 'MISSED_CHECKIN'
  | 'PHONE_UNREACHABLE'
  | 'LOW_BATTERY_LAST_LOCATION'
  | 'NO_VEHICLE_INFO'
  | 'TRIP_OVERDUE'
  | 'ROUTE_DEVIATION';

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_ALARM';

export type TripStatus =
  | 'DRAFT'
  | 'AWAITING_VEHICLE'
  | 'ACTIVE'
  | 'CHECKIN_PENDING'
  | 'ALERT_RAISED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PoliceOfficer {
  id: string;
  name: string;
  badgeNumber: string;
  rank: string;
  stationId: string;
  stationName: string;
  role: UserRole;
  avatar?: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  code: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  jurisdictionColor: string;
  jurisdictionPolygon: [number, number][]; // [lat, lng] array
}

export interface LocationPoint {
  id: string;
  lat: number;
  lng: number;
  accuracy_m: number;
  speed_kmh: number;
  heading: number;
  battery_pct: number;
  is_charging: boolean;
  network: string;
  recorded_at: string;
}

export interface Checkin {
  id: string;
  sequence: number;
  asked_at: string;
  deadline_at: string;
  responded_at?: string;
  response?: 'SAFE' | 'UNSAFE';
  outcome: 'PENDING' | 'OK' | 'ALERTED_UNSAFE' | 'ALERTED_MISSED';
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notify_whatsapp: boolean;
  smsStatus: 'SENT' | 'DELIVERED' | 'LINK_OPENED';
}

export interface DispatchUnitInfo {
  dispatched_at: string;
  unit_callsign: string;
  officer_in_charge: string;
  eta_minutes: number;
  notes: string;
}

export interface Alert {
  id: string;
  trip_id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  raised_at: string;
  location: {
    lat: number;
    lng: number;
  };
  station_id: string;
  station_name: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  resolution_outcome?: string;
  snapshot: {
    traveller_name: string;
    traveller_phone: string;
    vehicle_number: string;
    battery_pct: number;
    accuracy_m: number;
    speed_kmh: number;
  };
  is_simulation?: boolean;
  source?: string;
}

export interface Trip {
  id: string;
  traveller_id: string;
  traveller_name: string;
  traveller_phone: string;
  is_simulation?: boolean;
  source?: string;
  status: TripStatus;
  started_at: string;
  expected_duration_s: number;
  ends_at: string;
  destination_name?: string;
  destination?: {
    lat: number;
    lng: number;
  };
  vehicle_number?: string;
  vehicle_entered_at?: string;
  vehicle_deadline_at: string;
  next_checkin_due_at?: string;
  checkin_deadline_at?: string;
  last_heartbeat_at: string;
  last_location: {
    lat: number;
    lng: number;
  };
  last_accuracy_m: number;
  last_battery_pct: number;
  current_station_id: string;
  current_station_name: string;
  share_token: string;
  contacts: TrustedContact[];
  location_history: LocationPoint[];
  checkins: Checkin[];
  alerts: Alert[];
  completed_at?: string;
  dispatchInfo?: DispatchUnitInfo;
}

export type Pt = { lat: number; lng: number; ts?: string };
export type Loc = { lat: number; lng: number; accuracy_m?: number; ts?: string };

export interface PoliceDashboardStats {
  activeTripsCount: number;
  openAlertsCount: number;
  criticalAlertsCount: number;
  highAlertsCount: number;
  mediumAlertsCount: number;
  acknowledgedTodayCount: number;
  resolvedTodayCount: number;
  avgAckTimeSeconds: number;
  activeStationsCount: number;
}
