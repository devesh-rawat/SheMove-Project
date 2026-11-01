import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class SplashFeatureSlide {
  final String tag;
  final String title;
  final String description;
  final IconData icon;
  final Color accentColor;

  const SplashFeatureSlide({
    required this.tag,
    required this.title,
    required this.description,
    required this.icon,
    required this.accentColor,
  });
}

/// Dynamic Splash Screen featuring the SheMove hero emblem and auto-transitioning
/// core safety pillars rendered in a dedicated, high-polish Light Mode aesthetic.
class OnboardingScreen extends StatefulWidget {
  final VoidCallback onFinish;

  const OnboardingScreen({super.key, required this.onFinish});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

typedef SplashScreen = OnboardingScreen;

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  late final AnimationController _progressController;
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  int _currentSlideIndex = 0;
  bool _isFinished = false;

  static const Duration _slideDuration = Duration(milliseconds: 2800);

  static const List<SplashFeatureSlide> _slides = [
    SplashFeatureSlide(
      tag: 'GPS ROUTE GUARDIAN',
      title: 'Protected Journeys',
      description:
          'Intelligent route guardian monitors your transit from departure to destination with real-time GPS telemetry.',
      icon: Icons.shield_rounded,
      accentColor: AppColors.primaryViolet,
    ),
    SplashFeatureSlide(
      tag: 'SMART VELOCITY & MOTION',
      title: 'Adaptive Safety Check-Ins',
      description:
          'Effortless gesture-based check-ins that adapt to your speed, late night hours, and transport mode.',
      icon: Icons.touch_app_rounded,
      accentColor: Color(0xFF7C3AED), // Rich Royal Violet (high contrast on light)
    ),
    SplashFeatureSlide(
      tag: 'SILENT DISTRESS BEACON',
      title: 'Discreet Duress & SOS',
      description:
          'A silent duress PIN that appears routine to an attacker while covertly dispatching your live beacon to trusted contacts.',
      icon: Icons.lock_outline_rounded,
      accentColor: AppColors.primaryViolet,
    ),
    SplashFeatureSlide(
      tag: 'REAL-TIME ESCALATION RING',
      title: 'Trusted Circle Escalation',
      description:
          'Automated escalation alerts your family with live route tracking if a check-in is missed.',
      icon: Icons.people_alt_rounded,
      accentColor: Color(0xFF059669), // Vivid Emerald Green (crisp on light)
    ),
  ];

  @override
  void initState() {
    super.initState();

    // Pulse animation for subtle breathing aura on hero image
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.985, end: 1.015).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Progress animation for automatic story-style transitioning
    _progressController = AnimationController(
      vsync: this,
      duration: _slideDuration,
    );

