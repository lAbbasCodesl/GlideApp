import 'package:flutter/material.dart';

class MyRidesScreen extends StatelessWidget {
  const MyRidesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('My Rides')),
      body: Center(child: Text('Requested and joined rides will appear here')),
    );
  }
}
