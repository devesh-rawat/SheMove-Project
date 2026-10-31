import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/contacts_service.dart';
import '../theme/app_colors.dart';
import '../widgets/numeric_pin_pad.dart';

class SecuritySetupScreen extends StatefulWidget {
  final String initialName;
  final String initialPhone;
  final bool initialLocationGranted;
  final bool initialContactsGranted;
  final Future<bool> Function()? onRequestLocationPermission;
  final Future<bool> Function()? onRequestContactsPermission;
  final Future<DeviceContactInfo?> Function()? onPickDeviceContact;
  final Function(
    String name,
    String phone,
    String safetyPin,
    String duressPin,
    List<TrustedContact> contacts,
  ) onSetupComplete;

  const SecuritySetupScreen({
    super.key,
    this.initialName = 'Aanya Rao',
    this.initialPhone = '+91 98112 34567',
    this.initialLocationGranted = false,
    this.initialContactsGranted = false,
    this.onRequestLocationPermission,
    this.onRequestContactsPermission,
    this.onPickDeviceContact,
    required this.onSetupComplete,
  });

  @override
  State<SecuritySetupScreen> createState() => _SecuritySetupScreenState();
}

class _SecuritySetupScreenState extends State<SecuritySetupScreen> {
  int _step = 1;
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  String _safetyPin = '';
  String _duressPin = '';
  String? _safetyPinError;
  String? _duressPinError;
  bool _locationGranted = false;
  bool _contactsGranted = false;
  final List<TrustedContact> _selectedContacts = [];
  bool _isPickingContact = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _phoneController = TextEditingController(text: widget.initialPhone);
    _locationGranted = widget.initialLocationGranted;
    _contactsGranted = widget.initialContactsGranted;

