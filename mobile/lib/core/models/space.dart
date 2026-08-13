class Space {
  const Space({
    required this.id,
    required this.createdAt,
    required this.latitude,
    required this.longitude,
    required this.accuracyMeters,
    required this.imagePath,
    this.title,
    this.description,
    this.content,
  });

  final String id;
  final DateTime createdAt;
  final double latitude;
  final double longitude;
  final double accuracyMeters;
  final String imagePath;
  final String? title;
  final String? description;
  final List<SpaceContent> content;

  Map<String, dynamic> toJson() => {
        'id': id,
        'createdAt': createdAt.toIso8601String(),
        'latitude': latitude,
        'longitude': longitude,
        'accuracyMeters': accuracyMeters,
        'imagePath': imagePath,
        'title': title,
        'description': description,
        'content': content.map((item) => item.toJson()).toList(),
      };

  factory Space.fromJson(Map<String, dynamic> json) => Space(
        id: json['id'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        accuracyMeters: (json['accuracyMeters'] as num).toDouble(),
        imagePath: json['imagePath'] as String,
        title: json['title'] as String?,
        description: json['description'] as String?,
        content: ((json['content'] as List<dynamic>?) ?? const [])
            .map((item) => SpaceContent.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
}

class SpaceContent {
  const SpaceContent({required this.type, required this.value});

  final String type;
  final String value;

  Map<String, dynamic> toJson() => {'type': type, 'value': value};

  factory SpaceContent.fromJson(Map<String, dynamic> json) => SpaceContent(
        type: json['type'] as String,
        value: json['value'] as String,
      );
}
