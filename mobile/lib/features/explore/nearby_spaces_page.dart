import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../core/services/location_service.dart';
import '../../core/services/space_api_service.dart';

class NearbySpacesPage extends StatefulWidget {
  const NearbySpacesPage({super.key});

  @override
  State<NearbySpacesPage> createState() => _NearbySpacesPageState();
}

class _NearbySpacesPageState extends State<NearbySpacesPage> {
  final LocationService _location = LocationService();
  final SpaceApiService _api = SpaceApiService();
  final MapController _map = MapController();

  bool _loading = true;
  String? _error;
  double? _latitude;
  double? _longitude;
  List<Map<String, dynamic>> _spaces = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final location = await _location.getCurrentLocation();
      final latitude = location.latitude;
      final longitude = location.longitude;
      final spaces = await _api.nearby(
        latitude: latitude,
        longitude: longitude,
        radiusMeters: 5000,
      );
      if (!mounted) return;
      setState(() {
        _latitude = latitude;
        _longitude = longitude;
        _spaces = spaces;
        _loading = false;
      });
      _map.move(LatLng(latitude, longitude), 15);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final lat = _latitude;
    final lng = _longitude;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nearby Spaces'),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
              : lat == null || lng == null
                  ? const Center(child: Text('Location unavailable.'))
                  : Column(
                      children: [
                        Expanded(
                          flex: 3,
                          child: FlutterMap(
                            mapController: _map,
                            options: MapOptions(
                              initialCenter: LatLng(lat, lng),
                              initialZoom: 15,
                            ),
                            children: [
                              TileLayer(
                                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                userAgentPackageName: 'com.spaceid.app',
                              ),
                              MarkerLayer(
                                markers: [
                                  Marker(
                                    point: LatLng(lat, lng),
                                    width: 44,
                                    height: 44,
                                    child: const Icon(Icons.my_location, size: 32),
                                  ),
                                  ..._spaces.map((space) {
                                    final spaceLat = NumberParser.doubleValue(space['latitude']);
                                    final spaceLng = NumberParser.doubleValue(space['longitude']);
                                    return Marker(
                                      point: LatLng(spaceLat, spaceLng),
                                      width: 44,
                                      height: 44,
                                      child: const Icon(Icons.location_on, size: 36),
                                    );
                                  }),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: _spaces.isEmpty
                              ? const Center(child: Text('No Spaces found within 5 km.'))
                              : ListView.separated(
                                  padding: const EdgeInsets.all(12),
                                  itemCount: _spaces.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                                  itemBuilder: (context, index) {
                                    final space = _spaces[index];
                                    return Card(
                                      child: ListTile(
                                        leading: const Icon(Icons.place_outlined),
                                        title: Text('${space['spaceId'] ?? 'Space'}'),
                                        subtitle: Text(
                                          '${space['latitude']}, ${space['longitude']}',
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ),
                      ],
                    ),
    );
  }
}

class NumberParser {
  static double doubleValue(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse('$value') ?? 0;
  }
}
