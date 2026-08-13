import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../core/models/space.dart';
import '../../core/services/space_api_service.dart';
import '../../core/services/space_repository.dart';

class ReadSpacePage extends StatefulWidget {
  const ReadSpacePage({super.key});

  @override
  State<ReadSpacePage> createState() => _ReadSpacePageState();
}

class _ReadSpacePageState extends State<ReadSpacePage> {
  final MobileScannerController _scanner = MobileScannerController();
  final SpaceRepository _repository = SpaceRepository();
  final SpaceApiService _api = SpaceApiService();
  bool _handled = false;

  Future<void> _read(String rawValue) async {
    if (_handled) return;
    final id = rawValue.trim();
    if (id.isEmpty) return;

    setState(() => _handled = true);

    Map<String, dynamic>? remote;
    Space? local;
    String? error;

    try {
      remote = await _api.getSpace(id);
      await _api.recordEvent(eventType: 'SPACE_READ', spaceId: id);
    } catch (e) {
      error = e.toString();
      local = await _repository.getById(id);
    }

    if (!mounted) return;

    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _ReadResultPage(
          spaceId: id,
          remoteSpace: remote,
          localSpace: local,
          error: error,
        ),
      ),
    );
    if (mounted) setState(() => _handled = false);
  }

  @override
  void dispose() {
    _scanner.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: const Text('Read Space'),
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          MobileScanner(
            controller: _scanner,
            onDetect: (capture) {
              for (final barcode in capture.barcodes) {
                final value = barcode.rawValue;
                if (value != null) {
                  _read(value);
                  break;
                }
              }
            },
          ),
          Center(
            child: Container(
              width: 260,
              height: 180,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          const Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: EdgeInsets.only(bottom: 40, left: 24, right: 24),
              child: Text(
                'Point the camera at a Space ID marker to read its contents.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReadResultPage extends StatelessWidget {
  const _ReadResultPage({
    required this.spaceId,
    required this.remoteSpace,
    required this.localSpace,
    required this.error,
  });

  final String spaceId;
  final Map<String, dynamic>? remoteSpace;
  final Space? localSpace;
  final String? error;

  @override
  Widget build(BuildContext context) {
    final remote = remoteSpace;
    final local = localSpace;
    final title = remote?['title'] as String? ?? local?.title;
    final description = remote?['description'] as String? ?? local?.description;
    final content = (remote?['content'] as List<dynamic>? ?? const []);

    return Scaffold(
      appBar: AppBar(title: const Text('Space Content')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(spaceId, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 12),
          if (remote != null)
            const Chip(
              avatar: Icon(Icons.cloud_done, size: 18),
              label: Text('Shared Space'),
            )
          else
            const Chip(
              avatar: Icon(Icons.phone_android, size: 18),
              label: Text('Offline / local copy'),
            ),
          if (error != null && local == null) ...[
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text('Space could not be resolved from the shared service.\n$error'),
              ),
            ),
          ],
          if (title != null) ...[
            const SizedBox(height: 20),
            Text(title, style: Theme.of(context).textTheme.titleLarge),
          ],
          if (description != null) ...[
            const SizedBox(height: 8),
            Text(description),
          ],
          if (remote != null) ...[
            const SizedBox(height: 20),
            ...content.map(
              (item) {
                final data = item as Map<String, dynamic>;
                final type = data['type'] ?? data['contentType'] ?? 'INFO';
                final value = data['value'] ?? data['body'] ?? '';
                return Card(
                  child: ListTile(
                    leading: Icon(type == 'VIDEO' ? Icons.play_circle_outline : Icons.info_outline),
                    title: Text(type.toString().toUpperCase()),
                    subtitle: Text(value.toString()),
                  ),
                );
              },
            ),
          ] else if (local != null) ...[
            const SizedBox(height: 20),
            ...local.content.map(
              (item) => Card(
                child: ListTile(
                  leading: Icon(item.type == 'video' ? Icons.play_circle_outline : Icons.info_outline),
                  title: Text(item.type.toUpperCase()),
                  subtitle: Text(item.value),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
