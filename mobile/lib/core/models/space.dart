class Space {
  const Space({
    required this.id,
    required this.createdAt,
    required this.latitude,
    required this.longitude,
    required this.accuracyMeters,
    required this.imagePath,
  });

  final String id;
  final DateTime createdAt;
  final double latitude;
  final double longitude;
  final double accuracyMeters;
  final String imagePath;

  Map<String, dynamic> toJson() => {
        'id': id,
        'createdAt': createdAt.toIso8601String(),
        'latitude': latitude,
        'longitude': longitude,
        'accuracyMeters': accuracyMeters,
        'imagePath': imagePath,
      };

  factory Space.fromJson(Map<String, dynamic> json) => Space(
        id: json['id'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        accuracyMeters: (json['accuracyMeters'] as num).toDouble(),
        imagePath: json['imagePath'] as String,
      );
}
