import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/space.dart';

class SpaceApiService {
  SpaceApiService({String? baseUrl})
      : baseUrl = baseUrl ?? const String.fromEnvironment(
          'SPACE_API_BASE_URL',
          defaultValue: 'http://10.0.2.2:8787',
        );

  final String baseUrl;

  Uri _uri(String path, [Map<String, String>? query]) {
    final normalized = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    return Uri.parse('$normalized$path').replace(queryParameters: query);
  }

  Future<Map<String, dynamic>> getSpace(String spaceId) async {
    final response = await http.get(_uri('/spaces/${Uri.encodeComponent(spaceId)}'));
    _check(response, expected: 200);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createSpace(Space space) async {
    final response = await http.post(
      _uri('/spaces'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'spaceId': space.id,
        'createdAt': space.createdAt.toIso8601String(),
        'latitude': space.latitude,
        'longitude': space.longitude,
        'accuracyMeters': space.accuracyMeters,
        'imageReference': space.imagePath,
        'status': 'SUBMITTED',
        'content': space.content.map((item) => item.toJson()).toList(),
      }),
    );
    _check(response, expected: 201);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<void> recordEvent({
    required String eventType,
    required String spaceId,
    String? contentVersion,
    String? campaignId,
  }) async {
    final response = await http.post(
      _uri('/events'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'eventType': eventType,
        'spaceId': spaceId,
        'occurredAt': DateTime.now().toUtc().toIso8601String(),
        if (contentVersion != null) 'contentVersion': contentVersion,
        if (campaignId != null) 'campaignId': campaignId,
      }),
    );
    _check(response, expected: 202);
  }

  Future<List<Map<String, dynamic>>> nearby({
    required double latitude,
    required double longitude,
    required double radiusMeters,
  }) async {
    final response = await http.get(
      _uri('/spaces/nearby', {
        'lat': latitude.toString(),
        'lng': longitude.toString(),
        'radiusMeters': radiusMeters.toString(),
      }),
    );
    _check(response, expected: 200);
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return (body['spaces'] as List<dynamic>? ?? const [])
        .map((item) => item as Map<String, dynamic>)
        .toList();
  }

  void _check(http.Response response, {required int expected}) {
    if (response.statusCode != expected) {
      throw SpaceApiException(
        'Space API returned ${response.statusCode}: ${response.body}',
      );
    }
  }
}

class SpaceApiException implements Exception {
  const SpaceApiException(this.message);

  final String message;

  @override
  String toString() => message;
}
