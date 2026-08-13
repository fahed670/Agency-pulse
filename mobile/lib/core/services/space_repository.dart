import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';

import '../models/space.dart';

class SpaceRepository {
  static const _fileName = 'spaces.json';

  Future<List<Space>> getAll() async {
    final file = await _file();
    if (!await file.exists()) return [];

    final raw = await file.readAsString();
    if (raw.trim().isEmpty) return [];

    final decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .map((item) => Space.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> save(Space space) async {
    final spaces = await getAll();
    final updated = [space, ...spaces.where((item) => item.id != space.id)];
    final file = await _file();
    await file.writeAsString(
      jsonEncode(updated.map((item) => item.toJson()).toList()),
    );
  }

  Future<File> _file() async {
    final directory = await getApplicationDocumentsDirectory();
    return File('${directory.path}/$_fileName');
  }
}
