// SafeLoop State Manager - Production Real-time Telemetry & Safety State Engine
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_compass/flutter_compass.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/contacts_service.dart';
import '../services/gemini_service.dart';
import '../services/location_service.dart';
import '../services/vibration_service.dart';

enum SafeLoopScreen {
  onboarding,
  setup,
  home,
  journeyPlanner,
  activeJourney,
  safetyCheckIn,
  escalationWarning,
  emergencyActive,
  journeyCompleted,
  history,
  contacts,
  settings,
}

typedef SheMoveScreen = SafeLoopScreen;
typedef SafeLoopController = SafeLoopState;

class SafeLoopState extends ChangeNotifier {
  SafeLoopScreen _currentScreen = SafeLoopScreen.home;
  final List<SafeLoopScreen> _screenStack = [SafeLoopScreen.home];
  UserProfile _userProfile = const UserProfile();
  Journey? _activeJourney;
  List<TrustedContact> _contacts = const [];
  List<Journey> _history = const [];
  List<SafetyEvent> _events = const [];
  LatLngPoint _currentLocation = LocationService.defaultFallbackLocation;
  double _currentHeading = 0.0;
  double _currentSpeedKmh = 0.0;
  bool _hasLocationPermission = false;
  bool _isLocationLoading = false;
  bool _isLiveGpsActive = false;
  String? _locationStatusMessage;
  final LocationService _locationService;
  final ContactsService _contactsService;
  final ApiService _apiService;
  final VibrationService _vibrationService;
  StreamSubscription<Position>? _positionSubscription;
  StreamSubscription<CompassEvent>? _compassSubscription;
  int _lastReverseGeocodeMillis = 0;
  double _lastGeocodedLat = 0.0;
  double _lastGeocodedLon = 0.0;
  int _checkInSecondsRemaining = 600;
  int _escalationSecondsRemaining = 45;
  bool _isOnline = true;
  bool _isCovertDistressActive = false;
  String? _toastMessage;
  bool _showScenarioPicker = false;
  Journey? _selectedHistoryJourney;
  Journey? _lastCompletedJourney;

  Timer? _journeyTicker;
  Timer? _heartbeatTimer;
  Timer? _escalationTicker;
  Timer? _checkInWindowTicker;
  int _checkInWindowSecondsRemaining = 60;

  SafeLoopState({
    LocationService? locationService,
    ContactsService? contactsService,
    ApiService? apiService,
    VibrationService? vibrationService,
  })  : _locationService = locationService ?? LocationService(),
        _contactsService = contactsService ?? ContactsService(),
        _apiService = apiService ?? ApiService(),
        _vibrationService = vibrationService ?? VibrationService() {
    _initDefaultData();
    initLocationTracking();
    _loadSavedSession();
  }

  Future<void> _loadSavedSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('shemove_is_logged_in') ?? false;

