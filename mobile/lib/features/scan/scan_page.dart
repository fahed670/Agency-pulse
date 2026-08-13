import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import '../../core/models/space.dart';
import '../../core/services/location_service.dart';
import '../../core/services/space_api_service.dart';
import '../../core/services/space_repository.dart';

class ScanPage extends StatefulWidget {
  const ScanPage({super.key});

  @override
  State<ScanPage> createState() => _ScanPageState();
}

class _ScanPageState extends State<ScanPage> {
  CameraController? _controller;
  Future<void>? _initialization;
  String? _error;
  bool _capturing = false;
  final LocationService _locationService = LocationService();
  final SpaceRepository _spaceRepository = SpaceRepository();
  final SpaceApiService _api = SpaceApiService();
  final Uuid _uuid = const Uuid();

  @override
  void initState() {
    super.initState();
    _initialization = _initialize();
  }

  Future<void> _initialize() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        throw StateError('No camera is available on this device.');
      }

      final controller = CameraController(
        cameras.first,
        ResolutionPreset.high,
        enableAudio: false,
      );
      await controller.initialize();

      if (!mounted) {
        await controller.dispose();
        return;
      }

      setState(() => _controller = controller);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    }
  }

  Future<void> _capture() async {
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized || _capturing) return;

    setState(() => _capturing = true);
    try {
      final location = await _locationService.getCurrentLocation();
      final image = await controller.takePicture();
      final space = Space(
        id: 'SP-${_uuid.v4().substring(0, 8).toUpperCase()}',
        createdAt: DateTime.now().toUtc(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracyMeters ?? 0,
        imagePath: image.path,
      );

      // Persist locally first so creation remains usable when connectivity is absent.
      await _spaceRepository.save(space);

      var syncMessage = 'Saved locally. It will be available on this device.';
      try {
        await _api.createSpace(space);
        syncMessage = 'Space created and synchronized with the shared Space ID service.';
      } catch (_) {
        syncMessage = 'Space created locally. Shared synchronization is pending connectivity.';
      }

      if (!mounted) return;
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        builder: (context) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.check_circle_outline, size: 48),
                const SizedBox(height: 12),
                Text('Space created', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(space.id, style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 16),
                Text('Latitude: ${space.latitude.toStringAsFixed(6)}'),
                Text('Longitude: ${space.longitude.toStringAsFixed(6)}'),
                Text('Accuracy: ${space.accuracyMeters.toStringAsFixed(1)} m'),
                const SizedBox(height: 16),
                Text(syncMessage),
              ],
            ),
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _capturing = false);
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: const Text('Scan Space'),
      ),
      body: FutureBuilder<void>(
        future: _initialization,
        builder: (context, snapshot) {
          if (_error != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(_error!, style: const TextStyle(color: Colors.white)),
              ),
            );
          }

          final controller = _controller;
          if (controller == null || !controller.value.isInitialized) {
            return const Center(child: CircularProgressIndicator());
          }

          return Stack(
            fit: StackFit.expand,
            children: [
              CameraPreview(controller),
              Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 32),
                  child: FloatingActionButton.large(
                    onPressed: _capturing ? null : _capture,
                    child: _capturing
                        ? const CircularProgressIndicator()
                        : const Icon(Icons.camera_alt),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
