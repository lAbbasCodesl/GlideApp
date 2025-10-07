import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class ApiClient {
  final String baseUrl;
  ApiClient() : baseUrl = dotenv.env['BACKEND_BASE_URL'] ?? 'http://localhost:8080';

  Future<List<dynamic>> searchRides({
    required double pickupLat,
    required double pickupLng,
    required double dropLat,
    required double dropLng,
    required DateTime dateTime,
    double radiusKm = 5,
  }) async {
    final uri = Uri.parse('$baseUrl/search/rides');
    final resp = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'pickup': {'lat': pickupLat, 'lng': pickupLng},
        'drop': {'lat': dropLat, 'lng': dropLng},
        'dateTime': dateTime.toUtc().toIso8601String(),
        'radiusKm': radiusKm,
      }),
    );
    if (resp.statusCode != 200) {
      throw Exception('Search failed: ${resp.statusCode} ${resp.body}');
    }
    return jsonDecode(resp.body) as List<dynamic>;
  }
}
