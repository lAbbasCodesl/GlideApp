import 'package:flutter/material.dart';

class RideDetailsScreen extends StatelessWidget {
  const RideDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ride = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
    return Scaffold(
      appBar: AppBar(title: const Text('Ride Details')),
      body: ride == null
          ? const Center(child: Text('No ride selected'))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Driver: ${ride['driverName']}'),
                  const SizedBox(height: 8),
                  Text('Start: ${ride['startLocation'] ?? ''}'),
                  Text('End: ${ride['endLocation'] ?? ''}'),
                  const SizedBox(height: 8),
                  Text('Time: ${ride['startTime']}'),
                  Text('Seats: ${ride['availableSeats']}'),
                  Text('Fare: ${ride['fare']}'),
                  const Spacer(),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {},
                          child: const Text('Join Ride'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {},
                          child: const Text('Cancel Request'),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
    );
  }
}