    _progressController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _advanceSlide();
      }
    });

    _progressController.forward();
  }

  void _advanceSlide() {
    if (!mounted || _isFinished) return;

    if (_currentSlideIndex < _slides.length - 1) {
      setState(() {
        _currentSlideIndex++;
      });
      _progressController.forward(from: 0.0);
    } else {
      // Completed full cycle of safety slides
      _finishSplash();
    }
  }

  void _nextSlide() {
    if (!mounted || _isFinished) return;

    if (_currentSlideIndex < _slides.length - 1) {
      setState(() {
        _currentSlideIndex++;
      });
      _progressController.forward(from: 0.0);
    } else {
      _finishSplash();
    }
  }

  void _prevSlide() {
    if (!mounted || _isFinished) return;

    if (_currentSlideIndex > 0) {
      setState(() {
        _currentSlideIndex--;
      });
      _progressController.forward(from: 0.0);
    }
  }

  void _goToSlide(int index) {
    if (!mounted || _isFinished) return;
    if (index >= 0 && index < _slides.length) {
      setState(() {
        _currentSlideIndex = index;
      });
      _progressController.forward(from: 0.0);
    }
  }

  void _finishSplash() {
    if (_isFinished) return;
    _isFinished = true;
    _progressController.stop();
    _pulseController.stop();
    widget.onFinish();
  }

  @override
  void dispose() {
    _progressController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentSlide = _slides[_currentSlideIndex];

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemNavigationBarColor: AppColors.lightBackground,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Theme(
        data: AppTheme.lightTheme,
        child: Scaffold(
          backgroundColor: AppColors.lightBackground,
          body: SafeArea(
            child: GestureDetector(
              onHorizontalDragEnd: (details) {
                if (details.primaryVelocity != null) {
                  if (details.primaryVelocity! < -200) {
                    _nextSlide();
                  } else if (details.primaryVelocity! > 200) {
                    _prevSlide();
                  }
                }
              },
              onLongPressStart: (_) => _progressController.stop(),
              onLongPressEnd: (_) {
                if (!_isFinished &&
                    _progressController.status != AnimationStatus.completed) {
                  _progressController.forward();
                }
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  children: [
                    const SizedBox(height: 12),

                    // Top Bar: SheMove Logo Branding & Skip Action (Light Theme)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: const Color(0xFFEDE9FE),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0xFFDDD6FE),
                                  width: 1.5,
                                ),
                              ),
                              child: const Icon(
                                Icons.shield_rounded,
                                color: AppColors.primaryViolet,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Text(
                                  'SheMove',
                                  style: TextStyle(
                                    fontSize: 19,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.3,
                                    color: AppColors.lightTextPrimary,
                                  ),
                                ),
                                Text(
                                  'SafeLoop Protection',
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    letterSpacing: 0.6,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.lightTextSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        TextButton.icon(
                          onPressed: _finishSplash,
                          icon: const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 12,
                          ),
                          label: const Text(
                            'Skip',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.lightTextSecondary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Hero Image Card in clean floating porcelain style with soft ambient glow
                    Expanded(
                      flex: 11,
                      child: Center(
                        child: ScaleTransition(
                          scale: _pulseAnimation,
                          child: Container(
                            constraints: const BoxConstraints(
                              maxHeight: 330,
                              maxWidth: 330,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(28),
                              border: Border.all(
                                color: const Color(0xFFE2E8F0),
                                width: 1.2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: currentSlide.accentColor.withValues(
                                    alpha: 0.16,
                                  ),
                                  blurRadius: 30,
                                  spreadRadius: 2,
                                  offset: const Offset(0, 10),
                                ),
                                BoxShadow(
                                  color: const Color(0xFF0F172A).withValues(
                                    alpha: 0.04,
                                  ),
                                  blurRadius: 10,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(28),
                              child: Image.asset(
                                'assets/images/shemove_splash_hero.jpg',
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(28),
                                      border: Border.all(
                                        color: AppColors.lightCardBorder,
                                      ),
                                    ),
                                    child: const Center(
                                      child: Icon(
                                        Icons.shield_rounded,
                                        color: AppColors.primaryViolet,
                                        size: 72,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Segmented Progress Bar (Light Mode track with vibrant active fill)
                    Row(
                      children: List.generate(_slides.length, (index) {
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => _goToSlide(index),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              height: 4.5,
                              decoration: BoxDecoration(
                                color: const Color(0xFFE2E8F0),
                                borderRadius: BorderRadius.circular(2.5),
                              ),
                              child: AnimatedBuilder(
                                animation: _progressController,
                                builder: (context, child) {
                                  double fill = 0.0;
                                  if (index < _currentSlideIndex) {
                                    fill = 1.0;
                                  } else if (index == _currentSlideIndex) {
                                    fill = _progressController.value;
                                  }
                                  return FractionallySizedBox(
                                    alignment: Alignment.centerLeft,
                                    widthFactor: fill,
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: currentSlide.accentColor,
                                        borderRadius:
                                            BorderRadius.circular(2.5),
                                        boxShadow: [
                                          BoxShadow(
                                            color: currentSlide.accentColor
                                                .withValues(alpha: 0.35),
                                            blurRadius: 4,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        );
                      }),
                    ),

                    const SizedBox(height: 18),

                    // Transitioning Pillar Content (Light Mode Typography & Badges)
                    SizedBox(
                      height: 140,
                      child: Center(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 400),
                          switchInCurve: Curves.easeOutCubic,
                          switchOutCurve: Curves.easeInCubic,
                          transitionBuilder:
                              (Widget child, Animation<double> animation) {
                            return FadeTransition(
                              opacity: animation,
                              child: SlideTransition(
                                position: Tween<Offset>(
                                  begin: const Offset(0.0, 0.15),
                                  end: Offset.zero,
                                ).animate(animation),
                                child: child,
                              ),
                            );
                          },
                          child: Column(
                            key: ValueKey<int>(_currentSlideIndex),
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Tag Badge with slide icon
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: currentSlide.accentColor.withValues(
                                    alpha: 0.10,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: currentSlide.accentColor.withValues(
                                      alpha: 0.28,
                                    ),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      currentSlide.icon,
                                      size: 14,
                                      color: currentSlide.accentColor,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      currentSlide.tag,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.8,
                                        color: currentSlide.accentColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 10),

                              // Slide Title (Deep slate dark contrast)
                              Text(
                                currentSlide.title,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.2,
                                  color: AppColors.lightTextPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),

                              // Slide Description (Slate-600 crisp readability)
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12.0,
                                ),
                                child: Text(
                                  currentSlide.description,
                                  textAlign: TextAlign.center,
                                  maxLines: 3,
                                  style: const TextStyle(
                                    fontSize: 13.5,
                                    height: 1.45,
                                    color: AppColors.lightTextSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Bottom Action: Get Started / Continue Button & Slogan
                    Padding(
                      padding: const EdgeInsets.only(bottom: 20.0),
                      child: Column(
                        children: [
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: FilledButton(
                              onPressed: _finishSplash,
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.primaryViolet,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 2,
                                shadowColor: AppColors.primaryViolet.withValues(
                                  alpha: 0.35,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    _currentSlideIndex == _slides.length - 1
                                        ? 'Get Started'
                                        : 'Continue',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(
                                    Icons.arrow_forward_rounded,
                                    size: 18,
                                    color: Colors.white,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            '— she moves freely — she moves safely —',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12.5,
                              letterSpacing: 0.4,
                              fontWeight: FontWeight.w600,
                              color: AppColors.lightTextSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
