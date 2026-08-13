import 'package:flutter/material.dart';

import '../../core/models/space.dart';
import '../../core/services/space_repository.dart';
import 'space_details_page.dart';

class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});

  @override
  State<ExplorePage> createState() => _ExplorePageState();
}

class _ExplorePageState extends State<ExplorePage> {
  final SpaceRepository _repository = SpaceRepository();
  late Future<List<Space>> _spaces;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  void _refresh() => _spaces = _repository.getAll();

  Future<void> _open(Space space) async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => SpaceDetailsPage(space: space)),
    );
    if (mounted) setState(_refresh);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Explore Spaces'),
        actions: [
          IconButton(onPressed: () => setState(_refresh), icon: const Icon(Icons.refresh)),
        ],
      ),
      body: FutureBuilder<List<Space>>(
        future: _spaces,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Unable to load Spaces: ${snapshot.error}'));
          }

          final spaces = snapshot.data ?? const <Space>[];
          if (spaces.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.location_searching, size: 56),
                    SizedBox(height: 16),
                    Text('No Spaces created on this device yet.'),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: spaces.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final space = spaces[index];
              return Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.place_outlined)),
                  title: Text(space.id),
                  subtitle: Text(
                    '${space.latitude.toStringAsFixed(5)}, ${space.longitude.toStringAsFixed(5)}\n'
                    'Accuracy ${space.accuracyMeters?.toStringAsFixed(1) ?? '—'} m',
                  ),
                  isThreeLine: true,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _open(space),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
