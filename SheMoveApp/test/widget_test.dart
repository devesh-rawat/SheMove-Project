import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shemoveapp/main.dart';
import 'package:shemoveapp/models/models.dart';
import 'package:shemoveapp/state/safeloop_controller.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('SafeLoop Models & Controller Tests', () {
    test('Initial controller state is correct', () {
      final controller = SafeLoopController();
      expect(controller.userProfile.name, 'Aanya Rao');
      expect(controller.userProfile.isSetupComplete, false);
      expect(controller.currentScreen, SafeLoopScreen.onboarding);
      expect(controller.contacts.length, 0);
      expect(controller.history.length, 0);
      expect(controller.events.isEmpty, true);
      expect(controller.isOnline, true);
      expect(controller.isCovertDistressActive, false);
      controller.dispose();
    });

    test('Complete onboarding transitions to setup', () {
      final controller = SafeLoopController();
      controller.completeOnboarding();
      expect(controller.currentScreen, SafeLoopScreen.setup);
      controller.dispose();
    });

    test('Complete security setup transitions to home and updates profile', () {
      final controller = SafeLoopController();
      controller.completeSecuritySetup('Priya Sharma', '+91 98765 43210', '5678');
      expect(controller.userProfile.name, 'Priya Sharma');
      expect(controller.userProfile.phone, '+91 98765 43210');
      expect(controller.userProfile.safetyPin, '5678');
      expect(controller.userProfile.isSetupComplete, true);
      expect(controller.currentScreen, SafeLoopScreen.home);
      controller.dispose();
    });

    test('Start protected journey creates active journey and ticks progress', () {
      final controller = SafeLoopController();
      controller.startJourney(
        start: 'Sector 29, Gurugram',
        dest: 'Cyber City',
        mode: TransportMode.cab,
        vehicleNo: 'HR 26 DQ 1234',
        durationMinutes: 20,
        intervalMinutes: 5,
        geofence: true,
      );

      expect(controller.activeJourney != null, true);
      expect(controller.activeJourney!.startAddress, 'Sector 29, Gurugram');
      expect(controller.activeJourney!.destinationAddress, 'Cyber City');
      expect(controller.activeJourney!.status, JourneyStatus.active);
      expect(controller.currentScreen, SafeLoopScreen.activeJourney);
      expect(controller.checkInSecondsRemaining, 5 * 60);
      controller.dispose();
    });

    test('Covert duress PIN sets covert distress flag and shows success toast', () {
      final controller = SafeLoopController();
      controller.startJourney(
        start: 'A',
        dest: 'B',
        mode: TransportMode.cab,
        vehicleNo: '',
        durationMinutes: 10,
        intervalMinutes: 5,
        geofence: true,
      );

      controller.triggerCheckInDue();
      expect(controller.currentScreen, SafeLoopScreen.safetyCheckIn);

      // Enter duress PIN '9999'
      controller.handleCheckInSafetyConfirm('9999');
      expect(controller.isCovertDistressActive, true);
      expect(controller.activeJourney!.status, JourneyStatus.covertDuress);
      expect(controller.toastMessage, 'Safety confirmed');
      controller.dispose();
    });

    test('Normal PIN resets check-in timer without duress', () {
      final controller = SafeLoopController();
      controller.startJourney(
        start: 'A',
        dest: 'B',
        mode: TransportMode.cab,
        vehicleNo: '',
        durationMinutes: 10,
        intervalMinutes: 5,
        geofence: true,
      );

      controller.triggerCheckInDue();
      // Enter standard safety PIN '1234'
      controller.handleCheckInSafetyConfirm('1234');
      expect(controller.isCovertDistressActive, false);
      expect(controller.activeJourney!.status, JourneyStatus.active);
      expect(controller.checkInSecondsRemaining, 5 * 60);
      controller.dispose();
    });

    test('Demo scenarios trigger appropriately', () {
      final controller = SafeLoopController();
      controller.runDemoScenario('critical_sos');
      expect(controller.currentScreen, SafeLoopScreen.emergencyActive);
      expect(controller.activeJourney!.status, JourneyStatus.emergency);

      // Disarm emergency with safety PIN
      final disarmed = controller.disarmEmergency('1234');
      expect(disarmed, true);
      controller.dispose();
    });

    test('Add and remove trusted contacts', () {
      final controller = SafeLoopController();
      controller.addContact('Kavita Rao', '+91 99887 76655', 'Mother');
      expect(controller.contacts.any((c) => c.name == 'Kavita Rao'), true);

      final added = controller.contacts.firstWhere((c) => c.name == 'Kavita Rao');
      controller.setPrimaryContact(added.id);
      expect(controller.contacts.firstWhere((c) => c.id == added.id).isPrimary, true);

      controller.removeContact(added.id);
      expect(controller.contacts.any((c) => c.id == added.id), false);
      controller.dispose();
    });
  });

  group('SafeLoop Widget Tests', () {
    testWidgets('App renders onboarding on initial launch and navigates through setup',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(const SafeLoopApp());
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('SafeLoop'), findsOneWidget);
      expect(find.text('Skip'), findsOneWidget);
      expect(find.text('Protected Journeys'), findsOneWidget);

      // Tap Skip to go to Setup
      await tester.tap(find.text('Skip'));
      await tester.pump(const Duration(milliseconds: 300));

      // Step 1: Profile & Verification
      expect(find.text('Security Setup'), findsOneWidget);
      expect(find.text('Your Profile & Verification'), findsOneWidget);
      expect(find.text('Continue to Safety PIN'), findsOneWidget);

      // Tap Continue to Safety PIN
      await tester.ensureVisible(find.text('Continue to Safety PIN'));
      await tester.tap(find.text('Continue to Safety PIN'));
      await tester.pump(const Duration(milliseconds: 300));

      // Step 2: Safety PIN Setup
      expect(find.text('Create Safety PIN'), findsOneWidget);
      expect(find.text('Continue to Duress PIN'), findsOneWidget);

      // Tap Continue to Duress PIN
      await tester.ensureVisible(find.text('Continue to Duress PIN'));
      await tester.tap(find.text('Continue to Duress PIN'));
      await tester.pump(const Duration(milliseconds: 300));

      // Step 3: Duress PIN Setup
      expect(find.text('Create Duress PIN'), findsOneWidget);
      expect(find.text('Continue to Emergency Contacts'), findsOneWidget);

      // Tap Continue to Emergency Contacts
      await tester.ensureVisible(find.text('Continue to Emergency Contacts'));
      await tester.tap(find.text('Continue to Emergency Contacts'));
      await tester.pump(const Duration(milliseconds: 300));

      // Step 4: Emergency Contacts
      expect(find.text('Emergency Contacts'), findsOneWidget);
      expect(find.text('Skip for Now & Enter SheMove'), findsOneWidget);

      // Tap Skip for Now
      await tester.ensureVisible(find.text('Skip for Now & Enter SheMove'));
      await tester.tap(find.text('Skip for Now & Enter SheMove'));
      await tester.pump(const Duration(milliseconds: 300));

      // Landed on Home screen!
      expect(find.text('Start Protected Journey'), findsOneWidget);
      expect(find.text('Current Telemetry Area'), findsOneWidget);
      expect(find.text('Trusted Emergency Circle'), findsOneWidget);
    });

    testWidgets('Home screen navigation and circle management works', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final controller = SafeLoopController();
      controller.completeSecuritySetup('Aanya Rao', '+91 98112 34567', '1234');

      await tester.pumpWidget(
        MaterialApp(
          home: SafeLoopMainScaffold(controller: controller),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Start Protected Journey'), findsOneWidget);
      expect(find.text('Aanya Rao'), findsOneWidget);
      expect(find.text('Trusted Emergency Circle'), findsOneWidget);

      // Tap Manage contacts
      await tester.tap(find.text('Manage'));
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Trusted Contacts'), findsOneWidget);

      // Tap Back to return to Home
      controller.navigateBack();
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Start Protected Journey'), findsOneWidget);

      // Tap View All history
      await tester.tap(find.text('View All'));
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Safety & Journey History'), findsOneWidget);

      controller.dispose();
    });

    testWidgets('Journey completion to Home navigation renders HomeScreen cleanly', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final controller = SafeLoopController();
      controller.completeSecuritySetup('Aanya Rao', '+91 98112 34567', '1234');
      controller.startJourney(
        start: 'Connaught Place',
        dest: 'Hauz Khas',
        mode: TransportMode.cab,
        vehicleNo: 'DL 1Y 1234',
        durationMinutes: 20,
        intervalMinutes: 5,
        geofence: true,
      );
      controller.completeActiveJourney();

      await tester.pumpWidget(
        MaterialApp(
          home: SafeLoopMainScaffold(controller: controller),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Return to SheMove Home'), findsOneWidget);

      await tester.tap(find.text('Return to SheMove Home'));
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Start Protected Journey'), findsOneWidget);
      expect(find.text('Aanya Rao'), findsOneWidget);
      controller.dispose();
    });
  });
}
