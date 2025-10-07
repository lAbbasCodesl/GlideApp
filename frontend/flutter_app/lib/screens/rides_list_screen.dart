import 'package:flutter/material.dart';

class RidesListScreen extends StatelessWidget {
  const RidesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final results = ModalRoute.of(context)!.settings.arguments as List<dynamic>? ?? [];
    return Scaffold(
      appBar: AppBar(title: const Text('Available Rides')),
      body: ListView.builder(
        itemCount: results.length,
        itemBuilder: (context, index) {
          final r = results[index] as Map<String, dynamic>;
          return ListTile(
            title: Text(r['driverName']?.toString() ?? 'Driver'),
            subtitle: Text('Time: ${r['startTime'] ?? ''}  Seats: ${r['availableSeats'] ?? 0}'),
            trailing: Text(((r['matchScore'] ?? 0.0) * 100).toStringAsFixed(0) + '%'),
            onTap: () => Navigator.pushNamed(context, '/rideDetails', arguments: r),
          );
        },
      ),
    );
  }
}
