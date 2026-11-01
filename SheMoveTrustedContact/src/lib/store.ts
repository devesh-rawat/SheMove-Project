import {
  Alert,
  AlertSeverity,
  AlertStatus,
  AlertType,
  Checkin,
  LocationPoint,
  PoliceDashboardStats,
  PoliceOfficer,
  PoliceStation,
  Trip,
  TripStatus,
  TrustedContact,
} from './types';

// Default Demo Officers
export const DEMO_OFFICERS: PoliceOfficer[] = [
  {
    id: 'off-01',
    name: 'Inspector Vikramaditya Singh',
    badgeNumber: 'DL-POL-4412',
    rank: 'Station House Officer (SHO)',
    stationId: 'st-cp-01',
    stationName: 'Central Division - Connaught Place PS',
    role: 'POLICE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
  },
  {
    id: 'off-02',
    name: 'ACP Radhika Sharma',
    badgeNumber: 'DL-POL-1089',
    rank: 'Assistant Commissioner of Police',
    stationId: 'st-hk-02',
    stationName: 'South Division - Hauz Khas PS',
    role: 'POLICE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
  },
  {
    id: 'off-03',
    name: 'DCP Rajeshwar Mehra',
    badgeNumber: 'DL-HQ-0001',
    rank: 'Deputy Commissioner of Police (HQ)',
    stationId: 'all',
    stationName: 'Metropolis Emergency Operations Center',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
  },
];

// Police Stations with Delhi Jurisdictions
export const POLICE_STATIONS: PoliceStation[] = [
  {
    id: 'st-cp-01',
    name: 'Central Division - Connaught Place PS',
    code: 'DL-C01',
    phone: '+91-11-2334-0120',
    address: 'Near Radial Road 4, Connaught Place, New Delhi',
    location: { lat: 28.6328, lng: 77.2197 },
    jurisdictionColor: '#3b82f6', // Blue
    jurisdictionPolygon: [
      [28.6440, 77.2080],
      [28.6435, 77.2340],
      [28.6230, 77.2355],
      [28.6210, 77.2100],
      [28.6440, 77.2080],
    ],
  },
  {
    id: 'st-hk-02',
    name: 'South Division - Hauz Khas PS',
    code: 'DL-S02',
    phone: '+91-11-2651-4022',
    address: 'Aurobindo Marg, Near IIT Flyover, New Delhi',
    location: { lat: 28.5494, lng: 77.2001 },
    jurisdictionColor: '#ec4899', // Pink
    jurisdictionPolygon: [
      [28.5700, 77.1850],
      [28.5680, 77.2200],
      [28.5300, 77.2150],
      [28.5320, 77.1800],
      [28.5700, 77.1850],
    ],
  },
  {
    id: 'st-dw-03',
    name: 'West Division - Dwarka Sector 9 PS',
    code: 'DL-W03',
    phone: '+91-11-2508-3310',
    address: 'Sector 9, Dwarka Sub-City, New Delhi',
    location: { lat: 28.5823, lng: 77.0597 },
    jurisdictionColor: '#8b5cf6', // Violet
    jurisdictionPolygon: [
      [28.6050, 77.0350],
      [28.6040, 77.0850],
      [28.5600, 77.0800],
      [28.5620, 77.0300],
      [28.6050, 77.0350],
    ],
  },
  {
    id: 'st-igi-04',
    name: 'Airport Zone - IGI Terminal 3 PS',
    code: 'DL-A04',
    phone: '+91-11-2565-2121',
    address: 'Indira Gandhi International Airport, New Delhi',
    location: { lat: 28.5562, lng: 77.1000 },
    jurisdictionColor: '#10b981', // Emerald
    jurisdictionPolygon: [
      [28.5750, 77.0850],
      [28.5720, 77.1250],
      [28.5350, 77.1200],
      [28.5380, 77.0800],
      [28.5750, 77.0850],
    ],
  },
  {
    id: 'st-cl-05',
    name: 'North Division - Civil Lines PS',
    code: 'DL-N05',
    phone: '+91-11-2395-5024',
    address: 'Rajpur Road, Civil Lines, North Delhi',
    location: { lat: 28.6811, lng: 77.2228 },
    jurisdictionColor: '#f59e0b', // Amber
    jurisdictionPolygon: [
      [28.7050, 77.2050],
      [28.7020, 77.2400],
      [28.6600, 77.2420],
      [28.6620, 77.2020],
      [28.7050, 77.2050],
    ],
  },
];

