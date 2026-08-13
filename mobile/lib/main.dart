import 'package:flutter/material.dart';

import 'features/explore/explore_page.dart';
import 'features/scan/scan_page.dart';

void main() {
  runApp(const SpaceIdApp());
}

class SpaceIdApp extends StatelessWidget {
  const SpaceIdApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Space ID',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF111827)),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Space ID')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.location_on_outlined, size: 72),
              const SizedBox(height: 20),
              Text(
                'Space ID',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Turn a physical place into an identifiable digital space.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const Spacer(),
              FilledButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ScanPage()),
                  );
                },
                icon: const Icon(Icons.camera_alt_outlined),
                label: const Text('Scan a Space'),
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(54),
                ),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ExplorePage()),
                  );
                },
                icon: const Icon(Icons.map_outlined),
                label: const Text('Explore Spaces'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(54),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
