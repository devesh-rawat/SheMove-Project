import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:vibration/vibration.dart';

/// Dedicated haptic and vibration service for SheMove safety alerts.
class VibrationService {
  static final VibrationService _instance = VibrationService._internal();
  factory VibrationService() => _instance;
  VibrationService._internal();

  Timer? _repeatingVibrationTimer;

  /// Check-In Due Alert:
  /// Distinct double-pulse pattern alerting the user that a check-in is required.
  Future<void> vibrateCheckInAlert() async {
    try {
      final hasVibrator = await Vibration.hasVibrator();
      if (hasVibrator == true) {
        final hasPatternSupport = await Vibration.hasCustomVibrationsSupport();
        if (hasPatternSupport == true) {
          // Wait 0ms, vibrate 450ms, pause 200ms, vibrate 450ms
          await Vibration.vibrate(
            pattern: [0, 450, 200, 450],
            intensities: [0, 255, 0, 255],
          );
        } else {
          await Vibration.vibrate(duration: 800);
        }
      } else {
        await HapticFeedback.heavyImpact();
      }
    } catch (e) {
      debugPrint('VibrationService.vibrateCheckInAlert error: $e');
      try {
        await HapticFeedback.vibrate();
      } catch (_) {}
    }
  }

  /// Escalation Window Alert:
  /// Urgent pulsing vibration when check-in is missed and grace period timer is counting down.
  Future<void> startEscalationAlertPulse() async {
    stopVibration();
    // Fire immediately
    _triggerEscalationPulse();
    // Repeat urgent pulse every 3 seconds until safety confirmed or escalated
    _repeatingVibrationTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      _triggerEscalationPulse();
    });
  }

  Future<void> _triggerEscalationPulse() async {
    try {
      final hasVibrator = await Vibration.hasVibrator();
      if (hasVibrator == true) {
        final hasPatternSupport = await Vibration.hasCustomVibrationsSupport();
        if (hasPatternSupport == true) {
          // Urgent triple pulse: 500ms on, 150ms off, 500ms on, 150ms off, 700ms on
          await Vibration.vibrate(
            pattern: [0, 500, 150, 500, 150, 700],
            intensities: [0, 255, 0, 255, 0, 255],
          );
        } else {
          await Vibration.vibrate(duration: 1200);
        }
      } else {
        await HapticFeedback.heavyImpact();
      }
    } catch (e) {
      debugPrint('VibrationService._triggerEscalationPulse error: $e');
      try {
        await HapticFeedback.vibrate();
      } catch (_) {}
    }
  }

  /// Critical Emergency SOS Vibration:
  /// Intense rapid vibration pattern indicating full emergency trigger.
  Future<void> vibrateEmergencySos() async {
    stopVibration();
    try {
      final hasVibrator = await Vibration.hasVibrator();
      if (hasVibrator == true) {
        final hasPatternSupport = await Vibration.hasCustomVibrationsSupport();
        if (hasPatternSupport == true) {
          // SOS Pattern: ... --- ... (Short short short, long long long, short short short)
          await Vibration.vibrate(
            pattern: [
              0, 200, 100, 200, 100, 200,
              250, 600, 150, 600, 150, 600,
              250, 200, 100, 200, 100, 200,
            ],
          );
        } else {
          await Vibration.vibrate(duration: 2000);
        }
      } else {
        await HapticFeedback.heavyImpact();
      }
    } catch (e) {
      debugPrint('VibrationService.vibrateEmergencySos error: $e');
      try {
        await HapticFeedback.vibrate();
      } catch (_) {}
    }
  }

  /// Gentle confirmation vibration when user enters PIN or confirms safety.
  Future<void> vibrateSafetyConfirmed() async {
    stopVibration();
    try {
      await HapticFeedback.mediumImpact();
    } catch (_) {}
  }

  /// Stop any active repeating vibration pulse immediately.
  void stopVibration() {
    _repeatingVibrationTimer?.cancel();
    _repeatingVibrationTimer = null;
    try {
      Vibration.cancel();
    } catch (_) {}
  }
}