// Helper to generate seed initial trips
function createInitialTrips(): Trip[] {
  const now = new Date();
  const subMinutes = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
  const addMinutes = (m: number) => new Date(now.getTime() + m * 60000).toISOString();

  // 1. Priya Sharma: Critical SOS
  const trip1: Trip = {
    id: 'trip-cp-01',
    traveller_id: 'user-01',
    traveller_name: 'Priya Sharma',
    traveller_phone: '+91 98711 23450',
    status: 'ALERT_RAISED',
    started_at: subMinutes(18),
    expected_duration_s: 1800, // 30 min
    ends_at: addMinutes(12),
    destination_name: 'Lajpat Nagar Ring Road',
    destination: { lat: 28.5677, lng: 77.2433 },
    vehicle_number: 'DL 01 TA 4421',
    vehicle_entered_at: subMinutes(14),
    vehicle_deadline_at: subMinutes(11),
    next_checkin_due_at: subMinutes(2),
    checkin_deadline_at: subMinutes(1),
    last_heartbeat_at: subMinutes(0.2), // 12 seconds ago
    last_location: { lat: 28.6315, lng: 77.2185 },
    last_accuracy_m: 6.5,
    last_battery_pct: 38,
    current_station_id: 'st-cp-01',
    current_station_name: 'Central Division - Connaught Place PS',
    share_token: 'tok-priya-sharma-safe-journey-9982',
    contacts: [
      {
        id: 'c-01',
        name: 'Sunita Sharma',
        phone: '+91 98102 34567',
        relation: 'Mother',
        notify_whatsapp: true,
        smsStatus: 'LINK_OPENED',
      },
      {
        id: 'c-02',
        name: 'Rahul Sharma',
        phone: '+91 98111 88990',
        relation: 'Brother',
        notify_whatsapp: true,
        smsStatus: 'DELIVERED',
      },
    ],
    location_history: [
      {
        id: 'lp-101',
        lat: 28.6360,
        lng: 77.2160,
        accuracy_m: 12.0,
        speed_kmh: 22,
        heading: 140,
        battery_pct: 42,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(15),
      },
      {
        id: 'lp-102',
        lat: 28.6348,
        lng: 77.2170,
        accuracy_m: 9.5,
        speed_kmh: 28,
        heading: 145,
        battery_pct: 41,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(10),
      },
      {
        id: 'lp-103',
        lat: 28.6330,
        lng: 77.2180,
        accuracy_m: 7.0,
        speed_kmh: 15,
        heading: 150,
        battery_pct: 40,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(5),
      },
      {
        id: 'lp-104',
        lat: 28.6315,
        lng: 77.2185,
        accuracy_m: 6.5,
        speed_kmh: 0,
        heading: 160,
        battery_pct: 38,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(0.2),
      },
    ],
    checkins: [
      {
        id: 'chk-101',
        sequence: 1,
        asked_at: subMinutes(12),
        deadline_at: subMinutes(11),
        responded_at: subMinutes(11.6),
        response: 'SAFE',
        outcome: 'OK',
      },
      {
        id: 'chk-102',
        sequence: 2,
        asked_at: subMinutes(6),
        deadline_at: subMinutes(5),
        responded_at: subMinutes(5.4),
        response: 'SAFE',
        outcome: 'OK',
      },
    ],
    alerts: [
      {
        id: 'alt-01',
        trip_id: 'trip-cp-01',
        type: 'SOS',
        severity: 'CRITICAL',
        status: 'OPEN',
        raised_at: subMinutes(2),
        location: { lat: 28.6315, lng: 77.2185 },
        station_id: 'st-cp-01',
        station_name: 'Central Division - Connaught Place PS',
        snapshot: {
          traveller_name: 'Priya Sharma',
          traveller_phone: '+91 98711 23450',
          vehicle_number: 'DL 01 TA 4421',
          battery_pct: 38,
          accuracy_m: 6.5,
          speed_kmh: 0,
        },
      },
    ],
  };

  // 2. Ananya Verma: High Missed Check-in
  const trip2: Trip = {
    id: 'trip-hk-02',
    traveller_id: 'user-02',
    traveller_name: 'Ananya Verma',
    traveller_phone: '+91 99100 45892',
    status: 'ALERT_RAISED',
    started_at: subMinutes(16),
    expected_duration_s: 2400, // 40 min
    ends_at: addMinutes(24),
    destination_name: 'Select Citywalk Saket',
    destination: { lat: 28.5284, lng: 77.2192 },
    vehicle_number: 'DL 03 C 9812',
    vehicle_entered_at: subMinutes(12),
    vehicle_deadline_at: subMinutes(9),
    next_checkin_due_at: subMinutes(3),
    checkin_deadline_at: subMinutes(2),
    last_heartbeat_at: subMinutes(0.4), // 24s ago
    last_location: { lat: 28.5532, lng: 77.2045 },
    last_accuracy_m: 11.2,
    last_battery_pct: 68,
    current_station_id: 'st-hk-02',
    current_station_name: 'South Division - Hauz Khas PS',
    share_token: 'tok-ananya-verma-safe-journey-5521',
    contacts: [
      {
        id: 'c-03',
        name: 'Rohan Verma',
        phone: '+91 99100 11223',
        relation: 'Spouse',
        notify_whatsapp: true,
        smsStatus: 'DELIVERED',
      },
    ],
    location_history: [
      {
        id: 'lp-201',
        lat: 28.5620,
        lng: 77.1980,
        accuracy_m: 15.0,
        speed_kmh: 34,
        heading: 160,
        battery_pct: 72,
        is_charging: false,
        network: '4G',
        recorded_at: subMinutes(14),
      },
      {
        id: 'lp-202',
        lat: 28.5580,
        lng: 77.2010,
        accuracy_m: 12.0,
        speed_kmh: 30,
        heading: 155,
        battery_pct: 70,
        is_charging: false,
        network: '4G',
        recorded_at: subMinutes(8),
      },
      {
        id: 'lp-203',
        lat: 28.5532,
        lng: 77.2045,
        accuracy_m: 11.2,
        speed_kmh: 18,
        heading: 150,
        battery_pct: 68,
        is_charging: false,
        network: '4G',
        recorded_at: subMinutes(0.4),
      },
    ],
    checkins: [
      {
        id: 'chk-201',
        sequence: 1,
        asked_at: subMinutes(10),
        deadline_at: subMinutes(9),
        responded_at: subMinutes(9.3),
        response: 'SAFE',
        outcome: 'OK',
      },
      {
        id: 'chk-202',
        sequence: 2,
        asked_at: subMinutes(4),
        deadline_at: subMinutes(3),
        responded_at: undefined,
        outcome: 'ALERTED_MISSED',
      },
    ],
    alerts: [
      {
        id: 'alt-02',
        trip_id: 'trip-hk-02',
        type: 'MISSED_CHECKIN',
        severity: 'HIGH',
        status: 'OPEN',
        raised_at: subMinutes(3),
        location: { lat: 28.5532, lng: 77.2045 },
        station_id: 'st-hk-02',
        station_name: 'South Division - Hauz Khas PS',
        snapshot: {
          traveller_name: 'Ananya Verma',
          traveller_phone: '+91 99100 45892',
          vehicle_number: 'DL 03 C 9812',
          battery_pct: 68,
          accuracy_m: 11.2,
          speed_kmh: 18,
        },
      },
    ],
  };

  // 3. Sneha Patel: Phone Unreachable (Dead Battery / Switched Off)
  const trip3: Trip = {
    id: 'trip-dw-03',
    traveller_id: 'user-03',
    traveller_name: 'Sneha Patel',
    traveller_phone: '+91 97200 33419',
    status: 'ALERT_RAISED',
    started_at: subMinutes(28),
    expected_duration_s: 2100, // 35 min
    ends_at: addMinutes(7),
    destination_name: 'Janakpuri West Metro',
    destination: { lat: 28.6295, lng: 77.0778 },
    vehicle_number: 'DL 06 BK 2291',
    vehicle_entered_at: subMinutes(24),
    vehicle_deadline_at: subMinutes(21),
    next_checkin_due_at: subMinutes(10),
    checkin_deadline_at: subMinutes(9),
    last_heartbeat_at: subMinutes(4.2), // Silent for 4m 12s (> HEARTBEAT_TIMEOUT_S)
    last_location: { lat: 28.5870, lng: 77.0620 },
    last_accuracy_m: 18.0,
    last_battery_pct: 4, // Phone died
    current_station_id: 'st-dw-03',
    current_station_name: 'West Division - Dwarka Sector 9 PS',
    share_token: 'tok-sneha-patel-safe-journey-1102',
    contacts: [
      {
        id: 'c-04',
        name: 'Meena Patel',
        phone: '+91 97200 99881',
        relation: 'Sister',
        notify_whatsapp: true,
        smsStatus: 'LINK_OPENED',
      },
    ],
    location_history: [
      {
        id: 'lp-301',
        lat: 28.5720,
        lng: 77.0500,
        accuracy_m: 22.0,
        speed_kmh: 42,
        heading: 30,
        battery_pct: 8,
        is_charging: false,
        network: '4G',
        recorded_at: subMinutes(18),
      },
      {
        id: 'lp-302',
        lat: 28.5810,
        lng: 77.0580,
        accuracy_m: 20.0,
        speed_kmh: 38,
        heading: 35,
        battery_pct: 5,
        is_charging: false,
        network: '4G',
        recorded_at: subMinutes(10),
      },
      {
        id: 'lp-303',
        lat: 28.5870,
        lng: 77.0620,
        accuracy_m: 18.0,
        speed_kmh: 0,
        heading: 35,
        battery_pct: 4,
        is_charging: false,
        network: '4G',
        recorded_at: subMinutes(4.2),
      },
    ],
    checkins: [
      {
        id: 'chk-301',
        sequence: 1,
        asked_at: subMinutes(20),
        deadline_at: subMinutes(19),
        responded_at: subMinutes(19.2),
        response: 'SAFE',
        outcome: 'OK',
      },
    ],
    alerts: [
      {
        id: 'alt-03',
        trip_id: 'trip-dw-03',
        type: 'PHONE_UNREACHABLE',
        severity: 'HIGH',
        status: 'OPEN',
        raised_at: subMinutes(2.5),
        location: { lat: 28.5870, lng: 77.0620 },
        station_id: 'st-dw-03',
        station_name: 'West Division - Dwarka Sector 9 PS',
        snapshot: {
          traveller_name: 'Sneha Patel',
          traveller_phone: '+91 97200 33419',
          vehicle_number: 'DL 06 BK 2291',
          battery_pct: 4,
          accuracy_m: 18.0,
          speed_kmh: 0,
        },
      },
    ],
  };

  // 4. Ritu Mukherjee: Safe Active Journey
  const trip4: Trip = {
    id: 'trip-cp-04',
    traveller_id: 'user-04',
    traveller_name: 'Ritu Mukherjee',
    traveller_phone: '+91 98990 87612',
    status: 'ACTIVE',
    started_at: subMinutes(8),
    expected_duration_s: 1800,
    ends_at: addMinutes(22),
    destination_name: 'Barakhamba Metro Gate 3',
    destination: { lat: 28.6300, lng: 77.2280 },
    vehicle_number: 'DL 04 E 5510',
    vehicle_entered_at: subMinutes(6),
    vehicle_deadline_at: subMinutes(1),
    next_checkin_due_at: addMinutes(2.5),
    checkin_deadline_at: addMinutes(3.5),
    last_heartbeat_at: subMinutes(0.15), // 9s ago
    last_location: { lat: 28.6385, lng: 77.2240 },
    last_accuracy_m: 5.0,
    last_battery_pct: 88,
    current_station_id: 'st-cp-01',
    current_station_name: 'Central Division - Connaught Place PS',
    share_token: 'tok-ritu-mukherjee-safe-journey-7719',
    contacts: [
      {
        id: 'c-05',
        name: 'Arjun Mukherjee',
        phone: '+91 98990 12345',
        relation: 'Father',
        notify_whatsapp: true,
        smsStatus: 'DELIVERED',
      },
    ],
    location_history: [
      {
        id: 'lp-401',
        lat: 28.6420,
        lng: 77.2210,
        accuracy_m: 8.0,
        speed_kmh: 32,
        heading: 130,
        battery_pct: 90,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(7),
      },
      {
        id: 'lp-402',
        lat: 28.6385,
        lng: 77.2240,
        accuracy_m: 5.0,
        speed_kmh: 26,
        heading: 135,
        battery_pct: 88,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(0.15),
      },
    ],
    checkins: [
      {
        id: 'chk-401',
        sequence: 1,
        asked_at: subMinutes(3),
        deadline_at: subMinutes(2),
        responded_at: subMinutes(2.4),
        response: 'SAFE',
        outcome: 'OK',
      },
    ],
    alerts: [],
  };

  // 5. Kavita Rao: Awaiting Vehicle Entry
  const trip5: Trip = {
    id: 'trip-hk-05',
    traveller_id: 'user-05',
    traveller_name: 'Kavita Rao',
    traveller_phone: '+91 98118 76543',
    status: 'AWAITING_VEHICLE',
    started_at: subMinutes(3),
    expected_duration_s: 1500,
    ends_at: addMinutes(22),
    destination_name: 'Malviya Nagar Market',
    destination: { lat: 28.5355, lng: 77.2100 },
    vehicle_number: undefined,
    vehicle_deadline_at: addMinutes(4), // 4 mins left to enter plate
    next_checkin_due_at: addMinutes(6),
    checkin_deadline_at: addMinutes(7),
    last_heartbeat_at: subMinutes(0.2),
    last_location: { lat: 28.5580, lng: 77.1995 },
    last_accuracy_m: 9.0,
    last_battery_pct: 79,
    current_station_id: 'st-hk-02',
    current_station_name: 'South Division - Hauz Khas PS',
    share_token: 'tok-kavita-rao-safe-journey-3304',
    contacts: [
      {
        id: 'c-06',
        name: 'Deepa Rao',
        phone: '+91 98118 11111',
        relation: 'Friend',
        notify_whatsapp: true,
        smsStatus: 'DELIVERED',
      },
    ],
    location_history: [
      {
        id: 'lp-501',
        lat: 28.5580,
        lng: 77.1995,
        accuracy_m: 9.0,
        speed_kmh: 0,
        heading: 0,
        battery_pct: 79,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(0.2),
      },
    ],
    checkins: [],
    alerts: [],
  };

  // 6. Meera Iyer: Resolved Trip
  const trip6: Trip = {
    id: 'trip-cp-06',
    traveller_id: 'user-06',
    traveller_name: 'Meera Iyer',
    traveller_phone: '+91 99991 22334',
    status: 'COMPLETED',
    started_at: subMinutes(45),
    expected_duration_s: 1800,
    ends_at: subMinutes(15),
    destination_name: 'Patel Nagar West',
    destination: { lat: 28.6530, lng: 77.1650 },
    vehicle_number: 'DL 08 BK 7720',
    vehicle_entered_at: subMinutes(42),
    vehicle_deadline_at: subMinutes(38),
    last_heartbeat_at: subMinutes(14),
    last_location: { lat: 28.6532, lng: 77.1652 },
    last_accuracy_m: 4.5,
    last_battery_pct: 61,
    current_station_id: 'st-cp-01',
    current_station_name: 'Central Division - Connaught Place PS',
    share_token: 'tok-meera-iyer-safe-journey-8812',
    contacts: [
      {
        id: 'c-07',
        name: 'Venu Iyer',
        phone: '+91 99991 55667',
        relation: 'Brother',
        notify_whatsapp: true,
        smsStatus: 'LINK_OPENED',
      },
    ],
    location_history: [
      {
        id: 'lp-601',
        lat: 28.6532,
        lng: 77.1652,
        accuracy_m: 4.5,
        speed_kmh: 0,
        heading: 270,
        battery_pct: 61,
        is_charging: false,
        network: '5G',
        recorded_at: subMinutes(14),
      },
    ],
    checkins: [],
    alerts: [
      {
        id: 'alt-06',
        trip_id: 'trip-cp-06',
        type: 'USER_REPORTED_UNSAFE',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        raised_at: subMinutes(25),
        location: { lat: 28.6500, lng: 77.1700 },
        station_id: 'st-cp-01',
        station_name: 'Central Division - Connaught Place PS',
        acknowledged_by: 'DL-POL-4412 (Insp. Vikramaditya)',
        acknowledged_at: subMinutes(24),
        resolved_at: subMinutes(15),
        resolution_notes: 'Patrol Car DL-PCR-09 intercepted vehicle near Patel Nagar round-about. Driver confirmed safe drop; traveller verified safe with cancel PIN.',
        resolution_outcome: 'RESOLVED_SAFE',
        snapshot: {
          traveller_name: 'Meera Iyer',
          traveller_phone: '+91 99991 22334',
          vehicle_number: 'DL 08 BK 7720',
          battery_pct: 65,
          accuracy_m: 6.0,
          speed_kmh: 0,
        },
      },
    ],
  };

  return [trip1, trip2, trip3, trip4, trip5, trip6];
}

