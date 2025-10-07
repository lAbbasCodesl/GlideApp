import 'package:flutter/material.dart';
import '../services/api_client.dart';

class HomeSearchScreen extends StatefulWidget {
  const HomeSearchScreen({super.key});

  @override
  State<HomeSearchScreen> createState() => _HomeSearchScreenState();
}

class _HomeSearchScreenState extends State<HomeSearchScreen> {
  final _formKey = GlobalKey<FormState>();
  final _pickupLat = TextEditingController(text: '40.741');
  final _pickupLng = TextEditingController(text: '-74.003');
  final _dropLat = TextEditingController(text: '40.732');
  final _dropLng = TextEditingController(text: '-73.991');
  DateTime _dateTime = DateTime.now();
  bool _loading = false;

  @override
  void dispose() {
    _pickupLat.dispose();
    _pickupLng.dispose();
    _dropLat.dispose();
    _dropLng.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final api = ApiClient();
      final results = await api.searchRides(
        pickupLat: double.parse(_pickupLat.text),
        pickupLng: double.parse(_pickupLng.text),
        dropLat: double.parse(_dropLat.text),
        dropLng: double.parse(_dropLng.text),
        dateTime: _dateTime,
      );
      if (!mounted) return;
      Navigator.pushNamed(context, '/rides', arguments: results);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search Rides')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Row(children: [
                Expanded(child: TextFormField(controller: _pickupLat, decoration: const InputDecoration(labelText: 'Pickup Lat'), keyboardType: TextInputType.number, validator: (v) => v!.isEmpty ? 'Required' : null)),
                const SizedBox(width: 8),
                Expanded(child: TextFormField(controller: _pickupLng, decoration: const InputDecoration(labelText: 'Pickup Lng'), keyboardType: TextInputType.number, validator: (v) => v!.isEmpty ? 'Required' : null)),
              ]),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: TextFormField(controller: _dropLat, decoration: const InputDecoration(labelText: 'Drop Lat'), keyboardType: TextInputType.number, validator: (v) => v!.isEmpty ? 'Required' : null)),
                const SizedBox(width: 8),
                Expanded(child: TextFormField(controller: _dropLng, decoration: const InputDecoration(labelText: 'Drop Lng'), keyboardType: TextInputType.number, validator: (v) => v!.isEmpty ? 'Required' : null)),
              ]),
              const SizedBox(height: 8),
              ListTile(
                title: Text('Date/Time: ${_dateTime.toLocal()}'),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final date = await showDatePicker(context: context, initialDate: _dateTime, firstDate: DateTime.now().subtract(const Duration(days: 1)), lastDate: DateTime.now().add(const Duration(days: 30)));
                  if (date == null) return;
                  final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(_dateTime));
                  if (time == null) return;
                  setState(() {
                    _dateTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                  });
                },
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loading ? null : _search,
                child: _loading ? const CircularProgressIndicator() : const Text('Search'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
