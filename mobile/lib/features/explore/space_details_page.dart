import 'dart:io';

import 'package:flutter/material.dart';

import '../../core/models/space.dart';
import '../../core/services/space_repository.dart';

class SpaceDetailsPage extends StatelessWidget {
  const SpaceDetailsPage({super.key, required this.space});

  final Space space;

  Future<void> _delete(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Space?'),
        content: Text('Remove ${space.id} from this device?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;
    await SpaceRepository().delete(space.id);
    if (context.mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Space Details'),
        actions: [
          IconButton(
            tooltip: 'Delete',
            onPressed: () => _delete(context),
            icon: const Icon(Icons.delete_outline),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (File(space.imagePath).existsSync())
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.file(File(space.imagePath), height: 240, fit: BoxFit.cover),
            )
          else
            Container(
              height: 180,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
              ),
              child: const Icon(Icons.image_not_supported_outlined, size: 56),
            ),
          const SizedBox(height: 20),
          Text(space.id, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 6),
          const Text('Local Space record'),
          const SizedBox(height: 24),
          _InfoTile(label: 'Latitude', value: space.latitude.toStringAsFixed(7)),
          _InfoTile(label: 'Longitude', value: space.longitude.toStringAsFixed(7)),
          _InfoTile(
            label: 'Location accuracy',
            value: space.accuracyMeters == null ? 'Unknown' : '${space.accuracyMeters!.toStringAsFixed(1)} m',
          ),
          _InfoTile(label: 'Created', value: space.createdAt.toLocal().toString()),
          const SizedBox(height: 20),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'This record is currently stored on this device. The shared Space service will make the same Space available across users and devices.',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(label),
        subtitle: Text(value),
      );
}
