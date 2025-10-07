import 'package:flutter/material.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Ride Chat')),
      body: Center(child: Text('Firestore group chat placeholder')),
    );
  }
}
