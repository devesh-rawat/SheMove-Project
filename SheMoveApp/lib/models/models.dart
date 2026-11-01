import 'package:flutter/material.dart';

enum TransportMode {
  walking('Walking', Icons.directions_walk),
  cab('Cab / Taxi', Icons.local_taxi),
  auto('Auto / Rickshaw', Icons.electric_rickshaw),
  bus('Public Bus', Icons.directions_bus),
  metro('Metro Train', Icons.subway),
  other('Other', Icons.commute);

  final String label;
  final IconData icon;
  const TransportMode(this.label, this.icon);
}

enum JourneyStatus {
  idle,
  planning,
  active,
  checkInDue,
  escalating,
  emergency,
  covertDuress,
  completed,
}

enum SafetyLevel {
  safe,
  adaptiveMonitoring,
  checkInPending,
  missedWarning,
  emergencyActive,
  covertAlert,
}

class LatLngPoint {
  final double latitude;
  final double longitude;
  final String address;

  const LatLngPoint({
    required this.latitude,
    required this.longitude,
    this.address = '',
  });

  LatLngPoint copyWith({
    double? latitude,
    double? longitude,
    String? address,
  }) {
    return LatLngPoint(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
    );
  }
}

class Waypoint {
  final LatLngPoint point;
  final int timestamp;
  final double speedKmh;

  const Waypoint({
    required this.point,
    required this.timestamp,
    this.speedKmh = 0.0,
  });
}

class Journey {
  final String id;
  final String startAddress;
  final String destinationAddress;
  final TransportMode transportMode;
  final String vehicleNumber;
  final int estimatedMinutes;
  final int startTimeMillis;
  final double progressPercent;
  final JourneyStatus status;
  final int checkInIntervalMinutes;
  final bool geofenceEnabled;
  final int contactsNotifiedCount;
  final List<LatLngPoint> waypoints;
  final String notes;
  final String? shareToken;

  const Journey({
    required this.id,
    required this.startAddress,
    required this.destinationAddress,
    required this.transportMode,
    this.vehicleNumber = '',
    this.estimatedMinutes = 25,
    required this.startTimeMillis,
    this.progressPercent = 0.0,
    this.status = JourneyStatus.active,
    this.checkInIntervalMinutes = 10,
    this.geofenceEnabled = true,
    this.contactsNotifiedCount = 0,
    this.waypoints = const [],
    this.notes = '',
    this.shareToken,
  });

  factory Journey.fromJson(Map<String, dynamic> json) {
    final id = json['id'] as String? ?? 'j_${DateTime.now().millisecondsSinceEpoch}';
    final start = json['start_address'] as String? ?? json['start_name'] as String? ?? 'Start Point';
    final dest = json['destination_address'] as String? ?? json['destination_name'] as String? ?? 'Destination';
    final vehicle = json['vehicle_number'] as String? ?? '';
    final duration = json['expected_duration_s'] != null
        ? ((json['expected_duration_s'] as num) / 60).round()
        : (json['estimated_minutes'] as int? ?? 25);
    final startedAtStr = json['started_at'] as String?;
    final startMillis = startedAtStr != null
        ? (DateTime.tryParse(startedAtStr)?.millisecondsSinceEpoch ?? DateTime.now().millisecondsSinceEpoch)
        : DateTime.now().millisecondsSinceEpoch;

    final modeStr = (json['transport_mode'] as String? ?? 'cab').toLowerCase();
    TransportMode mode = TransportMode.cab;
    if (modeStr == 'walking') {
      mode = TransportMode.walking;
    } else if (modeStr == 'auto') {
      mode = TransportMode.auto;
    } else if (modeStr == 'metro') {
      mode = TransportMode.metro;
    } else if (modeStr == 'bus') {
      mode = TransportMode.bus;
    }

    final statusStr = (json['status'] as String? ?? 'ACTIVE').toUpperCase();
    JourneyStatus status = JourneyStatus.active;
    if (statusStr == 'COMPLETED') {
      status = JourneyStatus.completed;
    } else if (statusStr == 'ALERT_RAISED') {
      status = JourneyStatus.emergency;
    } else if (statusStr == 'CHECKIN_PENDING') {
      status = JourneyStatus.checkInDue;
    }

    final contactsList = json['contacts'] as List<dynamic>? ?? [];
    final shareToken = json['share_token'] as String?;

    return Journey(
      id: id,
      startAddress: start,
      destinationAddress: dest,
      transportMode: mode,
      vehicleNumber: vehicle,
      estimatedMinutes: duration,
      startTimeMillis: startMillis,
      progressPercent: status == JourneyStatus.completed ? 1.0 : 0.0,
      status: status,
      checkInIntervalMinutes: json['checkin_interval_minutes'] as int? ?? 10,
      geofenceEnabled: json['geofence_enabled'] as bool? ?? false,
      contactsNotifiedCount: contactsList.length,
      shareToken: shareToken,
      notes: json['notes'] as String? ?? '',
    );
  }

