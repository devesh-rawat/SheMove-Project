// SheMove Backend API Client - Real-time REST & Telemetry Service
import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/models.dart';

/// Service connecting SheMoveApp directly to the SheMoveBackend FastAPI server.
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _authToken;

  // Active user credentials used for transparent auto-authentication
  String _userPhone = '+91 7078140054';
  String _userName = 'Deepika';
  String _safetyPin = '1234';
  String _duressPin = '9999';
  bool _isAuthenticating = false;

  String get baseUrl => AppConfig.baseApiUrl;
  String get _baseUrl => AppConfig.baseApiUrl;

  void setBaseUrl(String url) {
    AppConfig.setUrl(url);
    _authToken = null; // Reset token for new server address
    debugPrint('🌐 [ApiService] Active base API URL changed to: $baseUrl');
  }

  void updateCredentials({
    String? phone,
    String? name,
    String? safetyPin,
    String? duressPin,
  }) {
    if (phone != null && phone.trim().isNotEmpty) _userPhone = phone.trim();
    if (name != null && name.trim().isNotEmpty) _userName = name.trim();
    if (safetyPin != null && safetyPin.trim().isNotEmpty) {
      _safetyPin = safetyPin.trim();
    }
    if (duressPin != null && duressPin.trim().isNotEmpty) {
      _duressPin = duressPin.trim();
    }
  }

  /// Test connectivity to an arbitrary base API URL (e.g. newly entered tunnel link)
  Future<bool> testUrl(String candidateUrl) async {
    try {
      final sanitized = candidateUrl.trim().endsWith('/')
          ? candidateUrl.trim().substring(0, candidateUrl.trim().length - 1)
          : candidateUrl.trim();
      debugPrint('🔍 [ApiService] Testing health on: $sanitized/health');
      final res = await http
          .get(Uri.parse('$sanitized/health'))
          .timeout(const Duration(seconds: 5));
      final ok = res.statusCode == 200;
      debugPrint(
        '🔍 [ApiService] Health result: $ok (Status ${res.statusCode})',
      );
      return ok;
    } catch (e) {
      debugPrint('❌ [ApiService] testUrl failed for $candidateUrl: $e');
      return false;
    }
  }

  String? get authToken => _authToken;
  bool get isAuthenticated => _authToken != null && _authToken!.isNotEmpty;

  void setAuthToken(String? token) {
    _authToken = token;
  }

  Map<String, String> _headers({bool requiresAuth = true}) {
    final headers = <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };
    if (requiresAuth && _authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  /// Ensure we have a valid auth token before performing authenticated requests
  Future<bool> ensureAuthenticated() async {
    if (isAuthenticated) return true;
    if (_isAuthenticating) {
      await Future.delayed(const Duration(milliseconds: 600));
      return isAuthenticated;
    }
    _isAuthenticating = true;
    try {
      debugPrint(
        '🔄 [ApiService] Auto-authenticating to $_baseUrl for $_userPhone...',
      );
      var authResult = await loginTraveller(phone: _userPhone);
      if (authResult == null || _authToken == null) {
        debugPrint(
          '🔄 [ApiService] Login unsuccessful. Attempting registration for $_userPhone...',
        );
        authResult = await registerTraveller(
          name: _userName,
          phone: _userPhone,
          safetyPin: _safetyPin,
          duressPin: _duressPin,
        );
      }
      final ok = isAuthenticated;
      if (ok) {
        debugPrint('✅ [ApiService] Authentication established successfully.');
      } else {
        debugPrint(
          '⚠️ [ApiService] Could not authenticate with $_baseUrl. Verify backend is running.',
        );
      }
      return ok;
    } catch (e) {
      debugPrint('❌ [ApiService] ensureAuthenticated error: $e');
      return false;
    } finally {
      _isAuthenticating = false;
    }
  }

  // =========================================================================
  // HEALTH & CONNECTIVITY
  // =========================================================================

  Future<bool> checkHealth() async {
    try {
      final res = await http
          .get(Uri.parse('$_baseUrl/health'))
          .timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint(
        '❌ [ApiService.checkHealth] Could not reach $_baseUrl/health: $e',
      );
      return false;
    }
  }

  // =========================================================================
  // AUTHENTICATION (TRAVELLER)
  // =========================================================================

  /// Register a new traveller on the backend
  Future<Map<String, dynamic>?> registerTraveller({
    required String name,
    required String phone,
    String password = 'demo1234',
    String safetyPin = '1234',
    String duressPin = '9999',
  }) async {
    try {
      final url = '$_baseUrl/api/v1/auth/traveller/register';
      final body = jsonEncode({
        'name': name,
        'phone': phone,
        'password': password,
        'safety_pin': safetyPin,
        'duress_pin': duressPin,
        'biometric_enabled': false,
      });

      debugPrint('🚀 [ApiService] POST $url');
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(requiresAuth: false),
            body: body,
          )
          .timeout(const Duration(seconds: 8));

      debugPrint(
        '📥 [ApiService] Register response [${res.statusCode}]: ${res.body}',
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['token'] != null) {
          _authToken = data['token'] as String;
        }
        return data;
      }
    } catch (e) {
      debugPrint(
        '❌ [ApiService.registerTraveller] Error connecting to $_baseUrl: $e',
      );
    }
    return null;
  }

  /// Log in an existing traveller on the backend
  Future<Map<String, dynamic>?> loginTraveller({
    required String phone,
    String password = 'demo1234',
  }) async {
    try {
      final url = '$_baseUrl/api/v1/auth/traveller/login';
      final body = jsonEncode({'phone': phone, 'password': password});

      debugPrint('🚀 [ApiService] POST $url');
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(requiresAuth: false),
            body: body,
          )
          .timeout(const Duration(seconds: 8));

      debugPrint(
        '📥 [ApiService] Login response [${res.statusCode}]: ${res.body}',
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['token'] != null) {
          _authToken = data['token'] as String;
        }
        return data;
      }
    } catch (e) {
      debugPrint(
        '❌ [ApiService.loginTraveller] Error connecting to $_baseUrl: $e',
      );
    }
    return null;
  }

  // =========================================================================
  // TRAVELLER PROFILE & PINS
  // =========================================================================

  Future<UserProfile?> getMe() async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/me';
      debugPrint('🚀 [ApiService] GET $url');
      var res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 401) {
        _authToken = null;
        if (await ensureAuthenticated()) {
          res = await http
              .get(Uri.parse(url), headers: _headers())
              .timeout(const Duration(seconds: 6));
        }
      }

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['user'] is Map<String, dynamic>) {
          return UserProfile.fromJson(data['user'] as Map<String, dynamic>);
        }
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getMe] Error: $e');
    }
    return null;
  }

  Future<UserProfile?> updateMe(Map<String, dynamic> patch) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/me';
      debugPrint('🚀 [ApiService] PATCH $url: $patch');
      final res = await http
          .patch(Uri.parse(url), headers: _headers(), body: jsonEncode(patch))
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['user'] is Map<String, dynamic>) {
          return UserProfile.fromJson(data['user'] as Map<String, dynamic>);
        }
      }
    } catch (e) {
      debugPrint('❌ [ApiService.updateMe] Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> verifyPin(String pin) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/me/pins/verify';
      debugPrint('🚀 [ApiService] POST $url');
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(),
            body: jsonEncode({'pin': pin}),
          )
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('❌ [ApiService.verifyPin] Error: $e');
    }
    return null;
  }

  // =========================================================================
  // TRUSTED CONTACTS
  // =========================================================================

  Future<List<TrustedContact>> getContacts() async {
    if (!await ensureAuthenticated()) return const [];
    try {
      final url = '$_baseUrl/api/v1/contacts';
      debugPrint('🚀 [ApiService] GET $url');
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final list = data['contacts'] as List<dynamic>? ?? [];
        return list
            .map(
              (item) => TrustedContact.fromJson(item as Map<String, dynamic>),
            )
            .toList();
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getContacts] Error: $e');
    }
    return const [];
  }

  Future<TrustedContact?> createContact(TrustedContact contact) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/contacts';
      debugPrint('🚀 [ApiService] POST $url: ${contact.name}');
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(),
            body: jsonEncode(contact.toJson()),
          )
          .timeout(const Duration(seconds: 6));

      debugPrint(
        '📥 [ApiService] createContact [${res.statusCode}]: ${res.body}',
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['contact'] is Map<String, dynamic>) {
          return TrustedContact.fromJson(
            data['contact'] as Map<String, dynamic>,
          );
        }
      }
    } catch (e) {
      debugPrint('❌ [ApiService.createContact] Error: $e');
    }
    return null;
  }

  Future<TrustedContact?> updateContact(
    String contactId,
    Map<String, dynamic> patch,
  ) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/contacts/$contactId';
      final res = await http
          .patch(Uri.parse(url), headers: _headers(), body: jsonEncode(patch))
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['contact'] is Map<String, dynamic>) {
          return TrustedContact.fromJson(
            data['contact'] as Map<String, dynamic>,
          );
        }
      }
    } catch (e) {
      debugPrint('❌ [ApiService.updateContact] Error: $e');
    }
    return null;
  }

  Future<bool> deleteContact(String contactId) async {
    if (!await ensureAuthenticated()) return false;
    try {
      final url = '$_baseUrl/api/v1/contacts/$contactId';
      debugPrint('🚀 [ApiService] DELETE $url');
      final res = await http
          .delete(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('❌ [ApiService.deleteContact] Error: $e');
      return false;
    }
  }

  // =========================================================================
  // JOURNEYS (START, ACTIVE, HEARTBEAT, EXTEND, SOS, COMPLETE, CANCEL)
  // =========================================================================

  Future<Map<String, dynamic>?> startJourney({
    required String startAddress,
    required String destinationAddress,
    required TransportMode mode,
    required String vehicleNumber,
    required int estimatedMinutes,
    required int checkinIntervalMinutes,
    double startLat = 28.7317,
    double startLng = 77.1086,
    double destLat = 28.6989,
    double destLng = 77.1517,
    List<String>? contactIds,
    List<LatLngPoint>? waypoints,
    int batteryPct = 80,
    double speedKmh = 0.0,
    double heading = 0.0,
  }) async {
    if (!await ensureAuthenticated()) {
      debugPrint(
        '⚠️ [ApiService.startJourney] Cannot start journey: backend authentication failed.',
      );
      return null;
    }
    try {
      String modeStr = 'cab';
      switch (mode) {
        case TransportMode.walking:
          modeStr = 'walking';
          break;
        case TransportMode.auto:
          modeStr = 'auto';
          break;
        case TransportMode.metro:
          modeStr = 'metro';
          break;
        case TransportMode.bus:
          modeStr = 'bus';
          break;
        case TransportMode.cab:
        case TransportMode.other:
          modeStr = 'cab';
          break;
      }

      final payload = {
        'start_name': startAddress,
        'start_address': startAddress,
        'destination_name': destinationAddress,
        'destination_address': destinationAddress,
        'start_lat': startLat,
        'start_lng': startLng,
        'lat': startLat,
        'lng': startLng,
        'destination_lat': destLat,
        'destination_lng': destLng,
        'destination': {'lat': destLat, 'lng': destLng},
        'transport_mode': modeStr,
        'vehicle_number': vehicleNumber,
        'estimated_minutes': estimatedMinutes,
        'checkin_interval_minutes': checkinIntervalMinutes,
        'geofence_enabled': false,
        'contact_ids': contactIds,
        'battery_pct': batteryPct,
        'accuracy_m': 10.0,
        'speed_kmh': speedKmh,
        'heading': heading,
        'network': '4G',
      };

      final url = '$_baseUrl/api/v1/journeys';
      debugPrint('🚀 [ApiService] POST $url: $payload');
      final res = await http
          .post(Uri.parse(url), headers: _headers(), body: jsonEncode(payload))
          .timeout(const Duration(seconds: 10));

      debugPrint(
        '📥 [ApiService] startJourney [${res.statusCode}]: ${res.body}',
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint(
        '❌ [ApiService.startJourney] Error connecting to $_baseUrl: $e',
      );
    }
    return null;
  }

  Future<List<Journey>> getJourneys() async {
    if (!await ensureAuthenticated()) return const [];
    try {
      final url = '$_baseUrl/api/v1/journeys';
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final list = data['trips'] as List<dynamic>? ?? [];
        return list
            .map((item) => Journey.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getJourneys] Error: $e');
    }
    return const [];
  }

  Future<Journey?> getActiveJourney() async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/journeys/active';
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['trip'] is Map<String, dynamic>) {
          return Journey.fromJson(data['trip'] as Map<String, dynamic>);
        }
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getActiveJourney] Error: $e');
    }
    return null;
  }

  Future<Journey?> getJourney(String tripId) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId';
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['trip'] is Map<String, dynamic>) {
          return Journey.fromJson(data['trip'] as Map<String, dynamic>);
        }
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getJourney] Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> getJourneyRisk(String tripId) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId/risk';
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getJourneyRisk] Error: $e');
    }
    return null;
  }

  Future<bool> sendHeartbeat(
    String tripId, {
    required double lat,
    required double lng,
    double accuracyM = 10.0,
    double speedKmh = 0.0,
    double heading = 0.0,
    int batteryPct = 80,
    String network = '4G',
  }) async {
    if (!await ensureAuthenticated()) return false;
    try {
      final body = jsonEncode({
        'lat': lat,
        'lng': lng,
        'accuracy_m': accuracyM,
        'speed_kmh': speedKmh,
        'heading': heading,
        'battery_pct': batteryPct,
        'is_charging': false,
        'network': network,
        'offline_queued': false,
      });

      final url = '$_baseUrl/api/v1/journeys/$tripId/heartbeat';
      final res = await http
          .post(Uri.parse(url), headers: _headers(), body: body)
          .timeout(const Duration(seconds: 5));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('❌ [ApiService.sendHeartbeat] Error: $e');
      return false;
    }
  }

  Future<bool> updateVehicle(String tripId, String vehicleNumber) async {
    if (!await ensureAuthenticated()) return false;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId/vehicle';
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(),
            body: jsonEncode({'vehicle_number': vehicleNumber}),
          )
          .timeout(const Duration(seconds: 5));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('❌ [ApiService.updateVehicle] Error: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> extendJourney(
    String tripId,
    int additionalMinutes, {
    String? pin,
  }) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final payload = <String, dynamic>{
        'additional_minutes': additionalMinutes,
      };
      if (pin != null) payload['pin'] = pin;

      final url = '$_baseUrl/api/v1/journeys/$tripId/extend';
      debugPrint('🚀 [ApiService] POST $url: $payload');
      final res = await http
          .post(Uri.parse(url), headers: _headers(), body: jsonEncode(payload))
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('❌ [ApiService.extendJourney] Error: $e');
    }
    return null;
  }

  Future<bool> triggerCheckinDue(String tripId) async {
    if (!await ensureAuthenticated()) return false;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId/checkin/due';
      final res = await http
          .post(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('❌ [ApiService.triggerCheckinDue] Error: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> respondCheckin(
    String tripId, {
    required String response,
    String? pin,
  }) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final payload = <String, dynamic>{'response': response};
      if (pin != null) payload['pin'] = pin;

      final url = '$_baseUrl/api/v1/journeys/$tripId/checkin';
      debugPrint('🚀 [ApiService] POST $url: $payload');
      final res = await http
          .post(Uri.parse(url), headers: _headers(), body: jsonEncode(payload))
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('❌ [ApiService.respondCheckin] Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> triggerSos(
    String tripId, {
    required String reason,
    String? pin,
    double? lat,
    double? lng,
    double? accuracyM,
    int? batteryPct,
    String? address,
  }) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final payload = <String, dynamic>{'reason': reason};
      if (pin != null) payload['pin'] = pin;
      if (lat != null) payload['lat'] = lat;
      if (lng != null) payload['lng'] = lng;
      if (accuracyM != null) payload['accuracy_m'] = accuracyM;
      if (batteryPct != null) payload['battery_pct'] = batteryPct;
      if (address != null) payload['address'] = address;

      final url = '$_baseUrl/api/v1/journeys/$tripId/sos';
      debugPrint('🚀 [ApiService] POST $url: $payload');
      final res = await http
          .post(Uri.parse(url), headers: _headers(), body: jsonEncode(payload))
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('❌ [ApiService.triggerSos] Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> disarmEmergency(
    String tripId, {
    required String pin,
  }) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId/disarm';
      debugPrint('🛡️ [ApiService] POST $url (Disarming with Safety PIN)');
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(),
            body: jsonEncode({'pin': pin}),
          )
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        debugPrint('✅ [ApiService.disarmEmergency] Disarmed successfully: $data');
        return data;
      }
    } catch (e) {
      debugPrint('❌ [ApiService.disarmEmergency] Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> completeJourney(
    String tripId, {
    bool confirmedSafe = true,
  }) async {
    if (!await ensureAuthenticated()) return null;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId/complete';
      debugPrint('🚀 [ApiService] POST $url (confirmedSafe: $confirmedSafe)');
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(),
            body: jsonEncode({'confirmed_safe': confirmedSafe}),
          )
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('❌ [ApiService.completeJourney] Error: $e');
    }
    return null;
  }

  Future<bool> cancelJourney(String tripId) async {
    if (!await ensureAuthenticated()) return false;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId/cancel';
      final res = await http
          .post(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('❌ [ApiService.cancelJourney] Error: $e');
      return false;
    }
  }

  // =========================================================================
  // EVENTS & AUDIT LOGS
  // =========================================================================

  Future<List<SafetyEvent>> getEvents() async {
    if (!await ensureAuthenticated()) return const [];
    try {
      final url = '$_baseUrl/api/v1/events';
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final list = data['events'] as List<dynamic>? ?? [];
        return list
            .map((item) => SafetyEvent.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getEvents] Error: $e');
    }
    return const [];
  }

  // =========================================================================
  // ADDITIONAL APIS (NOTIFICATIONS, GEOFENCES, OFFLINE SYNC, PUBLIC TRACKING)
  // =========================================================================

  Future<List<Map<String, dynamic>>> getGeofences() async {
    if (!await ensureAuthenticated()) return const [];
    try {
      final url = '$_baseUrl/api/v1/geofences';
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final list = data['geofences'] as List<dynamic>? ?? [];
        return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getGeofences] Error: $e');
    }
    return const [];
  }

  Future<bool> deleteGeofence(String fenceId) async {
    if (!await ensureAuthenticated()) return false;
    try {
      final url = '$_baseUrl/api/v1/geofences/$fenceId';
      final res = await http
          .delete(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('❌ [ApiService.deleteGeofence] Error: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getNotifications() async {
    if (!await ensureAuthenticated()) return const [];
    try {
      final url = '$_baseUrl/api/v1/notifications';
      final res = await http
          .get(Uri.parse(url), headers: _headers())
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final list = data['notifications'] as List<dynamic>? ?? [];
        return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
    } catch (e) {
      debugPrint('❌ [ApiService.getNotifications] Error: $e');
    }
    return const [];
  }

  Future<bool> syncOfflineEvents(
    String tripId,
    List<Map<String, dynamic>> events,
  ) async {
    if (!await ensureAuthenticated()) return false;
    try {
      final url = '$_baseUrl/api/v1/journeys/$tripId/offline-sync';
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(),
            body: jsonEncode({'events': events}),
          )
          .timeout(const Duration(seconds: 6));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('❌ [ApiService.syncOfflineEvents] Error: $e');
      return false;
    }
  }

  /// Simulate a demo scenario action directly on the backend
  Future<Map<String, dynamic>?> simulateDemo(String action, {String? tripId}) async {
    try {
      final url = '$_baseUrl/api/v1/demo/simulate';
      final payload = <String, dynamic>{
        'action': action,
        if (tripId != null && tripId.isNotEmpty) 'tripId': tripId,
      };
      debugPrint('🧪 [ApiService.simulateDemo] Sending $action for trip: $tripId');
      final res = await http
          .post(
            Uri.parse(url),
            headers: _headers(requiresAuth: false),
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        debugPrint('✅ [ApiService.simulateDemo] Success: ${res.body}');
        return data;
      } else {
        debugPrint('⚠️ [ApiService.simulateDemo] HTTP ${res.statusCode}: ${res.body}');
      }
    } catch (e) {
      debugPrint('❌ [ApiService.simulateDemo] Error: $e');
    }
    return null;
  }

  /// Live public tracking URL shareable with trusted guardians and emergency contacts
  String getPublicTrackingUrl(String shareTokenOrId) {
    return '$_baseUrl/api/v1/public/track/$shareTokenOrId';
  }
}
