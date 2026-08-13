import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../core/models/space.dart';
import '../../core/services/space_repository.dart';

class ReadSpacePage extends StatefulWidget {
  const ReadSpacePage({super.key});

  @override
  State<ReadSpacePage> createState() => _ReadSpacePageState();
}

class _ReadSpacePageState extends State<ReadSpacePage> {
  final MobileScannerController _scanner = MobileScannerController();
  final SpaceRepository _repository = SpaceRepository();
  bool _handled = false;

  Future<void> _read(String rawValue) async {
    if (_handled) return;
    final id = rawValue.trim();
    if (id.isEmpty) return;

    setState(() => _handled = true);
    final space = await _repository.getById(id);
    if (!mounted) return;

    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _ReadResultPage(spaceId: id, space: space),
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
  const _ReadResultPage({required this.spaceId, required this.space});

  final String spaceId;
  final Space? space;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Space Content')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(spaceId, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          if (space == null)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('This Space ID was read, but its content is not available on this device.'),
              ),
            )
          else ...[
            if (space!.title != null) Text(space!.title!, style: Theme.of(context).textTheme.titleLarge),
            if (space!.description != null) ...[
              const SizedBox(height: 8),
              Text(space!.description!),
            ],
            const SizedBox(height: 20),
            ...space!.content.map(
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