  Journey copyWith({
    String? id,
    String? startAddress,
    String? destinationAddress,
    TransportMode? transportMode,
    String? vehicleNumber,
    int? estimatedMinutes,
    int? startTimeMillis,
    double? progressPercent,
    JourneyStatus? status,
    int? checkInIntervalMinutes,
    bool? geofenceEnabled,
    int? contactsNotifiedCount,
    List<LatLngPoint>? waypoints,
    String? notes,
    String? shareToken,
  }) {
    return Journey(
      id: id ?? this.id,
      startAddress: startAddress ?? this.startAddress,
      destinationAddress: destinationAddress ?? this.destinationAddress,
      transportMode: transportMode ?? this.transportMode,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      startTimeMillis: startTimeMillis ?? this.startTimeMillis,
      progressPercent: progressPercent ?? this.progressPercent,
      status: status ?? this.status,
      checkInIntervalMinutes: checkInIntervalMinutes ?? this.checkInIntervalMinutes,
      geofenceEnabled: geofenceEnabled ?? this.geofenceEnabled,
      contactsNotifiedCount: contactsNotifiedCount ?? this.contactsNotifiedCount,
      waypoints: waypoints ?? this.waypoints,
      notes: notes ?? this.notes,
      shareToken: shareToken ?? this.shareToken,
    );
  }
}

enum ContactNotificationStatus {
  idle,
  sending,
  sent,
  delivered,
  acknowledged,
}

class TrustedContact {
  final String id;
  final String name;
  final String phone;
  final String relationship;
  final bool isPrimary;
  final bool isVerified;
  final ContactNotificationStatus notificationStatus;
  final String? acknowledgedTimeAgo;

  const TrustedContact({
    required this.id,
    required this.name,
    required this.phone,
    required this.relationship,
    this.isPrimary = false,
    this.isVerified = true,
    this.notificationStatus = ContactNotificationStatus.idle,
    this.acknowledgedTimeAgo,
  });

  factory TrustedContact.fromJson(Map<String, dynamic> json) {
    return TrustedContact(
      id: json['id'] as String? ?? 'c_${DateTime.now().millisecondsSinceEpoch}',
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      relationship: json['relation'] as String? ?? json['relationship'] as String? ?? 'Family',
      isPrimary: json['is_primary'] as bool? ?? false,
      isVerified: json['is_verified'] as bool? ?? true,
      notificationStatus: (json['smsStatus'] == 'DELIVERED' || json['smsStatus'] == 'SENT')
          ? ContactNotificationStatus.delivered
          : ContactNotificationStatus.idle,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'relation': relationship,
      'relationship': relationship,
      'notify_whatsapp': true,
      'is_primary': isPrimary,
      'is_verified': isVerified,
    };
  }

  TrustedContact copyWith({
    String? id,
    String? name,
    String? phone,
    String? relationship,
    bool? isPrimary,
    bool? isVerified,
    ContactNotificationStatus? notificationStatus,
    String? acknowledgedTimeAgo,
  }) {
    return TrustedContact(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      relationship: relationship ?? this.relationship,
      isPrimary: isPrimary ?? this.isPrimary,
      isVerified: isVerified ?? this.isVerified,
      notificationStatus: notificationStatus ?? this.notificationStatus,
      acknowledgedTimeAgo: acknowledgedTimeAgo ?? this.acknowledgedTimeAgo,
    );
  }
}

enum EventSeverity {
  info,
  success,
  warning,
  critical,
}

class SafetyEvent {
  final String id;
  final int timestamp;
  final String title;
  final String description;
  final EventSeverity severity;
  final String location;

  const SafetyEvent({
    required this.id,
    required this.timestamp,
    required this.title,
    required this.description,
    required this.severity,
    this.location = 'Connaught Place, New Delhi',
  });

