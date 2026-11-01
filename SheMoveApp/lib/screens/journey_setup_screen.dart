import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import '../models/models.dart';
import '../services/gemini_service.dart';
import '../services/location_service.dart';
import '../services/routing_service.dart';
import '../theme/app_colors.dart';
import '../widgets/swipe_action_control.dart';

enum MapLayerStyle {
  streets,
  satellite,
}

enum MapPinMode {
  destination,
  start,
}

/// Real-time traffic estimation profile based on time-of-day rush hours
class TrafficEstimation {
  final double congestionMultiplier;
  final String statusLabel;
  final String description;
  final Color badgeColor;
  final IconData icon;

  const TrafficEstimation({
    required this.congestionMultiplier,
    required this.statusLabel,
    required this.description,
    required this.badgeColor,
    required this.icon,
  });
}

/// Dynamic travel duration calculation breakdown
class DynamicTimingPrediction {
  final int totalMinutes;
  final int baseTravelMinutes;
  final int trafficDelayMinutes;
  final double averageSpeedKmh;
  final String modeRationale;
  final TrafficEstimation traffic;

  const DynamicTimingPrediction({
    required this.totalMinutes,
    required this.baseTravelMinutes,
    required this.trafficDelayMinutes,
    required this.averageSpeedKmh,
    required this.modeRationale,
    required this.traffic,
  });
}

/// Dynamic adaptive check-in recommendation based on environmental risk and transit type
class DynamicCheckInRecommendation {
  final int recommendedIntervalMinutes;
  final String safetyTier;
  final String rationale;
  final String crowdContext;
  final Color tierColor;
  final IconData icon;

  const DynamicCheckInRecommendation({
    required this.recommendedIntervalMinutes,
    required this.safetyTier,
    required this.rationale,
    required this.crowdContext,
    required this.tierColor,
    required this.icon,
  });
}

/// Model for recent / saved journey destinations
class RecentDestinationItem {
  final String title;
  final String subtitle;
  final LatLng point;

  const RecentDestinationItem({
    required this.title,
    required this.subtitle,
    required this.point,
  });
}

class JourneySetupScreen extends StatefulWidget {
  final List<TrustedContact> contacts;
  final String initialStartLocation;
  final LatLngPoint? initialStartPoint;
  final VoidCallback onBack;
  final VoidCallback? onOpenContacts;
  final Function(
    String start,
    String dest,
    TransportMode mode,
    String vehicleNo,
    int durationMinutes,
    int intervalMinutes, [
    List<String>? selectedContactIds,
    List<LatLngPoint>? waypoints,
  ]) onStartJourney;

  const JourneySetupScreen({
    super.key,
    required this.contacts,
    this.initialStartLocation = 'Saheed sukhdev college, GIRLS HOSTEL, Shaheed Sukhdev College of Business Studies',
    this.initialStartPoint,
    required this.onBack,
    this.onOpenContacts,
    required this.onStartJourney,
  });

  @override
  State<JourneySetupScreen> createState() => _JourneySetupScreenState();
}

class _JourneySetupScreenState extends State<JourneySetupScreen> {
  final LocationService _locationService = LocationService();
  final RoutingService _routingService = RoutingService();
  final MapController _mapController = MapController();

  late TextEditingController _startController;
  late TextEditingController _destController;
  late TextEditingController _vehicleController;

  late Set<String> _selectedContactIds;

  // Real Geo Coordinates for Route
  late LatLng _startCoord;
  late LatLng _destCoord;

  // Route & Navigation State
  bool _hasSelectedDestination = false;
  RoadRouteResult? _roadRoute;
  MetroRouteResult? _metroRoute;

  TransportMode _selectedMode = TransportMode.cab;
  int _durationMinutes = 25;
  int _checkInInterval = 10;

  // Map state
  MapLayerStyle _mapLayerStyle = MapLayerStyle.streets;
  final MapPinMode _pinMode = MapPinMode.destination;
  bool _isLocatingUser = false;
  List<SearchLocationPreset> _dynamicSuggestions = [];
  GeminiCheckInPrediction? _geminiPrediction;
  Timer? _searchDebounceTimer;

  // UI State
  bool _isSearching = false;
  final Set<String> _favoritedTitles = {};
  double _sheetExtent = 0.68;
  bool _isSheetUp = true;

  // Exact 3 Recent Destinations for quick access
  static const List<RecentDestinationItem> _recentDestinations = [
    RecentDestinationItem(
      title: 'Pacific Mall NSP Pitampura',
      subtitle: 'Pitampura, New Delhi, Delhi, India',
      point: LatLng(28.6989, 77.1517),
    ),
    RecentDestinationItem(
      title: 'Vivekananda Institute of Professional Studies...',
      subtitle: 'Outer Ring Road, AU Block, Ranikhet, Pitampura, New ...',
      point: LatLng(28.7032, 77.1432),
    ),
    RecentDestinationItem(
      title: 'Metro Station-Rohini Sector 18',
      subtitle: 'Block E, Sector 18, Rohini, Delhi, India',
      point: LatLng(28.7360, 77.1350),
    ),
  ];

