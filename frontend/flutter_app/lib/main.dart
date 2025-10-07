import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'screens/login_register_screen.dart';
import 'screens/home_search_screen.dart';
import 'screens/rides_list_screen.dart';
import 'screens/ride_details_screen.dart';
import 'screens/my_rides_screen.dart';
import 'screens/chat_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const GlideApp());
}

class GlideApp extends StatelessWidget {
  const GlideApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GLIDE',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
      initialRoute: '/login',
      routes: {
        '/login': (_) => const LoginRegisterScreen(),
        '/home': (_) => const HomeSearchScreen(),
        '/rides': (_) => const RidesListScreen(),
        '/rideDetails': (_) => const RideDetailsScreen(),
        '/myRides': (_) => const MyRidesScreen(),
        '/chat': (_) => const ChatScreen(),
      },
    );
  }
}