  factory SafetyEvent.fromJson(Map<String, dynamic> json) {
    final createdAtStr = json['created_at'] as String?;
    final timeMillis = createdAtStr != null
        ? (DateTime.tryParse(createdAtStr)?.millisecondsSinceEpoch ?? DateTime.now().millisecondsSinceEpoch)
        : DateTime.now().millisecondsSinceEpoch;
    final kind = (json['kind'] as String? ?? json['type'] as String? ?? 'INFO').toUpperCase();
    EventSeverity severity = EventSeverity.info;
    if (kind.contains('ALERT') || kind.contains('SOS') || kind.contains('CRITICAL')) {
      severity = EventSeverity.critical;
    } else if (kind.contains('WARN') || kind.contains('MISS') || kind.contains('UNREACHABLE')) {
      severity = EventSeverity.warning;
    } else if (kind.contains('SAFE') || kind.contains('RESOLV') || kind.contains('REGISTER') || kind.contains('ACK')) {
      severity = EventSeverity.success;
    }
    return SafetyEvent(
      id: json['id'] as String? ?? 'ev_$timeMillis',
      timestamp: timeMillis,
      title: json['kind'] as String? ?? json['type'] as String? ?? 'Security Log',
      description: json['message'] as String? ?? json['reason'] as String? ?? '',
      severity: severity,
      location: (json['metadata'] is Map && (json['metadata'] as Map)['location'] != null)
          ? (json['metadata'] as Map)['location'].toString()
          : 'Delhi NCR',
    );
  }
}

class UserProfile {
  final String name;
  final String phone;
  final String safetyPin;
  final String duressPin;
  final int defaultCheckInMinutes;
  final bool adaptiveFrequencyEnabled;
  final String emergencyMessage;
  final bool isDarkMode;
  final bool isSetupComplete;
  final String geminiApiKey;

  const UserProfile({
    this.name = 'Aanya Rao',
    this.phone = '+91 98112 34567',
    this.safetyPin = '1234',
    this.duressPin = '9999',
    this.defaultCheckInMinutes = 10,
    this.adaptiveFrequencyEnabled = true,
    this.emergencyMessage =
        'SheMove Alert: I have not completed my safety check-in. Here is my live GPS location & route info: https://shemove.app/track/live',
    this.isDarkMode = false,
    this.isSetupComplete = false,
    this.geminiApiKey = '',
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      name: json['name'] as String? ?? 'Aanya Rao',
      phone: json['phone'] as String? ?? '+91 98112 34567',
      safetyPin: json['safety_pin'] as String? ?? '1234',
      duressPin: json['duress_pin'] as String? ?? '9999',
      defaultCheckInMinutes: json['default_checkin_minutes'] as int? ?? 10,
      adaptiveFrequencyEnabled: json['adaptive_frequency_enabled'] as bool? ?? true,
      emergencyMessage: json['emergency_message'] as String? ??
          'SheMove Alert: I have not completed my safety check-in. Here is my live GPS location & route info.',
      isDarkMode: json['is_dark_mode'] as bool? ?? false,
      isSetupComplete: json['is_setup_complete'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'safety_pin': safetyPin,
      'duress_pin': duressPin,
      'default_checkin_minutes': defaultCheckInMinutes,
      'adaptive_frequency_enabled': adaptiveFrequencyEnabled,
      'emergency_message': emergencyMessage,
      'is_dark_mode': isDarkMode,
      'is_setup_complete': isSetupComplete,
    };
  }

  UserProfile copyWith({
    String? name,
    String? phone,
    String? safetyPin,
    String? duressPin,
    int? defaultCheckInMinutes,
    bool? adaptiveFrequencyEnabled,
    String? emergencyMessage,
    bool? isDarkMode,
    bool? isSetupComplete,
    String? geminiApiKey,
  }) {
    return UserProfile(
      name: name ?? this.name,
      phone: phone ?? this.phone,
      safetyPin: safetyPin ?? this.safetyPin,
      duressPin: duressPin ?? this.duressPin,
      defaultCheckInMinutes: defaultCheckInMinutes ?? this.defaultCheckInMinutes,
      adaptiveFrequencyEnabled: adaptiveFrequencyEnabled ?? this.adaptiveFrequencyEnabled,
      emergencyMessage: emergencyMessage ?? this.emergencyMessage,
      isDarkMode: isDarkMode ?? this.isDarkMode,
      isSetupComplete: isSetupComplete ?? this.isSetupComplete,
      geminiApiKey: geminiApiKey ?? this.geminiApiKey,
    );
  }
}