    // Trigger default Android permission dialogs on setup
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _requestPermissionsByDefault();
    });
  }

  Future<void> _requestPermissionsByDefault() async {
    try {
      if (!_locationGranted && widget.onRequestLocationPermission != null) {
        final granted = await widget.onRequestLocationPermission!();
        if (mounted) setState(() => _locationGranted = granted);
      }
      if (!_contactsGranted && widget.onRequestContactsPermission != null) {
        final cGranted = await widget.onRequestContactsPermission!();
        if (mounted) setState(() => _contactsGranted = cGranted);
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickContactFromPhone() async {
    setState(() => _isPickingContact = true);
    try {
      if (widget.onPickDeviceContact != null) {
        final contact = await widget.onPickDeviceContact!();
        if (contact != null) {
          _promptRelationshipAndAdd(contact.name, contact.phone);
        }
      }
    } finally {
      if (mounted) setState(() => _isPickingContact = false);
    }
  }

  void _promptRelationshipAndAdd(String name, String phone) {
    String selectedRel = 'Sister';
    final relationships = [
      'Sister',
      'Father',
      'Mother',
      'Brother',
      'Partner',
      'Best Friend',
      'Family',
      'Colleague',
      'Other',
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.midnightDarkSurface : AppColors.lightSurface,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.primaryViolet.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              name.isNotEmpty ? name.substring(0, 1) : 'C',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryViolet,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                phone,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'What is their relationship to you?',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: relationships.map((rel) {
                        final isSelected = selectedRel == rel;
                        return ChoiceChip(
                          label: Text(rel),
                          selected: isSelected,
                          onSelected: (val) {
                            if (val) {
                              setSheetState(() => selectedRel = rel);
                            }
                          },
                          selectedColor: AppColors.primaryViolet.withValues(alpha: 0.25),
                          labelStyle: TextStyle(
                            color: isSelected
                                ? AppColors.primaryViolet
                                : (isDark ? AppColors.textSecondary : AppColors.lightTextSecondary),
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: FilledButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _addContactToCircle(name, phone, selectedRel);
                        },
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primaryViolet,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text('Add to Emergency Circle',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _addContactToCircle(String name, String phone, String relationship) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final newContact = TrustedContact(
      id: 'c_$now',
      name: name,
      phone: phone,
      relationship: relationship,
      isPrimary: _selectedContacts.isEmpty,
      isVerified: true,
    );
    setState(() {
      _selectedContacts.add(newContact);
    });
  }

  void _showManualAddDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    String rel = 'Family';
    final relationships = [
      'Sister',
      'Father',
      'Mother',
      'Partner',
      'Best Friend',
      'Family',
      'Colleague',
      'Other'
    ];

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setDState) {
            return AlertDialog(
              title: const Text('Enter Emergency Contact'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: phoneCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: 'Mobile Number'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: rel,
                    decoration: const InputDecoration(labelText: 'Relationship'),
                    items: relationships
                        .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setDState(() => rel = val);
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () {
                    if (nameCtrl.text.trim().isNotEmpty && phoneCtrl.text.trim().isNotEmpty) {
                      Navigator.pop(ctx);
                      _addContactToCircle(nameCtrl.text.trim(), phoneCtrl.text.trim(), rel);
                    }
                  },
                  style: FilledButton.styleFrom(backgroundColor: AppColors.primaryViolet),
                  child: const Text('Add Contact'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.midnightDarkBackground : AppColors.lightBackground,
      appBar: AppBar(
        leading: _step > 1
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => setState(() => _step--),
              )
            : null,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryViolet.withValues(alpha: isDark ? 0.2 : 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.security, color: AppColors.primaryViolet, size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'Security Setup',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 18.0),
            child: Center(
              child: Text(
                'Step $_step of 4',
                style: const TextStyle(
                  color: AppColors.primaryViolet,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_step == 1) _buildStep1(isDark),
              if (_step == 2) _buildStep2(isDark),
              if (_step == 3) _buildStep3(isDark),
              if (_step == 4) _buildStep4(isDark),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep1(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Profile & Verification',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Your name and mobile number will be securely registered with your emergency contacts.',
          style: TextStyle(
            fontSize: 14,
            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
          ),
        ),
        const SizedBox(height: 24),

        // Name input
        TextField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: 'Full Name',
            prefixIcon: Icon(Icons.person, color: AppColors.primaryViolet),
          ),
        ),
        const SizedBox(height: 16),

        // Phone input
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'Mobile Number',
            prefixIcon: Icon(Icons.phone, color: AppColors.primaryViolet),
          ),
        ),
        const SizedBox(height: 32),

        // Next button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: () {
              if (_nameController.text.trim().isNotEmpty) {
                setState(() {
                  _step = 2;
                });
              }
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primaryViolet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text(
              'Continue to Safety PIN',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildModernPinSlots({
    required String pin,
    required Color activeColor,
    required bool isDark,
    bool isError = false,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(4, (index) {
          final isFilled = index < pin.length;
          final isCurrent = index == pin.length;

          Color borderColor;
          Color bgColor;
          List<BoxShadow> shadows = [];

          if (isError) {
            borderColor = AppColors.emergencyRed;
            bgColor = AppColors.emergencyRed.withValues(alpha: isDark ? 0.15 : 0.08);
          } else if (isFilled) {
            borderColor = activeColor;
            bgColor = activeColor.withValues(alpha: isDark ? 0.16 : 0.08);
            shadows = [
              BoxShadow(
                color: activeColor.withValues(alpha: isDark ? 0.35 : 0.2),
                blurRadius: 10,
                spreadRadius: 1,
              ),
            ];
          } else if (isCurrent) {
            borderColor = activeColor.withValues(alpha: 0.9);
            bgColor = isDark
                ? AppColors.midnightDarkSurfaceVariant
                : AppColors.lightSurfaceVariant;
            shadows = [
              BoxShadow(
                color: activeColor.withValues(alpha: 0.2),
                blurRadius: 8,
                spreadRadius: 0,
              ),
            ];
          } else {
            borderColor = isDark
                ? AppColors.midnightDarkCardBorder
                : AppColors.lightCardBorder;
            bgColor = isDark
                ? AppColors.midnightDarkSurface
                : AppColors.lightSurface;
          }

          return AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            margin: const EdgeInsets.symmetric(horizontal: 7),
            width: 58,
            height: 64,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: borderColor,
                width: isFilled || isCurrent ? 2.0 : 1.2,
              ),
              boxShadow: shadows,
            ),
            child: Center(
              child: isFilled
                  ? AnimatedScale(
                      scale: 1.0,
                      duration: const Duration(milliseconds: 180),
                      curve: Curves.elasticOut,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: BoxDecoration(
                          color: isError ? AppColors.emergencyRed : activeColor,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: (isError ? AppColors.emergencyRed : activeColor)
                                  .withValues(alpha: 0.6),
                              blurRadius: 8,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                      ),
                    )
                  : isCurrent
                      ? Container(
                          width: 2.5,
                          height: 22,
                          decoration: BoxDecoration(
                            color: activeColor.withValues(alpha: 0.8),
                            borderRadius: BorderRadius.circular(1.5),
                          ),
                        )
                      : null,
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStep2(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Mode Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: AppColors.primaryViolet.withValues(alpha: isDark ? 0.18 : 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.primaryViolet.withValues(alpha: isDark ? 0.35 : 0.25),
            ),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.shield_rounded, size: 14, color: AppColors.primaryViolet),
              SizedBox(width: 6),
              Text(
                'PRIMARY DEFENSE • DAILY ACCESS',
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                  color: AppColors.primaryViolet,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),

        Text(
          'Create Safety PIN',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Your personal 4-digit code to confirm safe arrival and authenticate check-ins.',
          style: TextStyle(
            fontSize: 14,
            height: 1.4,
            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
          ),
        ),
        const SizedBox(height: 14),

        // Modern 4-Pin Slots Visualizer (No duplicate dots!)
        _buildModernPinSlots(
          pin: _safetyPin,
          activeColor: AppColors.primaryViolet,
          isDark: isDark,
          isError: _safetyPinError != null,
        ),
        const SizedBox(height: 14),

        // Contextual Feature Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? AppColors.midnightDarkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.midnightDarkCardBorder : AppColors.lightCardBorder,
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.safeGreen.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_outline_rounded,
                    color: AppColors.safeGreen, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Routine Check-In Verification',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Enter this PIN to safely disarm countdowns, confirm arrival, and silence alerts.',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Numeric Keypad (showPinDots: false to prevent duplicate dots!)
        NumericPinPad(
          enteredPin: _safetyPin,
          showPinDots: false,
          activeColor: AppColors.primaryViolet,
          onPinChange: (newPin) {
            setState(() {
              _safetyPin = newPin;
              _safetyPinError = null;
            });
          },
          isError: _safetyPinError != null,
          errorMessage: _safetyPinError,
        ),
        const SizedBox(height: 20),

        // Next button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: () {
              if (_safetyPin.length < 4) {
                _safetyPin = '1234';
              }
              setState(() {
                _step = 3;
              });
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primaryViolet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Continue to Duress PIN',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                SizedBox(width: 8),
                Icon(Icons.arrow_forward_rounded, size: 18),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep3(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Mode Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: AppColors.warningAmber.withValues(alpha: isDark ? 0.2 : 0.12),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.warningAmber.withValues(alpha: isDark ? 0.45 : 0.3),
            ),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock_person_rounded, size: 14, color: AppColors.warningAmber),
              SizedBox(width: 6),
              Text(
                'EMERGENCY STEALTH • COVERT DURESS',
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                  color: AppColors.warningAmber,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),

        Text(
          'Create Duress PIN',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'A secret 4-digit code to use only if you are forced to disarm under coercion or threat.',
          style: TextStyle(
            fontSize: 14,
            height: 1.4,
            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
          ),
        ),
        const SizedBox(height: 14),

        // Modern 4-Pin Slots Visualizer (No duplicate dots!)
        _buildModernPinSlots(
          pin: _duressPin,
          activeColor: AppColors.warningAmber,
          isDark: isDark,
          isError: _duressPinError != null,
        ),
        const SizedBox(height: 14),

        // Creative Dual-State Comparison Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? AppColors.midnightDarkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.warningAmber.withValues(alpha: isDark ? 0.35 : 0.25),
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.warningAmber.withValues(alpha: isDark ? 0.08 : 0.04),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.warningAmber.withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.visibility_off_rounded,
                        color: AppColors.warningAmber, size: 16),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'To Attacker: App looks completely disarmed & safe',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.emergencyRed.withValues(alpha: isDark ? 0.15 : 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.emergencyRed.withValues(alpha: isDark ? 0.3 : 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.emergency_share_rounded,
                        color: AppColors.emergencyRedBright, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'In Secret: Transmits live GPS tracking & emergency SOS alerts to your guardians.',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.info_outline_rounded,
                      size: 13, color: AppColors.warningAmber),
                  const SizedBox(width: 6),
                  Text(
                    'Must be different from Safety PIN (${_safetyPin.isNotEmpty ? _safetyPin : '1234'})',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.warningAmber : const Color(0xFFD97706),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Numeric Keypad (showPinDots: false to prevent duplicate dots!)
        NumericPinPad(
          enteredPin: _duressPin,
          showPinDots: false,
          activeColor: AppColors.warningAmber,
          onPinChange: (newPin) {
            setState(() {
              _duressPin = newPin;
              _duressPinError = null;
            });
          },
          isError: _duressPinError != null,
          errorMessage: _duressPinError,
        ),
        const SizedBox(height: 20),

        // Next button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: () async {
              if (_duressPin.length < 4) {
                _duressPin = _safetyPin == '9999' ? '8888' : '9999';
              }
              if (_duressPin == _safetyPin) {
                setState(() {
                  _duressPinError = 'Duress PIN must be different from Safety PIN';
                });
                return;
              }
              setState(() {
                _step = 4;
              });
              await _requestPermissionsByDefault();
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primaryViolet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Continue to Emergency Contacts',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                SizedBox(width: 8),
                Icon(Icons.arrow_forward_rounded, size: 18),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep4(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Emergency Contacts',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Select trusted people from your phone address book to be alerted with your live GPS route when emergency triggers.',
          style: TextStyle(
            fontSize: 14,
            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
            height: 1.35,
          ),
        ),
        const SizedBox(height: 20),

        // Pick from Phone Contacts Primary Action Button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton.icon(
            onPressed: _isPickingContact ? null : _pickContactFromPhone,
            icon: _isPickingContact
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.contact_phone_rounded, size: 20),
            label: Text(
              _isPickingContact ? 'Opening Address Book...' : 'Pick from Phone Contacts',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primaryViolet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Manual Add option
        Center(
          child: TextButton.icon(
            onPressed: _showManualAddDialog,
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Or Enter Contact Manually'),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.primaryViolet,
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Selected Contacts Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Your Emergency Circle',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: (_selectedContacts.isNotEmpty ? AppColors.safeGreen : AppColors.warningAmber)
                    .withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${_selectedContacts.length} Added',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: _selectedContacts.isNotEmpty ? AppColors.safeGreen : AppColors.warningAmber,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Selected Contacts List
        if (_selectedContacts.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? AppColors.midnightDarkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? AppColors.midnightDarkCardBorder : AppColors.lightCardBorder,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.group_add_outlined,
                  size: 40,
                  color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                ),
                const SizedBox(height: 8),
                Text(
                  'No contacts in your circle yet',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Add at least 1 primary contact to ensure emergency dispatches reach your loved ones.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
          )
        else
          ..._selectedContacts.asMap().entries.map((entry) {
            final idx = entry.key;
            final contact = entry.value;
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.midnightDarkSurface : AppColors.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: contact.isPrimary
                      ? AppColors.primaryViolet.withValues(alpha: 0.5)
                      : (isDark ? AppColors.midnightDarkCardBorder : AppColors.lightCardBorder),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.primaryViolet.withValues(alpha: isDark ? 0.25 : 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        contact.name.isNotEmpty ? contact.name.substring(0, 1) : 'C',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryViolet,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              contact.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            if (contact.isPrimary) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: AppColors.safeGreen.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'PRIMARY',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.safeGreen,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${contact.phone} • ${contact.relationship}',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 20),
                    color: AppColors.emergencyRed,
                    onPressed: () {
                      setState(() {
                        _selectedContacts.removeAt(idx);
                        if (_selectedContacts.isNotEmpty && contact.isPrimary) {
                          _selectedContacts[0] = _selectedContacts[0].copyWith(isPrimary: true);
                        }
                      });
                    },
                  ),
                ],
              ),
            );
          }),

        const SizedBox(height: 28),

        // Complete Setup Button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: () {
              widget.onSetupComplete(
                _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Aanya Rao',
                _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : '+91 98112 34567',
                _safetyPin.isNotEmpty ? _safetyPin : '1234',
                _duressPin.isNotEmpty ? _duressPin : '9999',
                _selectedContacts,
              );
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primaryViolet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text(
              _selectedContacts.isNotEmpty
                  ? 'Complete Setup & Enter SheMove'
                  : 'Skip for Now & Enter SheMove',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
        ),
      ],
    );
  }
}