      if (isLoggedIn) {
        final profileJson = prefs.getString('shemove_user_profile');
        final explicitDark = prefs.getBool('shemove_explicit_dark_theme');
        if (profileJson != null && profileJson.isNotEmpty) {
          try {
            final map = jsonDecode(profileJson) as Map<String, dynamic>;
            _userProfile = UserProfile.fromJson(map).copyWith(
              isSetupComplete: true,
              isDarkMode: explicitDark ?? false,
            );
          } catch (_) {
            _userProfile = _userProfile.copyWith(
              isSetupComplete: true,
              isDarkMode: explicitDark ?? false,
            );
          }
        } else {
          _userProfile = _userProfile.copyWith(
            isSetupComplete: true,
            isDarkMode: explicitDark ?? false,
          );
        }

        final token = prefs.getString('shemove_auth_token');
        if (token != null && token.isNotEmpty) {
          _apiService.setAuthToken(token);
        }

        // Direct navigation to home screen because user is already logged in
        _currentScreen = SafeLoopScreen.home;
        _screenStack
          ..clear()
          ..add(SafeLoopScreen.home);
        notifyListeners();
        debugPrint('✅ [SafeLoopState] Logged-in session restored: ${_userProfile.name} (${_userProfile.phone})');
      } else {
        _currentScreen = SafeLoopScreen.onboarding;
        _screenStack
          ..clear()
          ..add(SafeLoopScreen.onboarding);
        notifyListeners();
        debugPrint('ℹ️ [SafeLoopState] No active saved session. Showing onboarding.');
      }
    } catch (e) {
      debugPrint('Error loading saved session: $e');
    }

    _apiService.updateCredentials(
      phone: _userProfile.phone,
      name: _userProfile.name,
      safetyPin: _userProfile.safetyPin,
      duressPin: _userProfile.duressPin,
    );
    await syncWithBackend();
  }

  Future<void> _saveSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('shemove_is_logged_in', true);
      await prefs.setString('shemove_user_profile', jsonEncode(_userProfile.toJson()));
      if (_apiService.authToken != null) {
        await prefs.setString('shemove_auth_token', _apiService.authToken!);
      }
      debugPrint('💾 [SafeLoopState] Saved active session for ${_userProfile.name}');
    } catch (e) {
      debugPrint('Error saving session: $e');
    }
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('shemove_is_logged_in');
      await prefs.remove('shemove_user_profile');
      await prefs.remove('shemove_auth_token');
    } catch (e) {
      debugPrint('Error clearing session on logout: $e');
    }

    _journeyTicker?.cancel();
    _heartbeatTimer?.cancel();
    _escalationTicker?.cancel();
    _checkInWindowTicker?.cancel();

    _apiService.setAuthToken(null);
    _userProfile = const UserProfile(
      name: '',
      phone: '',
      safetyPin: '1234',
      duressPin: '9999',
      isSetupComplete: false,
    );
    _contacts = const [];
    _history = const [];
    _events = const [];
    _activeJourney = null;
    _isCovertDistressActive = false;

    _addSafetyEvent(
      'User Logged Out',
      'Active session ended from settings. User returned to onboarding.',
      EventSeverity.info,
    );

    _screenStack
      ..clear()
      ..add(SafeLoopScreen.onboarding);
    _currentScreen = SafeLoopScreen.onboarding;
    notifyListeners();
  }

  void _initDefaultData() {
    _userProfile = const UserProfile(
      name: 'Aanya Rao',
      phone: '+91 98112 34567',
      safetyPin: '1234',
      duressPin: '9999',
      defaultCheckInMinutes: 10,
      adaptiveFrequencyEnabled: true,
      isDarkMode: false,
      isSetupComplete: false,
    );

    _contacts = const [];
    _history = const [];
    _events = const [];

    _currentScreen = SafeLoopScreen.onboarding;
    _screenStack
      ..clear()
      ..add(SafeLoopScreen.onboarding);
  }

  /// Synchronize app state with real SheMoveBackend API endpoints
  Future<void> syncWithBackend() async {
    try {
      _apiService.updateCredentials(
        phone: _userProfile.phone,
        name: _userProfile.name,
        safetyPin: _userProfile.safetyPin,
        duressPin: _userProfile.duressPin,
      );

      final isHealthy = await _apiService.checkHealth();
      if (!isHealthy) {
        debugPrint('⚠️ [SafeLoopState] Backend at ${_apiService.baseUrl} is unreachable.');
        _isOnline = false;
        notifyListeners();
        return;
      }

      await _apiService.ensureAuthenticated();

      if (_apiService.isAuthenticated) {
        _isOnline = true;
        // 2. Fetch real user profile from backend
        final me = await _apiService.getMe();
        if (me != null) {
          _userProfile = me.copyWith(isSetupComplete: true);
          _saveSession();
        }

        // 3. Fetch real trusted contacts from backend
        final backendContacts = await _apiService.getContacts();
        if (backendContacts.isNotEmpty) {
          _contacts = backendContacts;
        }

        // 4. Fetch real journeys history from backend
        final backendTrips = await _apiService.getJourneys();
        if (backendTrips.isNotEmpty) {
          _history = backendTrips;
        }

        // 5. Fetch real safety events from backend
        final backendEvents = await _apiService.getEvents();
        if (backendEvents.isNotEmpty) {
          _events = backendEvents;
        }

        // 6. Check for active trip
        final activeTrip = await _apiService.getActiveJourney();
        if (activeTrip != null && activeTrip.status != JourneyStatus.completed) {
          _activeJourney = activeTrip;
          _startJourneySimulation();
          _startHeartbeatTimer();
        }

        notifyListeners();
      } else {
        _isOnline = false;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('SafeLoopState.syncWithBackend error: $e');
      _isOnline = false;
      notifyListeners();
    }
  }

  // Getters
  ApiService get apiService => _apiService;
  SafeLoopScreen get currentScreen => _currentScreen;
  UserProfile get userProfile => _userProfile;
  Journey? get activeJourney => _activeJourney;
  List<TrustedContact> get contacts => _contacts;
  List<Journey> get history => _history;
  List<SafetyEvent> get events => _events;
  LatLngPoint get currentLocation => _currentLocation;
  double get currentHeading => _currentHeading;
  double get currentSpeedKmh => _currentSpeedKmh;
  bool get hasLocationPermission => _hasLocationPermission;
  bool get isLocationLoading => _isLocationLoading;
  bool get isLiveGpsActive => _isLiveGpsActive;
  String? get locationStatusMessage => _locationStatusMessage;
  int get checkInSecondsRemaining => _checkInSecondsRemaining;
  int get checkInWindowSecondsRemaining => _checkInWindowSecondsRemaining;
  int get escalationSecondsRemaining => _escalationSecondsRemaining;
  bool get isOnline => _isOnline;
  bool get isCovertDistressActive => _isCovertDistressActive;
  String? get toastMessage => _toastMessage;
  bool get showScenarioPicker => _showScenarioPicker;
  Journey? get selectedHistoryJourney => _selectedHistoryJourney;
  Journey? get lastCompletedJourney => _lastCompletedJourney;

  bool get hasActiveJourney =>
      _activeJourney != null && _activeJourney!.status != JourneyStatus.completed;

  // Navigation
  void navigateTo(SafeLoopScreen screen) {
    if (screen == SafeLoopScreen.home) {
      _screenStack
        ..clear()
        ..add(SafeLoopScreen.home);
      _currentScreen = SafeLoopScreen.home;
    } else {
      if (_currentScreen != screen) {
        if (_screenStack.isEmpty || _screenStack.last != screen) {
          _screenStack.add(screen);
        }
        _currentScreen = screen;
      }
    }
    notifyListeners();
  }

  void navigateBack() {
    if (_screenStack.length > 1) {
      _screenStack.removeLast();
      _currentScreen = _screenStack.last;
    } else {
      _currentScreen = SafeLoopScreen.home;
      _screenStack
        ..clear()
        ..add(SafeLoopScreen.home);
    }
    notifyListeners();
  }

  void toggleScenarioPicker([bool? show]) {
    _showScenarioPicker = show ?? !_showScenarioPicker;
    notifyListeners();
  }

  void selectHistoryJourney(Journey? journey) {
    _selectedHistoryJourney = journey;
    notifyListeners();
  }

  // Real-Time Location Services
  Future<void> initLocationTracking() async {
    _startCompassStream();
    try {
      var permission = await _locationService.checkPermission();
      if (!_locationService.isPermissionGranted(permission)) {
        permission = await _locationService.requestPermission();
      }
      if (_locationService.isPermissionGranted(permission)) {
        _hasLocationPermission = true;
        await _fetchCurrentGpsPosition();
        _startLocationStream();
      } else {
        _hasLocationPermission = false;
        // Even without active stream permission, fetch cached/last-known position
        await _fetchCurrentGpsPosition();
      }
      notifyListeners();
    } catch (e) {
      debugPrint('SafeLoopState: Error initializing location: $e');
    }
  }

  Future<bool> requestLocationPermission() async {
    _startCompassStream();
    _isLocationLoading = true;
    _locationStatusMessage = 'Requesting GPS access...';
    notifyListeners();

    try {
      final permission = await _locationService.requestPermission();
      if (_locationService.isPermissionGranted(permission)) {
        _hasLocationPermission = true;
        _locationStatusMessage = 'Acquiring satellite lock...';
        notifyListeners();

        await _fetchCurrentGpsPosition();
        _startLocationStream();
        _isLocationLoading = false;
        _locationStatusMessage = null;

        _addSafetyEvent(
          'Real-Time GPS Synchronized',
          'Live satellite telemetry active at ${_currentLocation.address}',
          EventSeverity.success,
          _currentLocation.address,
        );
        notifyListeners();
        return true;
      } else {
        _hasLocationPermission = false;
        _isLocationLoading = false;
        _locationStatusMessage = 'Location permission was denied';
        notifyListeners();
        return false;
      }
    } catch (e) {
      debugPrint('SafeLoopState: Error requesting location permission: $e');
      _isLocationLoading = false;
      _locationStatusMessage = 'Unable to acquire GPS';
      notifyListeners();
      return false;
    }
  }

  Future<void> refreshCurrentLocation() async {
    _isLocationLoading = true;
    notifyListeners();
    await _fetchCurrentGpsPosition();
    _isLocationLoading = false;
    notifyListeners();
  }

  Future<void> _fetchCurrentGpsPosition() async {
    final result = await _locationService.getCurrentLocation();
    if (result.isLive) {
      _currentLocation = result.point;
      _isLiveGpsActive = true;
      _locationStatusMessage = null;
    } else if (result.error != null) {
      _locationStatusMessage = result.error;
    }
  }

  void _startLocationStream() {
    try {
      _positionSubscription?.cancel();
      final stream = _locationService.getPositionStream(distanceFilterMeters: 2);
      if (stream != null) {
        _positionSubscription = stream.listen((position) {
          // 1. Immediately reflect coordinates, speed and movement heading in state
          _currentLocation = LatLngPoint(
            latitude: position.latitude,
            longitude: position.longitude,
            address: _currentLocation.address,
          );
          if (position.heading > 0) {
            _currentHeading = position.heading;
          }
          _currentSpeedKmh = position.speed >= 0 ? position.speed * 3.6 : 0.0;
          _isLiveGpsActive = true;

          // If journey is active and has waypoints, update progress directly from live GPS
          if (_activeJourney != null && _activeJourney!.status == JourneyStatus.active) {
            if (_activeJourney!.waypoints.length >= 2) {
              final gpsProg = _computeGpsProgress(_activeJourney!.waypoints);
              _activeJourney = _activeJourney!.copyWith(progressPercent: gpsProg);
            }
          }
          notifyListeners();

          // 2. Throttle reverse geocoding in background so stream is never blocked
          _maybeUpdateAddress(position.latitude, position.longitude);
        }, onError: (err) {
          debugPrint('SafeLoopState: Location stream error: $err');
        });
      }
    } catch (e) {
      debugPrint('SafeLoopState: Error starting location stream: $e');
    }
  }

  void _startCompassStream() {
    _compassSubscription?.cancel();
    try {
      final stream = FlutterCompass.events;
      if (stream != null) {
        _compassSubscription = stream.listen((event) {
          if (event.heading != null) {
            final newHeading = (event.heading! % 360 + 360) % 360;
            if ((newHeading - _currentHeading).abs() > 0.5) {
              _currentHeading = newHeading;
              notifyListeners();
            }
          }
        }, onError: (err) {
          debugPrint('SafeLoopState: Compass stream error: $err');
        });
      }
    } catch (e) {
      debugPrint('SafeLoopState: Error subscribing to compass events: $e');
    }
  }

  void _maybeUpdateAddress(double lat, double lon) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final distApprox = ((lat - _lastGeocodedLat).abs() + (lon - _lastGeocodedLon).abs());
    if (now - _lastReverseGeocodeMillis > 15000 || distApprox > 0.001) {
      _lastReverseGeocodeMillis = now;
      _lastGeocodedLat = lat;
      _lastGeocodedLon = lon;
      _locationService.reverseGeocode(lat, lon).then((addr) {
        if (addr.isNotEmpty && addr != _currentLocation.address) {
          _currentLocation = LatLngPoint(
            latitude: _currentLocation.latitude,
            longitude: _currentLocation.longitude,
            address: addr,
          );
          notifyListeners();
        }
      }).catchError((_) {});
    }
  }

  ContactsService get contactsService => _contactsService;

  Future<bool> requestContactsPermission() async {
    return await _contactsService.requestPermission();
  }

  Future<TrustedContact?> pickContactFromDevice({String relationship = 'Family'}) async {
    final picked = await _contactsService.pickContact();
    if (picked != null) {
      final now = DateTime.now().millisecondsSinceEpoch;
      final newContact = TrustedContact(
        id: 'c_${picked.id}_$now',
        name: picked.name,
        phone: picked.phone,
        relationship: relationship,
        isPrimary: _contacts.isEmpty,
        isVerified: true,
      );
      _contacts = [..._contacts, newContact];
      _addSafetyEvent(
        'Trusted Contact Added',
        '${picked.name} ($relationship) added from device address book.',
        EventSeverity.info,
      );
      notifyListeners();
      return newContact;
    }
    return null;
  }

  void completeOnboarding() {
    _screenStack
      ..clear()
      ..add(SafeLoopScreen.setup);
    _currentScreen = SafeLoopScreen.setup;
    notifyListeners();
  }

  void completeSecuritySetup(
    String name,
    String phone,
    String safetyPin, [
    String duressPin = '9999',
    List<TrustedContact>? initialContacts,
  ]) {
    _userProfile = _userProfile.copyWith(
      name: name.trim().isNotEmpty ? name.trim() : _userProfile.name,
      phone: phone.trim().isNotEmpty ? phone.trim() : _userProfile.phone,
      safetyPin: safetyPin.trim().isNotEmpty ? safetyPin.trim() : _userProfile.safetyPin,
      duressPin: duressPin.trim().isNotEmpty ? duressPin.trim() : _userProfile.duressPin,
      isSetupComplete: true,
    );
    if (initialContacts != null) {
      _contacts = initialContacts;
    }
    _addSafetyEvent(
      'Account Setup Complete',
      'Profile registered with ${_contacts.length} trusted emergency contact(s).',
      EventSeverity.success,
    );
    _screenStack
      ..clear()
      ..add(SafeLoopScreen.home);
    _currentScreen = SafeLoopScreen.home;
    notifyListeners();
    _saveSession();

    _apiService.updateCredentials(
      name: _userProfile.name,
      phone: _userProfile.phone,
      safetyPin: _userProfile.safetyPin,
      duressPin: _userProfile.duressPin,
    );

    // Register traveller on SheMoveBackend and sync contacts
    _apiService.registerTraveller(
      name: _userProfile.name,
      phone: _userProfile.phone,
      safetyPin: _userProfile.safetyPin,
      duressPin: _userProfile.duressPin,
    ).then((_) {
      _saveSession();
      if (initialContacts != null) {
        for (final c in initialContacts) {
          _apiService.createContact(c);
        }
      }
      _apiService.getContacts().then((serverContacts) {
        if (serverContacts.isNotEmpty) {
          _contacts = serverContacts;
          notifyListeners();
        }
      });
    }).catchError((err) {
      debugPrint('Error registering traveller on backend: $err');
    });
  }

  // Start Journey
  void startJourney({
    required String start,
    String? destination,
    String? dest,
    required TransportMode mode,
    required String vehicleNo,
    required int durationMinutes,
    required int intervalMinutes,
    bool geofence = false,
    List<String>? selectedContactIds,
    List<LatLngPoint>? waypoints,
  }) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final notifiedCount = selectedContactIds != null
        ? selectedContactIds.length
        : _contacts.length;

    double initialProgress = 0.0;
    if (waypoints != null && waypoints.length >= 2) {
      initialProgress = _computeGpsProgress(waypoints);
    }

    final targetDestination = destination ?? dest ?? 'Selected Destination';

    final newJourney = Journey(
      id: 'j_$now',
      startAddress: start.trim().isNotEmpty ? start.trim() : 'Saheed sukhdev college, GIRLS HOSTEL',
      destinationAddress:
          targetDestination.trim().isNotEmpty ? targetDestination.trim() : 'Pacific Mall NSP Pitampura',
      transportMode: mode,
      vehicleNumber: vehicleNo.trim(),
      estimatedMinutes: durationMinutes,
      startTimeMillis: now,
      progressPercent: initialProgress,
      status: JourneyStatus.active,
      checkInIntervalMinutes: intervalMinutes,
      geofenceEnabled: geofence,
      contactsNotifiedCount: notifiedCount,
      waypoints: waypoints ?? const [],
    );

    _activeJourney = newJourney;
    _checkInSecondsRemaining = intervalMinutes * 60;
    _isCovertDistressActive = false;

    _contacts = _contacts.map((c) {
      final isSelected = selectedContactIds == null || selectedContactIds.contains(c.id);
      return c.copyWith(
        notificationStatus: isSelected
            ? ContactNotificationStatus.sent
            : ContactNotificationStatus.idle,
      );
    }).toList();

    _addSafetyEvent(
      'Protected Journey Started',
      'Mode: ${mode.label}${vehicleNo.isNotEmpty ? " ($vehicleNo)" : ""}. Route monitoring active. $notifiedCount guardian(s) alerted.',
      EventSeverity.info,
      start,
    );

    _startJourneySimulation();
    _startHeartbeatTimer();
    _screenStack
      ..clear()
      ..add(SafeLoopScreen.home)
      ..add(SafeLoopScreen.activeJourney);
    _currentScreen = SafeLoopScreen.activeJourney;
    notifyListeners();

    // Create real trip on backend for live telemetry and public tracking share link
    _createBackendJourney(
      startAddress: newJourney.startAddress,
      destinationAddress: newJourney.destinationAddress,
      mode: mode,
      vehicleNo: vehicleNo.trim(),
      durationMinutes: durationMinutes,
      intervalMinutes: intervalMinutes,
      contactIds: selectedContactIds,
      waypoints: waypoints,
    );
  }

  Future<void> _createBackendJourney({
    required String startAddress,
    required String destinationAddress,
    required TransportMode mode,
    required String vehicleNo,
    required int durationMinutes,
    required int intervalMinutes,
    List<String>? contactIds,
    List<LatLngPoint>? waypoints,
  }) async {
    try {
      final startCoord = (waypoints != null && waypoints.isNotEmpty)
          ? waypoints.first
          : _currentLocation;
      final destCoord = (waypoints != null && waypoints.length >= 2)
          ? waypoints.last
          : const LatLngPoint(latitude: 28.6989, longitude: 77.1517);

      final result = await _apiService.startJourney(
        startAddress: startAddress,
        destinationAddress: destinationAddress,
        mode: mode,
        vehicleNumber: vehicleNo,
        estimatedMinutes: durationMinutes,
        checkinIntervalMinutes: intervalMinutes,
        startLat: startCoord.latitude,
        startLng: startCoord.longitude,
        destLat: destCoord.latitude,
        destLng: destCoord.longitude,
        contactIds: contactIds,
        waypoints: waypoints,
        speedKmh: _currentSpeedKmh,
        heading: _currentHeading,
      );

      if (result != null && result['trip'] is Map<String, dynamic>) {
        final tripData = result['trip'] as Map<String, dynamic>;
        final tripId = tripData['id'] as String?;
        final token = tripData['share_token'] as String?;
        if (tripId != null && _activeJourney != null) {
          _activeJourney = _activeJourney!.copyWith(
            id: tripId,
            shareToken: token,
          );
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error syncing journey to backend: $e');
    }
  }

  void _startHeartbeatTimer() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (_activeJourney == null || _activeJourney!.status != JourneyStatus.active) {
        _heartbeatTimer?.cancel();
        return;
      }
      _apiService.sendHeartbeat(
        _activeJourney!.id,
        lat: _currentLocation.latitude,
        lng: _currentLocation.longitude,
        speedKmh: _currentSpeedKmh,
        heading: _currentHeading,
        batteryPct: 80,
      );
    });
  }

  void _startJourneySimulation() {
    _journeyTicker?.cancel();
    _journeyTicker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_activeJourney == null || _activeJourney!.status != JourneyStatus.active) {
        timer.cancel();
        return;
      }

      // Check-in timer countdown
      final remaining = _checkInSecondsRemaining - 1;
      if (remaining <= 0) {
        _checkInSecondsRemaining = 0;
        triggerCheckInDue();
        timer.cancel();
      } else {
        _checkInSecondsRemaining = remaining;
      }
      notifyListeners();
    });
  }

  /// Compute journey progress (0.0-1.0) by snapping current GPS position to nearest route segment.
  double _computeGpsProgress(List<LatLngPoint> waypoints) {
    if (waypoints.length < 2) return 0.05;

    final gpsLat = _currentLocation.latitude;
    final gpsLon = _currentLocation.longitude;

    // Compute cumulative distances along waypoint chain
    final cumulativeDistances = <double>[0.0];
    double totalDist = 0.0;
    for (int i = 1; i < waypoints.length; i++) {
      final dLat = waypoints[i].latitude - waypoints[i - 1].latitude;
      final dLon = waypoints[i].longitude - waypoints[i - 1].longitude;
      totalDist += _haversineApprox(dLat, dLon, waypoints[i - 1].latitude);
      cumulativeDistances.add(totalDist);
    }

    if (totalDist < 0.0001) return 0.05;

    // Find the nearest segment and project GPS onto it
    double bestDist = double.infinity;
    double bestProgress = 0.0;

    for (int i = 0; i < waypoints.length - 1; i++) {
      final ax = waypoints[i].latitude;
      final ay = waypoints[i].longitude;
      final bx = waypoints[i + 1].latitude;
      final by = waypoints[i + 1].longitude;

      // Project GPS point onto segment [A, B]
      final dx = bx - ax;
      final dy = by - ay;
      final segLenSq = dx * dx + dy * dy;
      double t = 0.0;
      if (segLenSq > 0) {
        t = ((gpsLat - ax) * dx + (gpsLon - ay) * dy) / segLenSq;
        t = t.clamp(0.0, 1.0);
      }

      final projLat = ax + t * dx;
      final projLon = ay + t * dy;
      final dist = _haversineApprox(gpsLat - projLat, gpsLon - projLon, gpsLat);

      if (dist < bestDist) {
        bestDist = dist;
        final segStart = cumulativeDistances[i];
        final segEnd = cumulativeDistances[i + 1];
        final segDist = segStart + t * (segEnd - segStart);
        bestProgress = segDist / totalDist;
      }
    }

    return bestProgress.clamp(0.01, 0.98);
  }

  /// Quick haversine-like distance approximation in degrees-to-km.
  double _haversineApprox(double dLat, double dLon, double refLat) {
    const kmPerDegLat = 111.32;
    final kmPerDegLon = 111.32 * (refLat * 3.14159265 / 180.0).abs().clamp(0.0, 1.5707) == 0
        ? 111.32
        : 111.32 * _cosApprox(refLat * 3.14159265 / 180.0);
    final dy = dLat * kmPerDegLat;
    final dx = dLon * kmPerDegLon;
    return (dy * dy + dx * dx); // Squared distance is fine for comparison
  }

  double _cosApprox(double rad) {
    // Simple cos approximation for latitude scaling
    final x = rad.abs();
    if (x > 1.5707) return 0.0;
    return 1.0 - x * x / 2.0 + x * x * x * x / 24.0;
  }

  void modifyJourneyDuration(int deltaMinutes) {
    if (_activeJourney == null) return;
    final current = _activeJourney!;
    final newMinutes = (current.estimatedMinutes + deltaMinutes).clamp(5, 360);
    _activeJourney = current.copyWith(estimatedMinutes: newMinutes);
    _addSafetyEvent(
      'Protection Window Adjusted',
      'Protection window adjusted by ${deltaMinutes >= 0 ? "+$deltaMinutes" : "$deltaMinutes"} min. Total: $newMinutes min.',
      EventSeverity.info,
    );
    notifyListeners();

    _apiService.extendJourney(
      current.id,
      deltaMinutes,
      pin: _userProfile.safetyPin,
    );
  }

  void triggerCheckInDue() {
    if (_activeJourney == null) return;
    _activeJourney = _activeJourney!.copyWith(status: JourneyStatus.checkInDue);
    _checkInWindowSecondsRemaining = 60; // 1-minute window to respond

    // Vibrate device with double-pulse check-in alert
    _vibrationService.vibrateCheckInAlert();

    _addSafetyEvent(
      'Safety Check-In Due',
      'Adaptive check-in prompt displayed. 60-second response window active before escalation.',
      EventSeverity.warning,
    );
    if (!_screenStack.contains(SafeLoopScreen.safetyCheckIn)) {
      _screenStack.add(SafeLoopScreen.safetyCheckIn);
    }
    _currentScreen = SafeLoopScreen.safetyCheckIn;

    // Notify backend monitor that checkin is due
    _apiService.triggerCheckinDue(_activeJourney!.id);

    // Start 1-minute check-in countdown ticker. If not answered within 60s, escalate!
    _checkInWindowTicker?.cancel();
    _checkInWindowTicker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_checkInWindowSecondsRemaining > 0) {
        _checkInWindowSecondsRemaining--;
        notifyListeners();
      } else {
        timer.cancel();
        if (_activeJourney?.status == JourneyStatus.checkInDue) {
          startEscalationWarning();
        }
      }
    });

    notifyListeners();
  }

  void handleCheckInSafetyConfirm(String enteredPin) {
    if (enteredPin == _userProfile.safetyPin) {
      confirmSafeFromCheckIn(verifiedWithDuress: false);
      _screenStack.remove(SafeLoopScreen.safetyCheckIn);
      _currentScreen = SafeLoopScreen.activeJourney;
    } else if (enteredPin == _userProfile.duressPin) {
      confirmSafeFromCheckIn(verifiedWithDuress: true);
      _screenStack.remove(SafeLoopScreen.safetyCheckIn);
      _currentScreen = SafeLoopScreen.activeJourney;
    }
    notifyListeners();
  }

  void confirmSafeFromCheckIn({bool verifiedWithDuress = false}) {
    _checkInWindowTicker?.cancel();
    _vibrationService.vibrateSafetyConfirmed();
    if (_activeJourney == null) return;

    final tripId = _activeJourney!.id;
    final pinUsed = verifiedWithDuress ? _userProfile.duressPin : _userProfile.safetyPin;

    if (verifiedWithDuress) {
      _isCovertDistressActive = true;
      _activeJourney = _activeJourney!.copyWith(status: JourneyStatus.covertDuress);
      _contacts = _contacts
          .map((c) => c.copyWith(notificationStatus: ContactNotificationStatus.delivered))
          .toList();

      _addSafetyEvent(
        'Covert Distress Alert Activated',
        'Duress PIN entered silently. Contacts notified with covert tracking link.',
        EventSeverity.critical,
      );
      _toastMessage = 'Safety confirmed'; // Pretend normal confirmation
    } else {
      _activeJourney = _activeJourney!.copyWith(status: JourneyStatus.active);
      _checkInSecondsRemaining = _activeJourney!.checkInIntervalMinutes * 60;

      _addSafetyEvent(
        'Safety Confirmed',
        'User authenticated successfully. Protection timer reset.',
        EventSeverity.success,
      );
      _toastMessage = 'Journey safety confirmed';
      _startJourneySimulation();
    }
    notifyListeners();

    // Send check-in response to backend (handles duress covert alert automatically)
    _apiService.respondCheckin(
      tripId,
      response: 'SAFE',
      pin: pinUsed,
    );
  }

  void handleCheckInNeedHelp() {
    _checkInWindowTicker?.cancel();
    triggerFullEmergency('User requested immediate help during safety check-in');
  }

  void startEscalationWarning() {
    if (_activeJourney == null) return;
    _activeJourney = _activeJourney!.copyWith(status: JourneyStatus.escalating);
    _escalationSecondsRemaining = 45;

    // Start repeating urgent vibration pulse alerting missed check-in
    _vibrationService.startEscalationAlertPulse();

    _addSafetyEvent(
      'Check-In Missed: Escalation Initiated',
      'Grace period timer active. Contacts will be notified if not cancelled.',
      EventSeverity.warning,
    );

    _escalationTicker?.cancel();
    _escalationTicker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_escalationSecondsRemaining > 0) {
        _escalationSecondsRemaining--;
        notifyListeners();
      } else {
        timer.cancel();
        if (_activeJourney?.status == JourneyStatus.escalating) {
          triggerFullEmergency('Missed check-in grace period expired');
        }
      }
    });

    _screenStack.remove(SafeLoopScreen.safetyCheckIn);
    if (!_screenStack.contains(SafeLoopScreen.escalationWarning)) {
      _screenStack.add(SafeLoopScreen.escalationWarning);
    }
    _currentScreen = SafeLoopScreen.escalationWarning;
    notifyListeners();
  }

  bool cancelEscalationWithPin(String pin) {
    if (pin == _userProfile.safetyPin) {
      _escalationTicker?.cancel();
      confirmSafeFromCheckIn(verifiedWithDuress: false);
      _screenStack.remove(SafeLoopScreen.escalationWarning);
      _currentScreen = SafeLoopScreen.activeJourney;
      notifyListeners();
      return true;
    } else if (pin == _userProfile.duressPin) {
      _escalationTicker?.cancel();
      confirmSafeFromCheckIn(verifiedWithDuress: true);
      _screenStack.remove(SafeLoopScreen.escalationWarning);
      _currentScreen = SafeLoopScreen.activeJourney;
      notifyListeners();
      return true;
    }
    return false;
  }

  void triggerEmergencyNow([String reason = 'Manual SOS Activated']) {
    triggerFullEmergency(reason);
  }

  void triggerFullEmergency([String reason = 'Manual SOS Activated']) async {
    _journeyTicker?.cancel();
    _escalationTicker?.cancel();
    _checkInWindowTicker?.cancel();
    _vibrationService.vibrateEmergencySos();

    // Acquire freshest live GPS coordinates at the exact moment of emergency
    try {
      final fresh = await _locationService.getCurrentLocation(requestIfDenied: true);
      if (fresh.isLive) {
        _currentLocation = fresh.point;
        _isLiveGpsActive = true;
      }
    } catch (e) {
      debugPrint('SafeLoopState: Error acquiring fresh GPS for SOS: $e');
    }

    final now = DateTime.now().millisecondsSinceEpoch;
    _activeJourney = (_activeJourney ??
            Journey(
              id: 'j_emergency_$now',
              startAddress: _currentLocation.address,
              destinationAddress: 'Emergency Services Response',
              transportMode: TransportMode.walking,
              startTimeMillis: now,
              status: JourneyStatus.emergency,
            ))
        .copyWith(status: JourneyStatus.emergency);

    _contacts = _contacts.asMap().entries.map((entry) {
      final idx = entry.key;
      final contact = entry.value;
      if (idx == 0) {
        return contact.copyWith(
          notificationStatus: ContactNotificationStatus.acknowledged,
          acknowledgedTimeAgo: 'Just now',
        );
      } else {
        return contact.copyWith(
          notificationStatus: ContactNotificationStatus.delivered,
        );
      }
    }).toList();

    _addSafetyEvent(
      'CRITICAL EMERGENCY ALERT',
      '$reason. Live GPS coordinates and audio telemetry broadcasted.',
      EventSeverity.critical,
      _currentLocation.address,
    );

    _screenStack.remove(SafeLoopScreen.safetyCheckIn);
    _screenStack.remove(SafeLoopScreen.escalationWarning);
    if (!_screenStack.contains(SafeLoopScreen.emergencyActive)) {
      _screenStack.add(SafeLoopScreen.emergencyActive);
    }
    _currentScreen = SafeLoopScreen.emergencyActive;
    notifyListeners();

    // Trigger critical SOS on backend with exact real GPS location
    if (_activeJourney != null) {
      _apiService.triggerSos(
        _activeJourney!.id,
        reason: reason,
        pin: _userProfile.safetyPin,
        lat: _currentLocation.latitude,
        lng: _currentLocation.longitude,
        accuracyM: 5.0,
        batteryPct: 85,
        address: _currentLocation.address,
      );
    }
  }

  bool disarmEmergency(String pinEntered) {
    final tripId = _activeJourney?.id;

    if (pinEntered == _userProfile.safetyPin) {
      _escalationTicker?.cancel();
      _vibrationService.vibrateSafetyConfirmed();
      _screenStack
        ..clear()
        ..add(SafeLoopScreen.home);
      _currentScreen = SafeLoopScreen.home;

      if (_activeJourney != null) {
        _activeJourney = _activeJourney!.copyWith(status: JourneyStatus.active);
        _checkInSecondsRemaining = _activeJourney!.checkInIntervalMinutes * 60;
        _startJourneySimulation();
      }

      _isCovertDistressActive = false;
      _addSafetyEvent(
        'Emergency Disarmed with PIN',
        'User authenticated with Security PIN. Journey returned to safe status.',
        EventSeverity.success,
      );
      _toastMessage = 'Emergency disarmed — Journey safe';
      notifyListeners();

      // Notify backend to disarm emergency and restore safe status on Police CAD
      if (tripId != null && tripId.isNotEmpty) {
        _apiService.disarmEmergency(tripId, pin: pinEntered);
      }
      return true;
    } else if (pinEntered == _userProfile.duressPin) {
      _toastMessage = 'Alert disarmed';
      _isCovertDistressActive = true;
      _addSafetyEvent(
        'Silent Distress Continued',
        'Duress PIN entered on emergency disarm screen.',
        EventSeverity.critical,
      );
      _screenStack
        ..clear()
        ..add(SafeLoopScreen.home);
      _currentScreen = SafeLoopScreen.home;
      notifyListeners();

      if (tripId != null && tripId.isNotEmpty) {
        _apiService.disarmEmergency(tripId, pin: pinEntered);
      }
      return true;
    }
    return false;
  }

  void completeActiveJourney() {
    _journeyTicker?.cancel();
    _heartbeatTimer?.cancel();
    _escalationTicker?.cancel();
    _checkInWindowTicker?.cancel();
    _vibrationService.stopVibration();
    if (_activeJourney == null) return;

    final tripId = _activeJourney!.id;
    final completed = _activeJourney!.copyWith(
      status: JourneyStatus.completed,
      progressPercent: 1.0,
    );

    _history = [completed, ..._history];
    _activeJourney = completed;
    _lastCompletedJourney = completed;

    _contacts = _contacts
        .map((c) => c.copyWith(
              notificationStatus: ContactNotificationStatus.acknowledged,
              acknowledgedTimeAgo: 'Safe arrival',
            ))
        .toList();

    _addSafetyEvent(
      'Destination Reached Safely',
      'Safe arrival confirmed at ${completed.destinationAddress}.',
      EventSeverity.success,
    );

    _screenStack
      ..clear()
      ..add(SafeLoopScreen.home)
      ..add(SafeLoopScreen.journeyCompleted);
    _currentScreen = SafeLoopScreen.journeyCompleted;
    notifyListeners();

    // Notify backend of journey completion and refresh server-verified history
    _apiService.completeJourney(tripId, confirmedSafe: true).then((_) {
      _apiService.getJourneys().then((trips) {
        if (trips.isNotEmpty) {
          _history = trips;
          notifyListeners();
        }
      });
      _apiService.getEvents().then((evts) {
        if (evts.isNotEmpty) {
          _events = evts;
          notifyListeners();
        }
      });
    }).catchError((err) {
      debugPrint('Error completing journey on backend: $err');
    });
  }

  void exitJourneyToHome() {
    _vibrationService.stopVibration();
    _activeJourney = null;
    _isCovertDistressActive = false;
    _contacts = _contacts
        .map((c) => c.copyWith(notificationStatus: ContactNotificationStatus.idle))
        .toList();
    _screenStack
      ..clear()
      ..add(SafeLoopScreen.home);
    _currentScreen = SafeLoopScreen.home;
    notifyListeners();
  }

  void addContact(String name, String phone, String relationship) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final newC = TrustedContact(
      id: 'c_$now',
      name: name,
      phone: phone,
      relationship: relationship,
      isPrimary: _contacts.isEmpty,
      isVerified: true,
    );
    _contacts = [..._contacts, newC];
    _addSafetyEvent(
      'Trusted Contact Added',
      '$name ($relationship) added.',
      EventSeverity.info,
    );
    notifyListeners();

    // Persist real contact on SheMoveBackend
    _apiService.createContact(newC).then((created) {
      if (created != null) {
        _contacts = _contacts.map((c) => c.id == newC.id ? created : c).toList();
        notifyListeners();
      }
    }).catchError((err) {
      debugPrint('Error creating contact on backend: $err');
    });
  }

  void removeContact(String id) {
    final removed = _contacts.where((c) => c.id == id).firstOrNull;
    _contacts = _contacts.where((c) => c.id != id).toList();
    if (_contacts.isNotEmpty && !_contacts.any((c) => c.isPrimary)) {
      _contacts[0] = _contacts[0].copyWith(isPrimary: true);
    }
    if (removed != null) {
      _addSafetyEvent(
        'Contact Removed',
        '${removed.name} removed from circle.',
        EventSeverity.info,
      );
    }
    notifyListeners();

    // Delete contact on SheMoveBackend
    _apiService.deleteContact(id).catchError((err) {
      debugPrint('Error deleting contact on backend: $err');
      return false;
    });
  }

  void setPrimaryContact(String id) {
    _contacts = _contacts.map((c) => c.copyWith(isPrimary: c.id == id)).toList();
    notifyListeners();
  }

  void updateProfile(UserProfile profile) {
    _userProfile = profile;
    _apiService.updateCredentials(
      name: profile.name,
      phone: profile.phone,
      safetyPin: profile.safetyPin,
      duressPin: profile.duressPin,
    );
    if (profile.geminiApiKey.isNotEmpty) {
      GeminiSafetyService.setApiKey(profile.geminiApiKey);
    }
    notifyListeners();
    _saveSession();
    SharedPreferences.getInstance().then((prefs) {
      prefs.setBool('shemove_explicit_dark_theme', profile.isDarkMode);
    }).catchError((_) {});

    _apiService.updateMe(profile.toJson()).catchError((err) {
      debugPrint('Error updating profile on backend: $err');
      return null;
    });
  }

  void updateBackendUrl(String newUrl) {
    _apiService.setBaseUrl(newUrl);
    syncWithBackend();
    _addSafetyEvent(
      'Backend URL Updated',
      'Active API endpoint updated to $newUrl',
      EventSeverity.info,
    );
    notifyListeners();
  }

  void toggleTheme() {
    final nextDark = !_userProfile.isDarkMode;
    _userProfile = _userProfile.copyWith(isDarkMode: nextDark);
    notifyListeners();
    SharedPreferences.getInstance().then((prefs) {
      prefs.setBool('shemove_explicit_dark_theme', nextDark);
    }).catchError((_) {});
  }

  void toggleOffline([bool? offline]) {
    final newOnline = offline != null ? !offline : !_isOnline;
    _isOnline = newOnline;
    if (!_isOnline) {
      _addSafetyEvent(
        'Network Offline',
        'Cellular data down. SheMove switched to encrypted SMS & offline mesh beacon.',
        EventSeverity.warning,
      );
    } else {
      _addSafetyEvent(
        'Network Reconnected',
        'Cloud telemetry re-synchronized.',
        EventSeverity.success,
      );
    }
    notifyListeners();
  }

  void clearToast() {
    _toastMessage = null;
    notifyListeners();
  }

  void showToast(String msg) {
    _toastMessage = msg;
    notifyListeners();
  }

  int _lastSimHeartbeatMillis = 0;

  /// Updates vehicle coordinates, speed, and heading during simulation mode
  /// and streams heartbeat telemetry to the backend so Police CAD and Guardians see live progress.
  void updateSimulatedLocation(
    double lat,
    double lng,
    double speedKmh,
    double heading, {
    double? progressPercent,
  }) {
    _currentLocation = LatLngPoint(
      latitude: lat,
      longitude: lng,
      address: _currentLocation.address,
    );
    _currentHeading = heading;
    _currentSpeedKmh = speedKmh;

    if (_activeJourney != null && progressPercent != null) {
      _activeJourney = _activeJourney!.copyWith(progressPercent: progressPercent);
    }
    notifyListeners();

    // Stream heartbeat to backend every ~2.5s during simulation
    final now = DateTime.now().millisecondsSinceEpoch;
    if (now - _lastSimHeartbeatMillis >= 2500) {
      _lastSimHeartbeatMillis = now;
      if (_activeJourney != null && _activeJourney!.status == JourneyStatus.active) {
        _apiService.sendHeartbeat(
          _activeJourney!.id,
          lat: lat,
          lng: lng,
          speedKmh: speedKmh,
          heading: heading,
          batteryPct: 80,
        );
      }
    }
  }

  void _addSafetyEvent(
    String title,
    String desc,
    EventSeverity severity, [
    String? location,
  ]) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final event = SafetyEvent(
      id: 'ev_$now',
      timestamp: now,
      title: title,
      description: desc,
      severity: severity,
      location: location ?? _currentLocation.address,
    );
    _events = [event, ..._events];
  }

  // Demo Scenarios Handler directly connected to the backend API
  void runDemoScenario(String scenarioId) {
    _showScenarioPicker = false;
    final activeTripId = _activeJourney?.id;

    switch (scenarioId) {
      case 'normal_journey':
        if (_activeJourney != null && _activeJourney!.status == JourneyStatus.active) {
          _apiService.simulateDemo('live', tripId: activeTripId);
          showToast('Live journey resumed with backend sync');
        } else {
          startJourney(
            start: 'Connaught Place, Radial 3',
            destination: 'Hauz Khas Village',
            mode: TransportMode.cab,
            vehicleNo: 'DL 1Y B 9904',
            durationMinutes: 25,
            intervalMinutes: 8,
            geofence: true,
          );
          showToast('Starting protected journey with backend sync');
        }
        break;

      case 'trigger_checkin':
        if (_activeJourney == null ||
            _activeJourney!.status == JourneyStatus.emergency ||
            _activeJourney!.status == JourneyStatus.completed) {
          startJourney(
            start: 'Cyber Hub Gate 1',
            destination: 'Golf Course Road',
            mode: TransportMode.auto,
            vehicleNo: 'HR 26 AZ 4512',
            durationMinutes: 15,
            intervalMinutes: 5,
            geofence: true,
          );
        }
        if (activeTripId != null) {
          _apiService.simulateDemo('trigger_checkin', tripId: activeTripId);
        }
        triggerCheckInDue();
        showToast('Safety check-in triggered on backend & device');
        break;

      case 'missed_checkin':
        if (_activeJourney == null ||
            _activeJourney!.status == JourneyStatus.emergency ||
            _activeJourney!.status == JourneyStatus.completed) {
          startJourney(
            start: 'Sector 18 Metro',
            destination: 'Botanical Garden',
            mode: TransportMode.walking,
            vehicleNo: '',
            durationMinutes: 20,
            intervalMinutes: 5,
            geofence: true,
          );
        }
        _apiService.simulateDemo('missed_checkin', tripId: _activeJourney?.id);
        startEscalationWarning();
        showToast('Simulating missed check-in alert on backend');
        break;

      case 'test_duress_pin':
        if (_activeJourney == null ||
            _activeJourney!.status == JourneyStatus.emergency ||
            _activeJourney!.status == JourneyStatus.completed) {
          startJourney(
            start: 'Aerocity Hospitality Dist',
            destination: 'Vasant Vihar',
            mode: TransportMode.cab,
            vehicleNo: 'DL 1Z 7721',
            durationMinutes: 18,
            intervalMinutes: 5,
            geofence: true,
          );
        }
        triggerCheckInDue();
        showToast('Duress test: Enter PIN 9999 to alert contacts silently');
        break;

      case 'critical_sos':
        _apiService.simulateDemo('sos', tripId: activeTripId);
        triggerFullEmergency('One-Touch SOS Emergency Button Held for 3s');
        showToast('Instant Emergency SOS dispatched to Police & Guardians');
        break;

      case 'safe_arrival':
        if (_activeJourney == null ||
            _activeJourney!.status == JourneyStatus.emergency ||
            _activeJourney!.status == JourneyStatus.completed) {
          startJourney(
            start: 'South Extension Part II',
            destination: 'Defence Colony',
            mode: TransportMode.cab,
            vehicleNo: 'DL 1T 5500',
            durationMinutes: 12,
            intervalMinutes: 5,
            geofence: true,
          );
        }
        _apiService.simulateDemo('complete_trip', tripId: _activeJourney?.id);
        completeActiveJourney();
        showToast('Safe arrival recorded on backend & notified guardians');
        break;

      case 'route_deviation':
        if (_activeJourney != null) {
          _apiService.simulateDemo('route_deviation', tripId: activeTripId);
          _addSafetyEvent(
            'Route Deviation Detected',
            'Vehicle deviated >500m from planned corridor. Police CAD alerted.',
            EventSeverity.warning,
          );
          showToast('Route deviation alert dispatched to backend');
        } else {
          showToast('Start an active journey first to simulate route deviation');
        }
        break;

      case 'kill_heartbeat':
        if (_activeJourney != null) {
          _apiService.simulateDemo('kill_heartbeat', tripId: activeTripId);
          _addSafetyEvent(
            'Heartbeat Signal Lost',
            'No telemetry received from device. Police CAD monitoring timeout.',
            EventSeverity.warning,
          );
          showToast('Phone unreachable simulated on backend');
        } else {
          showToast('Start an active journey first to simulate signal loss');
        }
        break;

      case 'toggle_offline':
        toggleOffline(!_isOnline);
        showToast(
          _isOnline
              ? 'Switched to offline encrypted SMS mode'
              : 'Reconnected to live cloud sync',
        );
        break;
    }
    notifyListeners();
  }

  @override
  void dispose() {
    _vibrationService.stopVibration();
    _journeyTicker?.cancel();
    _heartbeatTimer?.cancel();
    _escalationTicker?.cancel();
    _checkInWindowTicker?.cancel();
    _positionSubscription?.cancel();
    _compassSubscription?.cancel();
    super.dispose();
  }
}

typedef SheMoveState = SafeLoopState;
