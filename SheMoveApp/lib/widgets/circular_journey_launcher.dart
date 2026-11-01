import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';

/// An interactive Route Preview Bar journey launcher card.
/// Visually connects the user's current GPS location to "Where are you heading?"
/// with an animated traveling route line.
class CircularJourneyLauncher extends StatefulWidget {
  final bool hasActiveJourney;
  final Journey? activeJourney;
  final String? currentAddress;
  final VoidCallback onStartJourney;
  final VoidCallback onViewActiveJourney;
  final VoidCallback? onQuickEmergency;
  final ValueChanged<TransportMode>? onModeChanged;
  final int contactsCount;
  final bool isGpsLocked;

  const CircularJourneyLauncher({
    super.key,
    required this.hasActiveJourney,
    this.activeJourney,
    this.currentAddress,
    required this.onStartJourney,
    required this.onViewActiveJourney,
    this.onQuickEmergency,
    this.onModeChanged,
    this.contactsCount = 0,
    this.isGpsLocked = false,
  });

  @override
  State<CircularJourneyLauncher> createState() =>
      _CircularJourneyLauncherState();
}

typedef JourneyLauncherCard = CircularJourneyLauncher;

class _CircularJourneyLauncherState extends State<CircularJourneyLauncher>
    with SingleTickerProviderStateMixin {
  late final AnimationController _routeAnimationController;

  @override
  void initState() {
    super.initState();
    // Continuous flowing pulse animation along the connecting route line
    _routeAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
  }

  @override
  void dispose() {
    _routeAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (widget.hasActiveJourney) {
      return _buildActiveJourneyCard(context, isDark);
    }
    return _buildInteractiveRoutePreviewCard(context, isDark);
  }

  /// Interactive Route Preview Bar connecting origin GPS to destination prompt
  Widget _buildInteractiveRoutePreviewCard(
    BuildContext context,
    bool isDark,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.midnightDarkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isDark
              ? AppColors.midnightDarkCardBorder
              : AppColors.lightCardBorder,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withValues(alpha: 0.28)
                : const Color(0xFF64748B).withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            widget.onStartJourney();
          },
          borderRadius: BorderRadius.circular(22),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row: Required title & live shield badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Start Protected Journey',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -0.2,
                        color: isDark
                            ? AppColors.textPrimary
                            : AppColors.lightTextPrimary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.safeGreen.withValues(
                          alpha: isDark ? 0.20 : 0.12,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.safeGreen.withValues(alpha: 0.35),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.shield_rounded,
                            size: 13,
                            color: AppColors.safeGreen,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Protected',
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                              color: AppColors.safeGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Visual Route Connection: Origin -> Animated Path -> Destination
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Left Column: Origin Dot, Animated Route Line, Destination Pin
                    Column(
                      children: [
                        const SizedBox(height: 3),
                        // Origin GPS Dot
                        Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: AppColors.safeGreen,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.safeGreen.withValues(
                                  alpha: 0.45,
                                ),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Container(
                              width: 5,
                              height: 5,
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ),

                        // Animated Dashed Route Line with traveling energy dot
                        SizedBox(
                          width: 14,
                          height: 36,
                          child: AnimatedBuilder(
                            animation: _routeAnimationController,
                            builder: (context, child) {
                              return CustomPaint(
                                painter: _AnimatedRouteLinePainter(
                                  animationValue:
                                      _routeAnimationController.value,
                                  baseColor: isDark
                                      ? AppColors.midnightDarkCardBorder
                                      : AppColors.lightCardBorder,
                                  pulseColor: AppColors.primaryViolet,
                                ),
                              );
                            },
                          ),
                        ),

                        // Destination Pin
                        Container(
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                            color: AppColors.primaryViolet.withValues(
                              alpha: 0.18,
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.place_rounded,
                            size: 13,
                            color: AppColors.primaryViolet,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(width: 12),

                    // Right Column: Origin Address & Interactive Destination Bar
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Origin Address row
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  widget.currentAddress?.isNotEmpty == true
                                      ? widget.currentAddress!
                                      : 'Current GPS Location',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.textSecondary
                                        : AppColors.lightTextSecondary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? AppColors.midnightDarkCard
                                      : AppColors.lightSurfaceVariant,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'GPS',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.safeGreen,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 14),

                          // Interactive Destination Bar
                          Container(
                            height: 48,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                            ),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.midnightDarkSurfaceVariant
                                  : AppColors.lightSurfaceVariant,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: AppColors.primaryViolet.withValues(
                                  alpha: isDark ? 0.45 : 0.35,
                                ),
                                width: 1.2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primaryViolet.withValues(
                                    alpha: isDark ? 0.14 : 0.06,
                                  ),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    'Where are you heading?',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: isDark
                                          ? AppColors.textPrimary
                                          : AppColors.lightTextPrimary,
                                    ),
                                  ),
                                ),
                                Container(
                                  width: 28,
                                  height: 28,
                                  decoration: const BoxDecoration(
                                    color: AppColors.primaryViolet,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.arrow_forward_rounded,
                                    size: 16,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Clean active transit card without clutter
  Widget _buildActiveJourneyCard(BuildContext context, bool isDark) {
    final journey = widget.activeJourney;
    final progress = journey?.progressPercent ?? 0.0;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.midnightDarkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: AppColors.primaryViolet.withValues(
            alpha: isDark ? 0.6 : 0.4,
          ),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryViolet.withValues(
              alpha: isDark ? 0.22 : 0.12,
            ),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onViewActiveJourney,
          borderRadius: BorderRadius.circular(22),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Status Header: Escort Active & Vehicle Chip
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 9,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.safeGreen.withValues(
                          alpha: isDark ? 0.20 : 0.12,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.safeGreen),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.check_circle_rounded,
                            size: 13,
                            color: AppColors.safeGreen,
                          ),
                          SizedBox(width: 5),
                          Text(
                            'Escort Active',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppColors.safeGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (journey?.vehicleNumber.isNotEmpty == true)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.midnightDarkCard
                              : AppColors.lightSurfaceVariant,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isDark
                                ? AppColors.midnightDarkCardBorder
                                : AppColors.lightCardBorder,
                          ),
                        ),
                        child: Text(
                          journey!.vehicleNumber,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightTextPrimary,
                          ),
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: 14),

                // Destination Row
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.primaryViolet.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        journey?.transportMode.icon ??
                            Icons.navigation_rounded,
                        color: AppColors.primaryViolet,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            journey?.destinationAddress ?? 'Destination',
                            style: TextStyle(
                              fontSize: 16.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: -0.2,
                              color: isDark
                                  ? AppColors.textPrimary
                                  : AppColors.lightTextPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'From: ${journey?.startAddress ?? 'Origin'}',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark
                                  ? AppColors.textSecondary
                                  : AppColors.lightTextSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Clean Progress Line
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Route Progress',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.textSecondary
                                : AppColors.lightTextSecondary,
                          ),
                        ),
                        Text(
                          '${(progress * 100).toInt()}%',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryViolet,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress.clamp(0.02, 1.0),
                        minHeight: 5,
                        backgroundColor: isDark
                            ? AppColors.midnightDarkCardBorder
                            : AppColors.lightCardBorder,
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          AppColors.primaryViolet,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Action Buttons: View Route & SOS
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: widget.onViewActiveJourney,
                        icon: const Icon(Icons.map_rounded, size: 17),
                        label: const Text(
                          'View Live Route',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13.5,
                          ),
                        ),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primaryViolet,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    if (widget.onQuickEmergency != null) ...[
                      const SizedBox(width: 10),
                      IconButton.filled(
                        onPressed: widget.onQuickEmergency,
                        icon: const Icon(
                          Icons.emergency,
                          color: Colors.white,
                          size: 20,
                        ),
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.emergencyRed,
                          padding: const EdgeInsets.all(12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        tooltip: 'Emergency SOS',
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Custom painter that renders a vertical dashed route line with an animated
/// energy pulse gliding from origin to destination.
class _AnimatedRouteLinePainter extends CustomPainter {
  final double animationValue;
  final Color baseColor;
  final Color pulseColor;

  _AnimatedRouteLinePainter({
    required this.animationValue,
    required this.baseColor,
    required this.pulseColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const startY = 3.0;
    final endY = size.height - 3.0;
    final totalHeight = endY - startY;
    if (totalHeight <= 0) return;

    // 1. Draw base dashed route line
    final linePaint = Paint()
      ..color = baseColor
      ..strokeWidth = 1.8
      ..strokeCap = StrokeCap.round;

    const dashHeight = 3.5;
    const dashSpace = 3.5;
    double currentY = startY;

    while (currentY < endY) {
      final nextY = math.min(currentY + dashHeight, endY);
      canvas.drawLine(
        Offset(size.width / 2, currentY),
        Offset(size.width / 2, nextY),
        linePaint,
      );
      currentY += dashHeight + dashSpace;
    }

    // 2. Animated traveling energy dot gliding from origin to destination
    final pulseY = startY + (totalHeight * animationValue);
    final dotCenter = Offset(size.width / 2, pulseY);

    // Subtle glow halo
    final glowPaint = Paint()
      ..color = pulseColor.withValues(alpha: 0.5)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    canvas.drawCircle(dotCenter, 3.5, glowPaint);

    // Inner core dot
    final dotPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(dotCenter, 2.0, dotPaint);
  }

  @override
  bool shouldRepaint(covariant _AnimatedRouteLinePainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.baseColor != baseColor ||
        oldDelegate.pulseColor != pulseColor;
  }
}