// Global state container with singleton pattern
class PoliceStore {
  private trips: Map<string, Trip> = new Map();
  private stations: PoliceStation[] = POLICE_STATIONS;
  private officers: PoliceOfficer[] = DEMO_OFFICERS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.seed();
  }

  public seed() {
    this.trips.clear();
    const initial = createInitialTrips();
    for (const t of initial) {
      this.trips.set(t.id, t);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch (err) {
        console.error('Error in store listener', err);
      }
    }
  }

  public getStations(): PoliceStation[] {
    return this.stations;
  }

  public getStationById(id: string): PoliceStation | undefined {
    return this.stations.find((s) => s.id === id);
  }

  public getOfficers(): PoliceOfficer[] {
    return this.officers;
  }

  public getOfficerById(id: string): PoliceOfficer | undefined {
    return this.officers.find((o) => o.id === id);
  }

  public getTrips(stationId?: string, statusFilter?: string): Trip[] {
    let list = Array.from(this.trips.values());
    if (stationId && stationId !== 'all') {
      list = list.filter((t) => t.current_station_id === stationId);
    }
    if (statusFilter && statusFilter !== 'ALL') {
      if (statusFilter === 'ALERT') {
        list = list.filter((t) => t.status === 'ALERT_RAISED');
      } else if (statusFilter === 'ACTIVE') {
        list = list.filter((t) => t.status === 'ACTIVE' || t.status === 'CHECKIN_PENDING' || t.status === 'AWAITING_VEHICLE');
      } else {
        list = list.filter((t) => t.status === statusFilter);
      }
    }
    return list;
  }

  public getTripById(id: string): Trip | undefined {
    return this.trips.get(id);
  }

  public getAlerts(stationId?: string, statusFilter?: string, severityFilter?: string): Alert[] {
    const alerts: Alert[] = [];
    for (const trip of this.trips.values()) {
      for (const alt of trip.alerts) {
        if (stationId && stationId !== 'all' && alt.station_id !== stationId) {
          continue;
        }
        if (statusFilter && statusFilter !== 'ALL' && alt.status !== statusFilter) {
          continue;
        }
        if (severityFilter && severityFilter !== 'ALL' && alt.severity !== severityFilter) {
          continue;
        }
        alerts.push(alt);
      }
    }

    // Sort: CRITICAL first, then HIGH, then MEDIUM, then by raised_at desc
    const severityScore = (s: AlertSeverity) => (s === 'CRITICAL' ? 3 : s === 'HIGH' ? 2 : 1);
    alerts.sort((a, b) => {
      const diff = severityScore(b.severity) - severityScore(a.severity);
      if (diff !== 0) return diff;
      return new Date(b.raised_at).getTime() - new Date(a.raised_at).getTime();
    });

    return alerts;
  }

  public getStats(stationId?: string): PoliceDashboardStats {
    const allTrips = Array.from(this.trips.values()).filter(
      (t) => !stationId || stationId === 'all' || t.current_station_id === stationId
    );
    const activeTrips = allTrips.filter(
      (t) => t.status === 'ACTIVE' || t.status === 'ALERT_RAISED' || t.status === 'CHECKIN_PENDING' || t.status === 'AWAITING_VEHICLE'
    );

    const alerts = this.getAlerts(stationId);
    const openAlerts = alerts.filter((a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED');
    const criticalAlerts = openAlerts.filter((a) => a.severity === 'CRITICAL');
    const highAlerts = openAlerts.filter((a) => a.severity === 'HIGH');
    const mediumAlerts = openAlerts.filter((a) => a.severity === 'MEDIUM');
    const acknowledgedToday = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
    const resolvedToday = alerts.filter((a) => a.status === 'RESOLVED' || a.status === 'FALSE_ALARM').length;

    return {
      activeTripsCount: activeTrips.length,
      openAlertsCount: openAlerts.length,
      criticalAlertsCount: criticalAlerts.length,
      highAlertsCount: highAlerts.length,
      mediumAlertsCount: mediumAlerts.length,
      acknowledgedTodayCount: acknowledgedToday,
      resolvedTodayCount: resolvedToday,
      avgAckTimeSeconds: 74, // ~1.2 min
      activeStationsCount: this.stations.length,
    };
  }

  public acknowledgeAlert(alertId: string, officerName: string): boolean {
    for (const trip of this.trips.values()) {
      const alert = trip.alerts.find((a) => a.id === alertId);
      if (alert) {
        alert.status = 'ACKNOWLEDGED';
        alert.acknowledged_by = officerName;
        alert.acknowledged_at = new Date().toISOString();
        this.notify();
        return true;
      }
    }
    return false;
  }

  public resolveAlert(
    alertId: string,
    officerName: string,
    notes: string,
    outcome: string
  ): boolean {
    for (const trip of this.trips.values()) {
      const alert = trip.alerts.find((a) => a.id === alertId);
      if (alert) {
        alert.status = outcome === 'FALSE_ALARM' ? 'FALSE_ALARM' : 'RESOLVED';
        alert.resolved_at = new Date().toISOString();
        alert.resolution_notes = notes;
        alert.resolution_outcome = outcome;
        if (!alert.acknowledged_by) {
          alert.acknowledged_by = officerName;
          alert.acknowledged_at = new Date().toISOString();
        }

        // Also resolve any remaining open alerts on this trip so the incident resolves cleanly
        for (const otherA of trip.alerts) {
          if (otherA.status === 'OPEN' || otherA.status === 'ACKNOWLEDGED') {
            otherA.status = alert.status;
            otherA.resolved_at = alert.resolved_at;
            otherA.resolution_notes = notes;
            otherA.resolution_outcome = outcome;
            otherA.acknowledged_by = officerName;
          }
        }
        if (trip.status === 'ALERT_RAISED') {
          trip.status = 'ACTIVE';
        }

        this.notify();
        return true;
      }
    }
    return false;
  }

  public disarmTrip(tripId: string, actor: string = 'traveller'): Trip | null {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    const now = new Date().toISOString();
    for (const alt of trip.alerts) {
      if (alt.status === 'OPEN' || alt.status === 'ACKNOWLEDGED') {
        alt.status = 'RESOLVED';
        alt.resolved_at = now;
        alt.acknowledged_by = trip.traveller_name;
        alt.resolution_notes = 'Disarmed by traveller with verified Safety PIN';
        alt.resolution_outcome = 'DISARMED_SAFE';
      }
    }
    trip.status = 'ACTIVE';
    trip.last_heartbeat_at = now;
    this.notify();
    return trip;
  }

  public dispatchEmergencyUnit(
    tripId: string,
    unitCallsign: string,
    officerInCharge: string,
    etaMinutes: number,
    notes: string
  ): boolean {
    const trip = this.trips.get(tripId);
    if (!trip) return false;

    trip.dispatchInfo = {
      dispatched_at: new Date().toISOString(),
      unit_callsign: unitCallsign,
      officer_in_charge: officerInCharge,
      eta_minutes: etaMinutes,
      notes: notes,
    };

    // Auto acknowledge open alerts
    for (const a of trip.alerts) {
      if (a.status === 'OPEN') {
        a.status = 'ACKNOWLEDGED';
        a.acknowledged_by = `DISPATCH (${unitCallsign})`;
        a.acknowledged_at = new Date().toISOString();
      }
    }

    this.notify();
    return true;
  }

  // Demo Scenarios from Section 18
  public simulateSOS(targetTripId?: string): Alert | null {
    const trip = targetTripId ? this.trips.get(targetTripId) : Array.from(this.trips.values()).find((t) => t.status === 'ACTIVE');
    if (!trip) return null;

    trip.status = 'ALERT_RAISED';
    const newAlert: Alert = {
      id: `alt-sos-${Date.now()}`,
      trip_id: trip.id,
      type: 'SOS',
      severity: 'CRITICAL',
      status: 'OPEN',
      raised_at: new Date().toISOString(),
      location: { ...trip.last_location },
      station_id: trip.current_station_id,
      station_name: trip.current_station_name,
      snapshot: {
        traveller_name: trip.traveller_name,
        traveller_phone: trip.traveller_phone,
        vehicle_number: trip.vehicle_number || 'UNKNOWN',
        battery_pct: trip.last_battery_pct,
        accuracy_m: trip.last_accuracy_m,
        speed_kmh: 0,
      },
    };

    trip.alerts.unshift(newAlert);
    this.notify();
    return newAlert;
  }

  public simulateMissedCheckin(targetTripId?: string): Alert | null {
    const trip = targetTripId ? this.trips.get(targetTripId) : Array.from(this.trips.values()).find((t) => t.status === 'ACTIVE');
    if (!trip) return null;

    trip.status = 'ALERT_RAISED';
    const newCheckin: Checkin = {
      id: `chk-missed-${Date.now()}`,
      sequence: trip.checkins.length + 1,
      asked_at: new Date(Date.now() - 65000).toISOString(),
      deadline_at: new Date(Date.now() - 5000).toISOString(),
      outcome: 'ALERTED_MISSED',
    };
    trip.checkins.unshift(newCheckin);

    const newAlert: Alert = {
      id: `alt-missed-${Date.now()}`,
      trip_id: trip.id,
      type: 'MISSED_CHECKIN',
      severity: 'HIGH',
      status: 'OPEN',
      raised_at: new Date().toISOString(),
      location: { ...trip.last_location },
      station_id: trip.current_station_id,
      station_name: trip.current_station_name,
      snapshot: {
        traveller_name: trip.traveller_name,
        traveller_phone: trip.traveller_phone,
        vehicle_number: trip.vehicle_number || 'UNKNOWN',
        battery_pct: trip.last_battery_pct,
        accuracy_m: trip.last_accuracy_m,
        speed_kmh: 24,
      },
    };

    trip.alerts.unshift(newAlert);
    this.notify();
    return newAlert;
  }

  public simulateKillHeartbeat(tripId: string): Alert | null {
    const trip = this.trips.get(tripId);
    if (!trip) return null;

    // Simulate phone death / switched off
    trip.status = 'ALERT_RAISED';
    trip.last_heartbeat_at = new Date(Date.now() - 150000).toISOString(); // 2.5 minutes ago
    trip.last_battery_pct = 2; // drained

    const newAlert: Alert = {
      id: `alt-dead-${Date.now()}`,
      trip_id: trip.id,
      type: 'PHONE_UNREACHABLE',
      severity: 'HIGH',
      status: 'OPEN',
      raised_at: new Date().toISOString(),
      location: { ...trip.last_location },
      station_id: trip.current_station_id,
      station_name: trip.current_station_name,
      snapshot: {
        traveller_name: trip.traveller_name,
        traveller_phone: trip.traveller_phone,
        vehicle_number: trip.vehicle_number || 'UNKNOWN',
        battery_pct: 2,
        accuracy_m: trip.last_accuracy_m,
        speed_kmh: 0,
      },
    };

    trip.alerts.unshift(newAlert);
    this.notify();
    return newAlert;
  }

  public simulateSafeCheckin(tripId: string): boolean {
    const trip = this.trips.get(tripId);
    if (!trip) return false;

    const newCheckin: Checkin = {
      id: `chk-safe-${Date.now()}`,
      sequence: trip.checkins.length + 1,
      asked_at: new Date(Date.now() - 30000).toISOString(),
      deadline_at: new Date(Date.now() + 30000).toISOString(),
      responded_at: new Date().toISOString(),
      response: 'SAFE',
      outcome: 'OK',
    };
    trip.checkins.unshift(newCheckin);
    trip.next_checkin_due_at = new Date(Date.now() + 300000).toISOString(); // +5 min
    trip.checkin_deadline_at = new Date(Date.now() + 360000).toISOString();

    if (trip.status === 'CHECKIN_PENDING') {
      trip.status = 'ACTIVE';
    }

    this.notify();
    return true;
  }

  public simulateAdvanceLocation(tripId: string): boolean {
    const trip = this.trips.get(tripId);
    if (!trip) return false;

    // Never auto-advance or finish a trip if it's completed, cancelled, or in silent mode
    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') return false;
    const isUnreachable = trip.alerts.some(
      (a) => a.type === 'PHONE_UNREACHABLE' && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED')
    );
    if (isUnreachable) return false;

    // Advance position towards destination or smoothly along route
    let newLat: number;
    let newLng: number;
    if (trip.destination) {
      const remainingLat = trip.destination.lat - trip.last_location.lat;
      const remainingLng = trip.destination.lng - trip.last_location.lng;
      const dist = Math.hypot(remainingLat, remainingLng);

      // Only auto-complete if actively in ACTIVE journey mode and very close (dist < 0.0004)
      if (dist < 0.0004 && trip.status === 'ACTIVE') {
        return this.setTripScenario(tripId, 'done');
      }

      // Gentle progressive advance (~3% towards destination per tick)
      const step = Math.min(0.04, Math.max(0.01, 0.0003 / Math.max(dist, 0.0001)));
      newLat = trip.last_location.lat + remainingLat * step + (Math.random() - 0.5) * 0.0001;
      newLng = trip.last_location.lng + remainingLng * step + (Math.random() - 0.5) * 0.0001;
    } else {
      const deltaLat = (Math.random() - 0.5) * 0.0005;
      const deltaLng = (Math.random() - 0.5) * 0.0005;
      newLat = trip.last_location.lat + deltaLat;
      newLng = trip.last_location.lng + deltaLng;
    }

    const nowIso = new Date().toISOString();

    trip.last_location = { lat: newLat, lng: newLng };
    trip.last_heartbeat_at = nowIso;
    trip.last_battery_pct = Math.max(1, trip.last_battery_pct - 1);

    const newPoint: LocationPoint = {
      id: `lp-step-${Date.now()}`,
      lat: newLat,
      lng: newLng,
      accuracy_m: 5.5 + Math.random() * 3,
      speed_kmh: 22 + Math.floor(Math.random() * 20),
      heading: Math.floor(Math.random() * 360),
      battery_pct: trip.last_battery_pct,
      is_charging: false,
      network: '5G',
      recorded_at: nowIso,
    };

    trip.location_history.push(newPoint);
    this.notify();
    return true;
  }

  public simulateCompleteTrip(tripId: string): boolean {
    return this.setTripScenario(tripId, 'done');
  }

  public setTripScenario(tripId: string, mode: 'live' | 'alert' | 'silent' | 'done'): boolean {
    const trip = this.trips.get(tripId);
    if (!trip) return false;

    const nowIso = new Date().toISOString();

    if (mode === 'live') {
      trip.status = 'ACTIVE';
      trip.last_heartbeat_at = nowIso;
      trip.last_battery_pct = Math.max(trip.last_battery_pct, 76);
      trip.completed_at = undefined;

      // Resolve all open/acknowledged alerts
      for (const a of trip.alerts) {
        if (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED') {
          a.status = 'RESOLVED';
          a.resolved_at = nowIso;
          a.resolution_notes = 'Normal journey resumed.';
          a.resolution_outcome = 'RESOLVED_SAFE';
        }
      }

      // If position was at destination, reset to beginning or mid-route so it doesn't instantly re-complete
      if (trip.destination && Math.hypot(trip.last_location.lat - trip.destination.lat, trip.last_location.lng - trip.destination.lng) < 0.001) {
        if (trip.location_history.length > 0) {
          trip.last_location = { lat: trip.location_history[0].lat, lng: trip.location_history[0].lng };
          // Keep only first 2-3 points so trail resets cleanly
          trip.location_history = trip.location_history.slice(0, 3);
        }
      }
    } else if (mode === 'alert') {
      trip.status = 'ALERT_RAISED';
      trip.last_heartbeat_at = nowIso;
      trip.last_battery_pct = Math.max(trip.last_battery_pct, 52);
      trip.completed_at = undefined;

      // Resolve any PHONE_UNREACHABLE alerts
      for (const a of trip.alerts) {
        if (a.type === 'PHONE_UNREACHABLE' && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED')) {
          a.status = 'RESOLVED';
          a.resolved_at = nowIso;
        }
      }

      // Ensure an active SOS or Emergency alert is at the top
      const hasActiveEmergency = trip.alerts.some(
        (a) => (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED') && a.type !== 'PHONE_UNREACHABLE'
      );
      if (!hasActiveEmergency) {
        const alt: Alert = {
          id: `alt-sos-${Date.now()}`,
          trip_id: trip.id,
          type: 'SOS',
          severity: 'CRITICAL',
          status: 'OPEN',
          raised_at: nowIso,
          location: { ...trip.last_location },
          station_id: trip.current_station_id,
          station_name: trip.current_station_name,
          snapshot: {
            traveller_name: trip.traveller_name,
            traveller_phone: trip.traveller_phone,
            vehicle_number: trip.vehicle_number || 'DL 01 TA 4421',
            battery_pct: trip.last_battery_pct,
            accuracy_m: trip.last_accuracy_m || 8.0,
            speed_kmh: 0,
          },
        };
        trip.alerts.unshift(alt);
      }
    } else if (mode === 'silent') {
      trip.status = 'ALERT_RAISED';
      // Heartbeat frozen >90s ago
      trip.last_heartbeat_at = new Date(Date.now() - 110000).toISOString();
      trip.last_battery_pct = 4;
      trip.completed_at = undefined;

      // Resolve non-unreachable open alerts
      for (const a of trip.alerts) {
        if (a.type !== 'PHONE_UNREACHABLE' && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED')) {
          a.status = 'RESOLVED';
          a.resolved_at = nowIso;
        }
      }

      // Add or reopen PHONE_UNREACHABLE alert
      const existingSilent = trip.alerts.find((a) => a.type === 'PHONE_UNREACHABLE');
      if (existingSilent) {
        existingSilent.status = 'OPEN';
        existingSilent.raised_at = new Date(Date.now() - 30000).toISOString();
      } else {
        const alt: Alert = {
          id: `alt-silent-${Date.now()}`,
          trip_id: trip.id,
          type: 'PHONE_UNREACHABLE',
          severity: 'HIGH',
          status: 'OPEN',
          raised_at: new Date(Date.now() - 30000).toISOString(),
          location: { ...trip.last_location },
          station_id: trip.current_station_id,
          station_name: trip.current_station_name,
          snapshot: {
            traveller_name: trip.traveller_name,
            traveller_phone: trip.traveller_phone,
            vehicle_number: trip.vehicle_number || 'DL 01 TA 4421',
            battery_pct: 4,
            accuracy_m: 18.0,
            speed_kmh: 0,
          },
        };
        trip.alerts.unshift(alt);
      }
    } else if (mode === 'done') {
      if (trip.destination) {
        trip.last_location = { lat: trip.destination.lat, lng: trip.destination.lng };
        trip.location_history.push({
          id: `lp-dest-${Date.now()}`,
          lat: trip.destination.lat,
          lng: trip.destination.lng,
          accuracy_m: 5,
          speed_kmh: 0,
          heading: 0,
          battery_pct: trip.last_battery_pct,
          is_charging: false,
          network: '5G',
          recorded_at: nowIso,
        });
      }
      trip.status = 'COMPLETED';
      trip.completed_at = nowIso;
      for (const a of trip.alerts) {
        if (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED') {
          a.status = 'RESOLVED';
          a.resolved_at = nowIso;
          a.resolution_notes = 'Trip concluded with safe arrival confirmation.';
          a.resolution_outcome = 'RESOLVED_SAFE';
        }
      }
    }

    this.notify();
    return true;
  }

  public getTripByToken(token: string): Trip | undefined {
    for (const trip of this.trips.values()) {
      if (trip.share_token === token || trip.id === token) {
        return trip;
      }
    }
    return undefined;
  }

  public modifyTripDuration(
    tokenOrId: string,
    additionalMinutes: number
  ): { success: boolean; trip?: Trip } {
    const trip = this.getTripByToken(tokenOrId) || this.getTripById(tokenOrId);
    if (!trip) return { success: false };

    const addSeconds = additionalMinutes * 60;
    trip.expected_duration_s += addSeconds;
    const currentEndsAt = new Date(trip.ends_at).getTime();
    trip.ends_at = new Date(currentEndsAt + addSeconds * 1000).toISOString();

    this.notify();
    return { success: true, trip };
  }

  public triggerDuressAlert(tokenOrId: string): Alert | null {
    const trip = this.getTripByToken(tokenOrId) || this.getTripById(tokenOrId);
    if (!trip) return null;

    trip.status = 'ALERT_RAISED';
    const newAlert: Alert = {
      id: `alt-duress-${Date.now()}`,
      trip_id: trip.id,
      type: 'SOS',
      severity: 'CRITICAL',
      status: 'OPEN',
      raised_at: new Date().toISOString(),
      location: { ...trip.last_location },
      station_id: trip.current_station_id,
      station_name: trip.current_station_name,
      snapshot: {
        traveller_name: trip.traveller_name,
        traveller_phone: trip.traveller_phone,
        vehicle_number: trip.vehicle_number || 'UNKNOWN',
        battery_pct: trip.last_battery_pct,
        accuracy_m: trip.last_accuracy_m,
        speed_kmh: 0,
      },
    };

    trip.alerts.unshift(newAlert);
    this.notify();
    return newAlert;
  }

  public respondToCheckin(tokenOrId: string, response: 'SAFE' | 'UNSAFE'): boolean {
    const trip = this.getTripByToken(tokenOrId) || this.getTripById(tokenOrId);
    if (!trip) return false;

    if (response === 'SAFE') {
      const newCheckin: Checkin = {
        id: `chk-${Date.now()}`,
        sequence: trip.checkins.length + 1,
        asked_at: new Date(Date.now() - 30000).toISOString(),
        deadline_at: new Date(Date.now() + 30000).toISOString(),
        responded_at: new Date().toISOString(),
        response: 'SAFE',
        outcome: 'OK',
      };
      trip.checkins.unshift(newCheckin);
      trip.next_checkin_due_at = new Date(Date.now() + 300000).toISOString();
      trip.checkin_deadline_at = new Date(Date.now() + 360000).toISOString();
      if (trip.status === 'CHECKIN_PENDING') {
        trip.status = 'ACTIVE';
      }
    } else {
      trip.status = 'ALERT_RAISED';
      const newCheckin: Checkin = {
        id: `chk-unsafe-${Date.now()}`,
        sequence: trip.checkins.length + 1,
        asked_at: new Date().toISOString(),
        deadline_at: new Date().toISOString(),
        responded_at: new Date().toISOString(),
        response: 'UNSAFE',
        outcome: 'ALERTED_UNSAFE',
      };
      trip.checkins.unshift(newCheckin);

      const newAlert: Alert = {
        id: `alt-unsafe-${Date.now()}`,
        trip_id: trip.id,
        type: 'USER_REPORTED_UNSAFE',
        severity: 'CRITICAL',
        status: 'OPEN',
        raised_at: new Date().toISOString(),
        location: { ...trip.last_location },
        station_id: trip.current_station_id,
        station_name: trip.current_station_name,
        snapshot: {
          traveller_name: trip.traveller_name,
          traveller_phone: trip.traveller_phone,
          vehicle_number: trip.vehicle_number || 'UNKNOWN',
          battery_pct: trip.last_battery_pct,
          accuracy_m: trip.last_accuracy_m,
          speed_kmh: 0,
        },
      };
      trip.alerts.unshift(newAlert);
    }

    this.notify();
    return true;
  }
}

// Global persistent instance across Next.js reloads
const globalForStore = global as unknown as { policeStore: PoliceStore };
export const policeStore = globalForStore.policeStore || new PoliceStore();
if (process.env.NODE_ENV !== 'production') globalForStore.policeStore = policeStore;