  @override
  void initState() {
    super.initState();
    const defaultSSCBS = 'Saheed sukhdev college, GIRLS HOSTEL, Shaheed Sukhdev College of Business Studies';
    final initialStart = widget.initialStartLocation.isNotEmpty &&
            widget.initialStartLocation != 'Connaught Place, Inner Circle' &&
            widget.initialStartLocation != 'MG Road, Sector 28, Gurugram'
        ? widget.initialStartLocation
        : (widget.initialStartPoint != null && widget.initialStartPoint!.address.isNotEmpty
            ? widget.initialStartPoint!.address
            : defaultSSCBS);

    _startController = TextEditingController(text: initialStart);
    _destController = TextEditingController(text: '');
    _vehicleController = TextEditingController(text: 'DL 1Y B 4821');
    _selectedContactIds = widget.contacts.map((c) => c.id).toSet();

    if (widget.initialStartPoint != null) {
      _startCoord = LatLng(
        widget.initialStartPoint!.latitude,
        widget.initialStartPoint!.longitude,
      );
    } else {
      // Shaheed Sukhdev College of Business Studies, Sector 16 Rohini
      _startCoord = const LatLng(28.7317, 77.1086);
    }

    _destCoord = const LatLng(28.6989, 77.1517); // Pacific Mall NSP default
    _hasSelectedDestination = false;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateGeminiPrediction();
    });
  }

  /// Predicts adaptive check-in interval and contextual risk analysis using Gemini AI.
  Future<void> _updateGeminiPrediction() async {
    final dist = _getEffectiveRouteDistanceKm();
    final mode = _selectedMode;
    final start = _startController.text;
    final dest = _destController.text;

    try {
      final prediction = await GeminiSafetyService.predictCheckIn(
        mode: mode,
        distanceKm: dist,
        startAddress: start,
        destinationAddress: dest,
      );
      if (mounted) {
        setState(() {
          _geminiPrediction = prediction;
          _checkInInterval = prediction.recommendedIntervalMinutes;
        });
      }
    } catch (_) {}
  }

  @override
  void didUpdateWidget(covariant JourneySetupScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.contacts != widget.contacts) {
      final validIds = widget.contacts.map((c) => c.id).toSet();
      _selectedContactIds = _selectedContactIds.intersection(validIds);
      if (_selectedContactIds.isEmpty && widget.contacts.isNotEmpty) {
        _selectedContactIds = validIds;
      }
    }
  }

  @override
  void dispose() {
    _searchDebounceTimer?.cancel();
    _startController.dispose();
    _destController.dispose();
    _vehicleController.dispose();
    super.dispose();
  }

  /// Checks whether a transport mode is logically viable for the given route distance
  bool _isModeViable(TransportMode mode, double distanceKm) {
    switch (mode) {
      case TransportMode.walking:
        return distanceKm <= 12.0;
      case TransportMode.auto:
        return distanceKm <= 45.0;
      case TransportMode.metro:
        return distanceKm <= 60.0 && (_metroRoute == null || _metroRoute!.isAvailable);
      case TransportMode.cab:
      case TransportMode.bus:
      case TransportMode.other:
        return true;
    }
  }

  List<TransportMode> _getViableModes(double distanceKm) {
    return TransportMode.values.where((m) => _isModeViable(m, distanceKm)).toList();
  }

  /// Generates the effective list of waypoints matching exactly what is rendered on the map.
  List<LatLngPoint> _getEffectiveRouteWaypoints() {
    final List<LatLng> points = [];
    if (_selectedMode == TransportMode.metro &&
        _metroRoute != null &&
        _metroRoute!.isAvailable) {
      points.add(_startCoord);
      if (_metroRoute!.originStation != null) {
        points.add(_metroRoute!.originStation!.latLng);
      }
      points.addAll(_metroRoute!.metroPath);
      if (_metroRoute!.destinationStation != null) {
        points.add(_metroRoute!.destinationStation!.latLng);
      }
      points.add(_destCoord);
    } else if (_roadRoute != null && _roadRoute!.polylinePoints.isNotEmpty) {
      points.addAll(_roadRoute!.polylinePoints);
    } else {
      points.add(_startCoord);
      points.add(_destCoord);
    }

    return points
        .map((p) => LatLngPoint(latitude: p.latitude, longitude: p.longitude))
        .toList();
  }

  /// Recalculates real road route or metro line with dynamic transit physics & traffic predictions
  Future<void> _calculateActiveRoute() async {
    if (!_hasSelectedDestination) return;

    if (_selectedMode == TransportMode.metro) {
      final metro = _routingService.checkMetroAvailability(
        start: _startCoord,
        destination: _destCoord,
      );

      setState(() {
        _metroRoute = metro;
        final dist = _getEffectiveRouteDistanceKm();
        final timing = _calculateDynamicTiming(distanceKm: dist, mode: TransportMode.metro);
        final checkIn = _calculateCheckInRecommendation(mode: TransportMode.metro, distanceKm: dist);
        if (metro.isAvailable) {
          _setSmartDuration(metro.totalEstimatedMinutes);
        } else {
          _setSmartDuration(timing.totalMinutes);
        }
        _checkInInterval = checkIn.recommendedIntervalMinutes;
      });
    } else {
      final road = await _routingService.calculateRoadRoute(
        start: _startCoord,
        destination: _destCoord,
        mode: _selectedMode,
      );

      if (mounted) {
        setState(() {
          _roadRoute = road;
          final dist = road.distanceKm;
          final timing = _calculateDynamicTiming(distanceKm: dist, mode: _selectedMode);
          final checkIn = _calculateCheckInRecommendation(mode: _selectedMode, distanceKm: dist);
          _setSmartDuration(timing.totalMinutes);
          _checkInInterval = checkIn.recommendedIntervalMinutes;
        });
      }
    }

    _updateGeminiPrediction();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fitMapBounds();
    });
  }

  /// Evaluates real-time diurnal traffic congestion multiplier for road vehicles
  TrafficEstimation _getTrafficEstimation() {
    final now = DateTime.now();
    final hour = now.hour;
    final minute = now.minute;
    final time = hour + (minute / 60.0);

    // Morning Peak Rush: 08:00 - 11:30 (+45% travel delay)
    if (time >= 8.0 && time < 11.5) {
      return const TrafficEstimation(
        congestionMultiplier: 1.45,
        statusLabel: 'Morning Peak (+45%)',
        description: 'Heavy arterial congestion & peak junction signal cycles',
        badgeColor: AppColors.warningAmber,
        icon: Icons.traffic_rounded,
      );
    }
    // Evening Peak Rush: 17:00 - 21:30 (+50% travel delay)
    if (time >= 17.0 && time < 21.5) {
      return const TrafficEstimation(
        congestionMultiplier: 1.50,
        statusLabel: 'Evening Peak (+50%)',
        description: 'Heavy commuter bottlenecks across primary corridors',
        badgeColor: Color(0xFFFF5252),
        icon: Icons.traffic_rounded,
      );
    }
    // Midday Steady: 11:30 - 17:00 (+20% travel delay)
    if (time >= 11.5 && time < 17.0) {
      return const TrafficEstimation(
        congestionMultiplier: 1.20,
        statusLabel: 'Daytime Flow (+20%)',
        description: 'Moderate steady flow with active intersection lights',
        badgeColor: AppColors.safeGreen,
        icon: Icons.speed_rounded,
      );
    }
    // Early Morning: 05:30 - 08:00 (+8% travel delay)
    if (time >= 5.5 && time < 8.0) {
      return const TrafficEstimation(
        congestionMultiplier: 1.08,
        statusLabel: 'Early Morning (+8%)',
        description: 'Smooth flow with clear arterial transit routes',
        badgeColor: AppColors.safeGreen,
        icon: Icons.check_circle_outline_rounded,
      );
    }
    // Night Free-Flow: 21:30 - 05:30 (0% delay)
    return const TrafficEstimation(
      congestionMultiplier: 1.00,
      statusLabel: 'Night Free-Flow (0%)',
      description: 'Clear arterial roads and fast signal progression',
      badgeColor: AppColors.primaryCobalt,
      icon: Icons.nightlight_round,
    );
  }

  /// Calculates dynamic travel duration based on transport mode physics and real-time traffic
  DynamicTimingPrediction _calculateDynamicTiming({
    required double distanceKm,
    required TransportMode mode,
  }) {
    final traffic = _getTrafficEstimation();

    switch (mode) {
      case TransportMode.walking:
        const walkingSpeed = 4.6;
        final totalMins = math.max(5, ((distanceKm / walkingSpeed) * 60).round());
        return DynamicTimingPrediction(
          totalMinutes: totalMins,
          baseTravelMinutes: totalMins,
          trafficDelayMinutes: 0,
          averageSpeedKmh: walkingSpeed,
          modeRationale: 'Pedestrian walk • ~4.6 km/h steady pedestrian pace',
          traffic: const TrafficEstimation(
            congestionMultiplier: 1.0,
            statusLabel: 'Pedestrian Corridor',
            description: 'Foot transit unaffected by vehicular traffic',
            badgeColor: AppColors.safeGreen,
            icon: Icons.directions_walk_rounded,
          ),
        );

      case TransportMode.auto:
        final baseSpeed = distanceKm > 20 ? 32.0 : 25.0;
        final effectiveSpeed = baseSpeed / traffic.congestionMultiplier;
        final baseMins = ((distanceKm / baseSpeed) * 60).round() + 3;
        final totalMins = math.max(8, ((distanceKm / effectiveSpeed) * 60).round() + 3);
        final delay = math.max(0, totalMins - baseMins);

        return DynamicTimingPrediction(
          totalMinutes: totalMins,
          baseTravelMinutes: baseMins,
          trafficDelayMinutes: delay,
          averageSpeedKmh: effectiveSpeed,
          modeRationale: 'Auto Rickshaw agile navigation through arterial lanes',
          traffic: traffic,
        );

      case TransportMode.cab:
        final baseSpeed = distanceKm > 30 ? 48.0 : 32.0;
        final effectiveSpeed = baseSpeed / traffic.congestionMultiplier;
        final baseMins = ((distanceKm / baseSpeed) * 60).round() + 4;
        final totalMins = math.max(10, ((distanceKm / effectiveSpeed) * 60).round() + 4);
        final delay = math.max(0, totalMins - baseMins);

        return DynamicTimingPrediction(
          totalMinutes: totalMins,
          baseTravelMinutes: baseMins,
          trafficDelayMinutes: delay,
          averageSpeedKmh: effectiveSpeed,
          modeRationale: 'Private four-wheeler / cab with highway acceleration',
          traffic: traffic,
        );

      case TransportMode.bus:
        final baseSpeed = distanceKm > 40 ? 50.0 : 18.0;
        final dwellFactor = distanceKm > 40 ? 1.08 : 1.25;
        final bufferMins = distanceKm > 40 ? 15 : 8;

        final effectiveSpeed = (baseSpeed / traffic.congestionMultiplier) / dwellFactor;
        final baseMins = ((distanceKm / baseSpeed) * 60 * dwellFactor).round() + bufferMins;
        final totalMins = math.max(12, ((distanceKm / effectiveSpeed) * 60).round() + bufferMins);
        final delay = math.max(0, totalMins - baseMins);

        return DynamicTimingPrediction(
          totalMinutes: totalMins,
          baseTravelMinutes: baseMins,
          trafficDelayMinutes: delay,
          averageSpeedKmh: effectiveSpeed,
          modeRationale: distanceKm > 40 ? 'Intercity state transit coach' : 'City public bus with scheduled stop dwelling',
          traffic: traffic,
        );

      case TransportMode.metro:
        int totalMins;
        if (_metroRoute != null && _metroRoute!.isAvailable) {
          totalMins = _metroRoute!.totalEstimatedMinutes;
        } else {
          totalMins = ((distanceKm / 34.0) * 60).round() + 6;
        }
        totalMins = math.max(10, totalMins);

        return DynamicTimingPrediction(
          totalMinutes: totalMins,
          baseTravelMinutes: totalMins,
          trafficDelayMinutes: 0,
          averageSpeedKmh: 34.0,
          modeRationale: 'Grade-separated rapid rail • 100% immune to road traffic jams',
          traffic: const TrafficEstimation(
            congestionMultiplier: 1.0,
            statusLabel: 'Dedicated Rail Line',
            description: 'Grade-separated line unaffected by surface street gridlock',
            badgeColor: AppColors.primaryCobalt,
            icon: Icons.subway_rounded,
          ),
        );

      case TransportMode.other:
        return DynamicTimingPrediction(
          totalMinutes: 25,
          baseTravelMinutes: 25,
          trafficDelayMinutes: 0,
          averageSpeedKmh: 30.0,
          modeRationale: 'General transit mode',
          traffic: traffic,
        );
    }
  }

  /// Context-aware check-in recommendation based on Time of Day & Route Risk/Silence
  DynamicCheckInRecommendation _calculateCheckInRecommendation({
    required TransportMode mode,
    required double distanceKm,
  }) {
    final now = DateTime.now();
    final hour = now.hour;
    final isNight = hour >= 21 || hour < 5;
    final isEvening = hour >= 18 && hour < 21;

    if (mode == TransportMode.walking) {
      return DynamicCheckInRecommendation(
        recommendedIntervalMinutes: 5,
        safetyTier: 'High Alert',
        rationale: isNight
            ? 'Night Pedestrian Route: Maximum vigilance active for unlit/silent streets'
            : (isEvening
                ? 'Dusk Walking Route: 5 min check-ins armed for foot transit'
                : 'Pedestrian Street Route: Silent footpaths require frequent 5 min check-ins'),
        crowdContext: 'Silent / Pedestrian Exposure',
        tierColor: AppColors.warningAmber,
        icon: Icons.directions_walk_rounded,
      );
    }

    if (mode == TransportMode.metro) {
      return const DynamicCheckInRecommendation(
        recommendedIntervalMinutes: 20,
        safetyTier: 'Relaxed',
        rationale: 'Secure Metro Transit: CISF protection & dense crowds allow relaxed check-ins',
        crowdContext: 'Crowded Metro Transit',
        tierColor: AppColors.primaryCobalt,
        icon: Icons.subway_rounded,
      );
    }

    if (distanceKm > 45) {
      return DynamicCheckInRecommendation(
        recommendedIntervalMinutes: isNight ? 5 : 10,
        safetyTier: isNight ? 'High Alert' : 'Balanced',
        rationale: isNight
            ? 'Silent Highway Corridor at Night: 5 min high-alert pings active'
            : 'Intercity Highway Corridor: Balanced 10 min pings for long-distance transit',
        crowdContext: isNight ? 'Silent Intercity Highway' : 'Intercity Arterial',
        tierColor: isNight ? AppColors.warningAmber : AppColors.safeGreen,
        icon: Icons.alt_route_rounded,
      );
    }

    if (isNight) {
      return const DynamicCheckInRecommendation(
        recommendedIntervalMinutes: 5,
        safetyTier: 'High Alert',
        rationale: 'Night Solo Ride: High-alert 5 min pings active for driver accountability',
        crowdContext: 'Private Vehicle (Night Isolation)',
        tierColor: AppColors.warningAmber,
        icon: Icons.nightlight_round,
      );
    }

    return const DynamicCheckInRecommendation(
      recommendedIntervalMinutes: 10,
      safetyTier: 'Balanced',
      rationale: 'Daylight Urban Commute: Balanced 10 min check-in intervals in active traffic',
      crowdContext: 'Crowded City Arterial',
      tierColor: AppColors.safeGreen,
      icon: Icons.wb_sunny_rounded,
    );
  }

  void _setSmartDuration(int minutes) {
    _durationMinutes = minutes.clamp(5, 1440);
  }

  double _getEffectiveRouteDistanceKm() {
    if (_selectedMode == TransportMode.metro && _metroRoute != null && _metroRoute!.isAvailable) {
      return _metroRoute!.totalKm;
    }
    if (_roadRoute != null) {
      return _roadRoute!.distanceKm;
    }
    const distanceCalc = Distance();
    return distanceCalc.as(LengthUnit.Kilometer, _startCoord, _destCoord) * 1.25;
  }

  String _formatExpectedArrival() {
    final now = DateTime.now();
    final arrival = now.add(Duration(minutes: _durationMinutes));
    final hour = arrival.hour == 0 ? 12 : (arrival.hour > 12 ? arrival.hour - 12 : arrival.hour);
    final minute = arrival.minute.toString().padLeft(2, '0');
    final ampm = arrival.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $ampm';
  }

  String _formatDurationDisplay(int totalMinutes) {
    final hours = totalMinutes ~/ 60;
    final mins = totalMinutes % 60;
    if (hours == 0) return '$mins mins';
    if (mins == 0) return '$hours hrs';
    return '${hours}h ${mins}m';
  }

  /// Use device GPS to fetch real-time location and set as Start location
  Future<void> _fetchAndUseCurrentGps() async {
    setState(() => _isLocatingUser = true);
    try {
      final result = await _locationService.getCurrentLocation(requestIfDenied: true);
      if (mounted) {
        setState(() {
          _isLocatingUser = false;
          _startCoord = LatLng(result.point.latitude, result.point.longitude);
          _startController.text = result.point.address;
        });
        if (_hasSelectedDestination) {
          _calculateActiveRoute();
        } else {
          _mapController.move(_startCoord, 16.0);
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Starting location updated: ${result.point.address}'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: AppColors.safeGreen,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLocatingUser = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('GPS lookup failed: $e'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: AppColors.emergencyRed,
          ),
        );
      }
    }
  }

  /// User taps on map to set Start or Destination pin
  Future<void> _handleMapTap(LatLng tapped) async {
    setState(() {
      if (_pinMode == MapPinMode.destination) {
        _destCoord = tapped;
        _hasSelectedDestination = true;
        _isSheetUp = true;
        _sheetExtent = 0.70;
      } else {
        _startCoord = tapped;
      }
    });

    _calculateActiveRoute();

    final address = await _locationService.reverseGeocode(tapped.latitude, tapped.longitude);

    if (mounted) {
      setState(() {
        if (_pinMode == MapPinMode.destination) {
          _destController.text = address;
        } else {
          _startController.text = address;
        }
      });
    }
  }

  void _fitMapBounds() {
    try {
      final points = <LatLng>[_startCoord, _destCoord];
      if (_selectedMode == TransportMode.metro && _metroRoute != null && _metroRoute!.isAvailable) {
        points.addAll(_metroRoute!.metroPath);
      } else if (_roadRoute != null && _roadRoute!.polylinePoints.isNotEmpty) {
        points.addAll(_roadRoute!.polylinePoints);
      }
      final bounds = LatLngBounds.fromPoints(points);
      _mapController.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.only(top: 80, bottom: 320, left: 40, right: 40),
          maxZoom: 16.5,
        ),
      );
    } catch (e) {
      try {
        _mapController.move(_destCoord, 14.5);
      } catch (_) {}
    }
  }

  /// Dynamic Autocomplete based on what the user types
  Future<void> _onDestinationTextChanged(String query) async {
    _searchDebounceTimer?.cancel();
    final clean = query.trim().toLowerCase();
    if (clean.isEmpty) {
      setState(() => _dynamicSuggestions = const []);
      return;
    }

    final catalogMatches = _routingService.filterSearchCatalog(clean);
    setState(() => _dynamicSuggestions = catalogMatches);

    if (clean.length >= 3 && catalogMatches.length < 3) {
      _searchDebounceTimer = Timer(const Duration(milliseconds: 250), () async {
        try {
          final geocoded = await _locationService.locationFromAddress(query);
          if (geocoded.isNotEmpty && mounted) {
            final additional = geocoded.take(2).map((loc) {
              return SearchLocationPreset(
                title: query,
                subtitle: '${loc.latitude.toStringAsFixed(3)}°N, ${loc.longitude.toStringAsFixed(3)}°E',
                latitude: loc.latitude,
                longitude: loc.longitude,
                icon: Icons.travel_explore_rounded,
              );
            }).toList();

            setState(() {
              _dynamicSuggestions = [...catalogMatches, ...additional];
            });
          }
        } catch (_) {}
      });
    }
  }

  void _selectDestinationSuggestion(SearchLocationPreset preset) {
    _searchDebounceTimer?.cancel();
    final dest = LatLng(preset.latitude, preset.longitude);

    setState(() {
      _destCoord = dest;
      _destController.text = preset.title;
      _hasSelectedDestination = true;
      _isSheetUp = true;
      _sheetExtent = 0.70;
      _dynamicSuggestions = const [];
      _isSearching = false;
    });

    _calculateActiveRoute();
    FocusScope.of(context).unfocus();
  }

  void _selectRecentDestination(RecentDestinationItem item) {
    setState(() {
      _destCoord = item.point;
      _destController.text = item.title;
      _hasSelectedDestination = true;
      _isSheetUp = true;
      _sheetExtent = 0.70;
      _isSearching = false;
    });

    _calculateActiveRoute();
  }

  // =========================================================================
  // BUILD METHOD
  // =========================================================================

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveDistanceKm = _getEffectiveRouteDistanceKm();

    return Scaffold(
      backgroundColor: isDark ? AppColors.midnightDarkBackground : Colors.white,
      body: Stack(
        children: [
          // 1. Full-Screen Interactive Map
          Positioned.fill(
            child: _buildMapLayer(isDark),
          ),

          // 2. Floating Top Header Controls (Back Button, Contacts, Layer Toggle, GPS)
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 16,
            right: 16,
            child: _buildTopControlBar(isDark),
          ),

          // 3. Floating Pickup Address Pill (Visible on Map ONLY when bottom sheet is UP)
          if (_isSheetUp && !_hasSelectedDestination && !_isSearching)
            Positioned(
              left: 16,
              right: 16,
              bottom: (MediaQuery.of(context).size.height * _sheetExtent) + 14,
              child: _buildFloatingPickupPill(isDark),
            ),

          // 4. SheMove Journey Bottom Sheet (Home or Ride Setup)
          if (!_isSearching)
            NotificationListener<DraggableScrollableNotification>(
              onNotification: (notification) {
                final isUp = notification.extent > 0.48;
                if (isUp != _isSheetUp || (_sheetExtent - notification.extent).abs() > 0.03) {
                  setState(() {
                    _isSheetUp = isUp;
                    _sheetExtent = notification.extent;
                  });
                }
                return true;
              },
              child: DraggableScrollableSheet(
                key: ValueKey(_hasSelectedDestination ? 'ride_setup_sheet' : 'home_sheet'),
                initialChildSize: _hasSelectedDestination ? 0.70 : 0.68,
                minChildSize: _hasSelectedDestination ? 0.30 : 0.28,
                maxChildSize: 0.92,
                snap: true,
                snapSizes: _hasSelectedDestination ? const [0.30, 0.70, 0.92] : const [0.28, 0.68, 0.92],
                builder: (context, scrollController) {
                  return Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.midnightDarkSurface : Colors.white,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.12),
                          blurRadius: 18,
                          offset: const Offset(0, -4),
                        ),
                      ],
                    ),
                    child: _hasSelectedDestination
                        ? _buildRideSetupContent(isDark, effectiveDistanceKm, scrollController)
                        : _buildHomeSheetContent(isDark, scrollController),
                  );
                },
              ),
            ),

          // 5. Search Overlay (Triggered by Search Bar)
          if (_isSearching)
            Positioned.fill(
              child: _buildSearchOverlay(isDark),
            ),
        ],
      ),
    );
  }

  // =========================================================================
  // MAP COMPONENT & PIN MARKERS
  // =========================================================================

  Widget _buildMapLayer(bool isDark) {
    final isMetroMode = _selectedMode == TransportMode.metro;
    final hasMetroLine = isMetroMode && _metroRoute != null && _metroRoute!.isAvailable;

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: _startCoord,
        initialZoom: 15.5,
        minZoom: 3.0,
        maxZoom: 19.0,
        onTap: (tapPosition, latLng) => _handleMapTap(latLng),
      ),
      children: [
        // Tile Layer
        TileLayer(
          urlTemplate: _mapLayerStyle == MapLayerStyle.satellite
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg'
              : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.shemove.app',
          maxZoom: 19,
        ),

        if (_mapLayerStyle == MapLayerStyle.satellite)
          TileLayer(
            urlTemplate:
                'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}.png',
            userAgentPackageName: 'com.shemove.app',
            maxZoom: 19,
          ),

        // Route Polyline / Metro Track
        if (_hasSelectedDestination) ...[
          if (hasMetroLine) ...[
            PolylineLayer(
              polylines: [
                Polyline(
                  points: _metroRoute!.metroPath,
                  color: Colors.black.withValues(alpha: 0.6),
                  strokeWidth: 8.0,
                  strokeCap: StrokeCap.round,
                ),
                Polyline(
                  points: _metroRoute!.metroPath,
                  color: _metroRoute!.primaryLineColor,
                  strokeWidth: 5.5,
                  strokeCap: StrokeCap.round,
                ),
                Polyline(
                  points: [_startCoord, _metroRoute!.originStation!.latLng],
                  color: AppColors.infoBlue,
                  strokeWidth: 3.0,
                  pattern: StrokePattern.dashed(segments: const [6, 4]),
                ),
                Polyline(
                  points: [_metroRoute!.destinationStation!.latLng, _destCoord],
                  color: AppColors.safeGreen,
                  strokeWidth: 3.0,
                  pattern: StrokePattern.dashed(segments: const [6, 4]),
                ),
              ],
            ),
          ] else ...[
            // Road Polyline
            PolylineLayer(
              polylines: [
                Polyline(
                  points: _roadRoute?.polylinePoints ?? [_startCoord, _destCoord],
                  color: const Color(0xFF1976D2),
                  strokeWidth: 5.0,
                  strokeCap: StrokeCap.round,
                ),
              ],
            ),
          ],
        ],

        // Marker Layer
        MarkerLayer(
          markers: [
            // 1. Pickup Point Marker (Shows "Pickup Point" when bottom sheet is DOWNED, exact address when UP)
            Marker(
              point: _startCoord,
              width: _isSheetUp ? 260 : 140,
              height: 70,
              alignment: Alignment.bottomCenter,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 240),
                    transitionBuilder: (child, animation) => FadeTransition(
                      opacity: animation,
                      child: ScaleTransition(scale: animation, child: child),
                    ),
                    child: !_isSheetUp
                        ? Column(
                            key: const ValueKey('pickup_badge_downed'),
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Green Pill Badge: "Pickup Point" (Shown when sheet is DOWNED)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF00875A),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.25),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Text(
                                  'Pickup Point',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12,
                                    letterSpacing: 0.2,
                                  ),
                                ),
                              ),
                              CustomPaint(
                                size: const Size(10, 5),
                                painter: _TrianglePointerPainter(color: const Color(0xFF00875A)),
                              ),
                            ],
                          )
                        : Column(
                            key: const ValueKey('exact_address_badge_up'),
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Exact Address Bubble (Shown when sheet is UP)
                              Container(
                                constraints: const BoxConstraints(maxWidth: 250),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isDark ? AppColors.midnightDarkSurface : Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isDark ? Colors.white24 : const Color(0xFFE2E8F0),
                                    width: 1.2,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.18),
                                      blurRadius: 10,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(color: const Color(0xFF00875A), width: 2),
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Flexible(
                                      child: Text(
                                        _startController.text,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 11.5,
                                          color: isDark ? Colors.white : const Color(0xFF1E2022),
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              CustomPaint(
                                size: const Size(10, 5),
                                painter: _TrianglePointerPainter(
                                  color: isDark ? AppColors.midnightDarkSurface : Colors.white,
                                ),
                              ),
                            ],
                          ),
                  ),
                  const SizedBox(height: 2),
                  // Concentric Blue Dot Marker
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF1976D2).withValues(alpha: 0.25),
                    ),
                    child: Center(
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF1976D2),
                          border: Border.all(color: Colors.white, width: 2.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.3),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Container(
                            width: 5,
                            height: 5,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFF0D47A1),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. Destination Marker (when selected)
            if (_hasSelectedDestination)
              Marker(
                point: _destCoord,
                width: 44,
                height: 50,
                alignment: Alignment.bottomCenter,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD32F2F),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.3),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.location_on_rounded, color: Colors.white, size: 18),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ],
    );
  }

  // =========================================================================
  // TOP CONTROLS & FLOATING PICKUP PILL
  // =========================================================================

  Widget _buildTopControlBar(bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Circular White Back Button
        _buildCircleButton(
          icon: Icons.arrow_back,
          isDark: isDark,
          onTap: () {
            if (_hasSelectedDestination) {
              setState(() {
                _hasSelectedDestination = false;
                _isSheetUp = true;
                _sheetExtent = 0.68;
              });
            } else {
              widget.onBack();
            }
          },
        ),

        // Right Action Group (Layer Toggle & GPS Recenter & Contacts)
        Row(
          children: [
            if (widget.onOpenContacts != null) ...[
              _buildCircleButton(
                icon: Icons.people_alt_outlined,
                isDark: isDark,
                iconColor: AppColors.primaryCobalt,
                onTap: () => widget.onOpenContacts?.call(),
              ),
              const SizedBox(width: 8),
            ],
            _buildCircleButton(
              icon: _mapLayerStyle == MapLayerStyle.satellite
                  ? Icons.map_rounded
                  : Icons.satellite_alt_rounded,
              isDark: isDark,
              onTap: () {
                setState(() {
                  _mapLayerStyle = _mapLayerStyle == MapLayerStyle.satellite
                      ? MapLayerStyle.streets
                      : MapLayerStyle.satellite;
                });
              },
            ),
            const SizedBox(width: 8),
            _buildCircleButton(
              icon: _isLocatingUser ? Icons.hourglass_top : Icons.my_location,
              isDark: isDark,
              iconColor: const Color(0xFF00875A),
              onTap: _fetchAndUseCurrentGps,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    required bool isDark,
    required VoidCallback onTap,
    Color? iconColor,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: isDark ? AppColors.midnightDarkSurface : Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.14),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(
            icon,
            size: 20,
            color: iconColor ?? (isDark ? Colors.white : const Color(0xFF1E2022)),
          ),
        ),
      ),
    );
  }

  /// Floating Pickup Address Pill (Visible on Map above the Bottom Sheet)
  Widget _buildFloatingPickupPill(bool isDark) {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 380),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? AppColors.midnightDarkSurface : Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.12),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Green Ring Dot
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF00875A), width: 3),
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            // Pickup Address Text
            Flexible(
              child: Text(
                _startController.text,
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5,
                  color: isDark ? Colors.white : const Color(0xFF1E2022),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              color: isDark ? Colors.white60 : Colors.black45,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // SHEMOVE HOME BOTTOM SHEET CONTENT (FOCUSED ON PROTECTED TRAVEL)
  // =========================================================================

  Widget _buildHomeSheetContent(bool isDark, ScrollController scrollController) {
    return ListView(
      controller: scrollController,
      padding: EdgeInsets.zero,
      children: [
        // Drag Handle
        Center(
          child: Container(
            margin: const EdgeInsets.only(top: 10, bottom: 12),
            width: 40,
            height: 4.5,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.grey.shade300,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
        ),

        // "Where do you want to go?" Search Bar Pill
        GestureDetector(
          onTap: () => setState(() => _isSearching = true),
          child: Container(
            height: 52,
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.midnightDarkSurfaceVariant : Colors.white,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(
                color: isDark ? AppColors.midnightDarkCardBorder : const Color(0xFFE2E8F0),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFFFB800).withValues(alpha: 0.32),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: Colors.black87, size: 22),
                const SizedBox(width: 12),
                Text(
                  'Where do you want to go?',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : const Color(0xFF1E2022),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // 3 Recent Destinations matching user screenshot
        ..._recentDestinations.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          final isFavorited = _favoritedTitles.contains(item.title);

          return Column(
            children: [
              InkWell(
                onTap: () => _selectRecentDestination(item),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Row(
                    children: [
                      // Clock / History Icon
                      Icon(
                        Icons.history_rounded,
                        size: 22,
                        color: isDark ? Colors.white60 : const Color(0xFF6B7280),
                      ),
                      const SizedBox(width: 14),

                      // Title & Subtitle
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.white : const Color(0xFF1E2022),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              item.subtitle,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? AppColors.textSecondary : const Color(0xFF6B7280),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),

                      // Heart Bookmark Outline
                      IconButton(
                        icon: Icon(
                          isFavorited ? Icons.favorite : Icons.favorite_border_rounded,
                          size: 20,
                          color: isFavorited
                              ? const Color(0xFFE53935)
                              : (isDark ? Colors.white54 : const Color(0xFF757575)),
                        ),
                        onPressed: () {
                          setState(() {
                            if (isFavorited) {
                              _favoritedTitles.remove(item.title);
                            } else {
                              _favoritedTitles.add(item.title);
                            }
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
              if (index < _recentDestinations.length - 1)
                Divider(
                  height: 1,
                  indent: 52,
                  endIndent: 16,
                  color: isDark ? Colors.white12 : Colors.grey.shade200,
                ),
            ],
          );
        }),

        Divider(
          height: 1,
          indent: 52,
          endIndent: 16,
          color: isDark ? Colors.white12 : Colors.grey.shade200,
        ),

        // Choose Location on Map option
        InkWell(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Tap anywhere on the map above to place your destination pin'),
                behavior: SnackBarBehavior.floating,
                duration: Duration(seconds: 2),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                const Icon(
                  Icons.pin_drop_outlined,
                  size: 22,
                  color: Color(0xFF00875A),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Set destination on map',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : const Color(0xFF1E2022),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Tap directly on the interactive map to select destination',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.textSecondary : const Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: Colors.grey, size: 20),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Protected Transit Modes Section
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Protected Transit Modes',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF2C3E50),
            ),
          ),
        ),
        const SizedBox(height: 10),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              _buildTransitModeCard(
                mode: TransportMode.cab,
                label: 'Cab / Taxi',
                subtitle: 'Driver track',
                icon: Icons.local_taxi_rounded,
                color: AppColors.primaryCobalt,
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildTransitModeCard(
                mode: TransportMode.auto,
                label: 'Auto Rickshaw',
                subtitle: 'Live GPS guard',
                icon: Icons.electric_rickshaw_rounded,
                color: AppColors.warningAmber,
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildTransitModeCard(
                mode: TransportMode.metro,
                label: 'Metro Express',
                subtitle: 'CISF secure',
                icon: Icons.subway_rounded,
                color: const Color(0xFF00875A),
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildTransitModeCard(
                mode: TransportMode.walking,
                label: 'Walk Escort',
                subtitle: '5m check-ins',
                icon: Icons.directions_walk_rounded,
                color: const Color(0xFFFF5252),
                isDark: isDark,
              ),
            ],
          ),
        ),

        const SizedBox(height: 22),

        // SheMove Safety Shield Highlights
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'SheMove Journey Protection',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF2C3E50),
            ),
          ),
        ),
        const SizedBox(height: 10),

        SizedBox(
          height: 110,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            physics: const BouncingScrollPhysics(),
            children: [
              _buildSafetyFeatureCard(
                title: 'Live Route Tracking',
                description: 'Real-time GPS telemetry continuously shared with your designated guardians.',
                icon: Icons.navigation_rounded,
                accentColor: const Color(0xFF00875A),
                isDark: isDark,
              ),
              const SizedBox(width: 10),
              _buildSafetyFeatureCard(
                title: 'Adaptive Check-Ins',
                description: 'Discreet vibration prompts auto-escalate to emergency contacts if unanswered.',
                icon: Icons.access_time_rounded,
                accentColor: AppColors.primaryCobalt,
                isDark: isDark,
              ),
              const SizedBox(width: 10),
              _buildSafetyFeatureCard(
                title: 'Guardian SOS Telemetry',
                description: 'Real-time GPS breadcrumbs & arrival telemetry shared with your trusted circle.',
                icon: Icons.people_alt_rounded,
                accentColor: AppColors.warningAmber,
                isDark: isDark,
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildTransitModeCard({
    required TransportMode mode,
    required String label,
    required String subtitle,
    required IconData icon,
    required Color color,
    required bool isDark,
  }) {
    final isSelected = _selectedMode == mode;

    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedMode = mode;
            _isSearching = true;
          });
        },
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
          decoration: BoxDecoration(
            color: isSelected
                ? color.withValues(alpha: isDark ? 0.25 : 0.12)
                : (isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF7F8FA)),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? color : Colors.transparent,
              width: 1.5,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 24, color: isSelected ? color : (isDark ? Colors.white70 : Colors.black87)),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 9,
                  color: isDark ? AppColors.textSecondary : const Color(0xFF6B7280),
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSafetyFeatureCard({
    required String title,
    required String description,
    required IconData icon,
    required Color accentColor,
    required bool isDark,
  }) {
    return Container(
      width: 230,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF7F8FA),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.midnightDarkCardBorder : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.18),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 14, color: accentColor),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1E2022),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: TextStyle(
              fontSize: 10.5,
              color: isDark ? AppColors.textSecondary : const Color(0xFF555555),
              height: 1.25,
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // DESTINATION SEARCH OVERLAY
  // =========================================================================

  Widget _buildSearchOverlay(bool isDark) {
    return Container(
      color: isDark ? AppColors.midnightDarkBackground : Colors.white,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Nav & Search Header
            Container(
              padding: const EdgeInsets.fromLTRB(12, 8, 16, 12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.midnightDarkSurface : Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back),
                        onPressed: () => setState(() => _isSearching = false),
                      ),
                      const SizedBox(width: 4),
                      const Text(
                        'Where do you want to go?',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Pickup Field
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF00875A), width: 2.5),
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _startController,
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                            decoration: const InputDecoration(
                              hintText: 'Pickup point',
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.my_location, size: 18, color: Color(0xFF00875A)),
                          onPressed: _fetchAndUseCurrentGps,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Destination Field
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFFC800), width: 1.5),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Color(0xFFD32F2F),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _destController,
                            autofocus: true,
                            onChanged: _onDestinationTextChanged,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                            decoration: const InputDecoration(
                              hintText: 'Search destination address...',
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        if (_destController.text.isNotEmpty)
                          IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _destController.clear();
                              setState(() => _dynamicSuggestions = const []);
                            },
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Autocomplete Results or Recommended Destinations
            Expanded(
              child: _dynamicSuggestions.isNotEmpty
                  ? ListView.separated(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _dynamicSuggestions.length,
                      separatorBuilder: (context, index) => const Divider(height: 1, indent: 52),
                      itemBuilder: (context, index) {
                        final suggestion = _dynamicSuggestions[index];
                        return ListTile(
                          dense: true,
                          leading: const Icon(Icons.place_rounded, color: Color(0xFF00875A)),
                          title: Text(
                            suggestion.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          subtitle: Text(
                            suggestion.subtitle,
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          trailing: const Icon(Icons.north_west, size: 14, color: Colors.grey),
                          onTap: () => _selectDestinationSuggestion(suggestion),
                        );
                      },
                    )
                  : ListView(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      children: [
                        const Text(
                          'Recent & Recommended',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey),
                        ),
                        const SizedBox(height: 8),
                        ..._recentDestinations.map((item) {
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: const Icon(Icons.history_rounded, color: Colors.grey),
                            title: Text(
                              item.title,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                            ),
                            subtitle: Text(
                              item.subtitle,
                              style: const TextStyle(fontSize: 11.5, color: Colors.grey),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            onTap: () => _selectRecentDestination(item),
                          );
                        }),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // RIDE SETUP SHEET CONTENT (WHEN DESTINATION IS SELECTED)
  // =========================================================================

  Widget _buildRideSetupContent(bool isDark, double effectiveDistanceKm, ScrollController scrollController) {
    final viableModes = _getViableModes(effectiveDistanceKm);
    final activeTiming = _calculateDynamicTiming(distanceKm: effectiveDistanceKm, mode: _selectedMode);

    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // Drag Handle
        Center(
          child: Container(
            margin: const EdgeInsets.only(top: 4, bottom: 12),
            width: 40,
            height: 4.5,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.grey.shade300,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
        ),

        // Route Addresses Card with Edit Button
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF7F8FA),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.midnightDarkCardBorder : Colors.black.withValues(alpha: 0.05),
            ),
          ),
          child: Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF00875A), width: 2.5),
                      color: Colors.white,
                    ),
                  ),
                  Container(width: 1.5, height: 26, color: Colors.grey.shade400),
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFFD32F2F),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _startController.text,
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 14),
                    Text(
                      _destController.text,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _isSearching = true),
                child: const Text('Change', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00875A))),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Vehicle Mode Selection Cards
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Select Escort Mode',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
            ),
            Text(
              '${effectiveDistanceKm.toStringAsFixed(1)} km • ~${activeTiming.totalMinutes} min',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF00875A)),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Horizontal Mode Cards
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: viableModes.map((mode) {
              final isSelected = _selectedMode == mode;
              final timing = _calculateDynamicTiming(distanceKm: effectiveDistanceKm, mode: mode);

              return Padding(
                padding: const EdgeInsets.only(right: 10),
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _selectedMode = mode;
                      final dist = _getEffectiveRouteDistanceKm();
                      final timing = _calculateDynamicTiming(distanceKm: dist, mode: mode);
                      final checkIn = _calculateCheckInRecommendation(mode: mode, distanceKm: dist);
                      _durationMinutes = timing.totalMinutes;
                      _checkInInterval = checkIn.recommendedIntervalMinutes;
                    });
                    _calculateActiveRoute();
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: 105,
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFFFFC800).withValues(alpha: isDark ? 0.25 : 0.18)
                          : (isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF7F8FA)),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? const Color(0xFFFFC800) : Colors.transparent,
                        width: 2.0,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          mode.icon,
                          size: 26,
                          color: isSelected ? const Color(0xFFFFB800) : Colors.grey,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          mode.label,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '~${timing.totalMinutes}m',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 14),

        // Vehicle Registration Number Input (Cab, Auto, Bus)
        if (_selectedMode == TransportMode.cab ||
            _selectedMode == TransportMode.auto ||
            _selectedMode == TransportMode.bus) ...[
          _buildVehicleNumberInput(isDark),
          const SizedBox(height: 14),
        ],

        // Estimated Journey Time Card
        _buildEstimatedTimeCard(isDark),
        const SizedBox(height: 14),

        // Adaptive Check-In Frequency Card
        _buildAdaptiveCheckInCard(isDark),
        const SizedBox(height: 14),

        // Escort Guardians Selection for This Trip
        _buildContactsNotificationPreview(isDark),
        const SizedBox(height: 20),

        // Modern Animated Swipe Slider
        SwipeActionControl(
          label: 'Swipe right to arm journey protection',
          confirmedLabel: 'PROTECTED ESCORT ACTIVE',
          sliderColor: const Color(0xFF00875A),
          onConfirmed: () {
            final waypoints = _getEffectiveRouteWaypoints();
            widget.onStartJourney(
              _startController.text,
              _destController.text,
              _selectedMode,
              _vehicleController.text,
              _durationMinutes,
              _checkInInterval,
              _selectedContactIds.toList(),
              waypoints,
            );
          },
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  // =========================================================================
  // JOURNEY SETUP COMPONENT CARDS (TIMING, CHECK-IN, GUARDIANS)
  // =========================================================================

  Widget _buildVehicleNumberInput(bool isDark) {
    return TextField(
      controller: _vehicleController,
      decoration: InputDecoration(
        labelText: 'Vehicle / Registration Number',
        prefixIcon: const Icon(Icons.badge, color: Color(0xFF00875A)),
        hintText: 'e.g. DL 1Y B 4821',
        suffixIcon: IconButton(
          icon: const Icon(Icons.clear, size: 18),
          onPressed: () => _vehicleController.clear(),
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFF00875A), width: 2),
        ),
      ),
    );
  }

  Widget _buildEstimatedTimeCard(bool isDark) {
    final distanceKm = _getEffectiveRouteDistanceKm();
    final timing = _calculateDynamicTiming(distanceKm: distanceKm, mode: _selectedMode);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF7F8FA),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? AppColors.midnightDarkCardBorder : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.schedule_rounded, color: Color(0xFF00875A), size: 18),
                  SizedBox(width: 8),
                  Text('Estimated Journey Time', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: timing.traffic.badgeColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  timing.traffic.statusLabel,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: timing.traffic.badgeColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _formatDurationDisplay(_durationMinutes),
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF00875A),
                    ),
                  ),
                  Text(
                    'Expected Arrival: ${_formatExpectedArrival()}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
              // Increase / Decrease Stepper
              Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.midnightDarkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_rounded, size: 18),
                      onPressed: () => setState(() => _durationMinutes = math.max(5, _durationMinutes - 5)),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_rounded, size: 18),
                      onPressed: () => setState(() => _durationMinutes = math.min(1440, _durationMinutes + 5)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAdaptiveCheckInCard(bool isDark) {
    final distanceKm = _getEffectiveRouteDistanceKm();
    final localRec = _calculateCheckInRecommendation(mode: _selectedMode, distanceKm: distanceKm);
    final prediction = _geminiPrediction;
    final recommendedInterval = prediction?.recommendedIntervalMinutes ?? localRec.recommendedIntervalMinutes;
    final isAi = prediction?.isAiGenerated ?? false;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF7F8FA),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? AppColors.midnightDarkCardBorder : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.security_rounded, color: Color(0xFF00875A), size: 18),
                  const SizedBox(width: 8),
                  const Text('Check-In Frequency', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  if (isAi) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00875A).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('Gemini AI', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF00875A))),
                    ),
                  ],
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF00875A).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Every $_checkInInterval min',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF00875A)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // 3 Presets
          Row(
            children: [
              _buildCheckInChip('High Alert (5m)', 5, AppColors.warningAmber, isDark, recommendedInterval == 5),
              const SizedBox(width: 8),
              _buildCheckInChip('Balanced (10m)', 10, const Color(0xFF00875A), isDark, recommendedInterval == 10),
              const SizedBox(width: 8),
              _buildCheckInChip('Relaxed (20m)', 20, AppColors.primaryCobalt, isDark, recommendedInterval == 20),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCheckInChip(String label, int interval, Color color, bool isDark, bool isRecommended) {
    final isSelected = _checkInInterval == interval;

    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _checkInInterval = interval),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? color.withValues(alpha: isDark ? 0.25 : 0.15)
                : (isDark ? AppColors.midnightDarkSurface : Colors.white),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? color : Colors.grey.shade300,
              width: isSelected ? 1.8 : 1.0,
            ),
          ),
          child: Column(
            children: [
              if (isRecommended)
                Text(
                  'RECOMMENDED',
                  style: TextStyle(fontSize: 7.5, fontWeight: FontWeight.w800, color: color),
                ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? color : (isDark ? Colors.white70 : Colors.black87),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContactsNotificationPreview(bool isDark) {
    final hasContacts = widget.contacts.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.midnightDarkSurfaceVariant : const Color(0xFFF7F8FA),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? AppColors.midnightDarkCardBorder : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.people_alt_rounded, color: Color(0xFF00875A), size: 18),
                  SizedBox(width: 8),
                  Text('Escort Guardians', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF00875A).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_selectedContactIds.length} of ${widget.contacts.length} Alerted',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF00875A)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          if (hasContacts) ...[
            Column(
              children: widget.contacts.map((contact) {
                final isSelected = _selectedContactIds.contains(contact.id);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 6.0),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        if (isSelected) {
                          _selectedContactIds.remove(contact.id);
                        } else {
                          _selectedContactIds.add(contact.id);
                        }
                      });
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFF00875A).withValues(alpha: isDark ? 0.2 : 0.08)
                            : (isDark ? AppColors.midnightDarkSurface : Colors.white),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF00875A) : Colors.grey.shade300,
                        ),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: isSelected ? const Color(0xFF00875A) : Colors.grey.shade300,
                            child: Text(
                              contact.name.isNotEmpty ? contact.name[0].toUpperCase() : 'G',
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  contact.name,
                                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  contact.relationship,
                                  style: const TextStyle(fontSize: 10.5, color: Colors.grey),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                            color: isSelected ? const Color(0xFF00875A) : Colors.grey,
                            size: 18,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ] else ...[
            Text(
              'No emergency contacts configured. Tap contacts icon to add trusted guardians.',
              style: TextStyle(
                fontSize: 11.5,
                color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Custom painter for the little downward pointing triangle on the "Pickup Point" badge
class _TrianglePointerPainter extends CustomPainter {
  final Color color;

  _TrianglePointerPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
