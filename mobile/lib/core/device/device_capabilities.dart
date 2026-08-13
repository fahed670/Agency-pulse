import 'package:camera/camera.dart';
import 'package:geolocator/geolocator.dart';

/// Thin adapters over capabilities already provided by the device OS.
/// Space ID owns the product logic; the device owns the hardware services.
class DeviceCapabilities {
  Future<List<CameraDescription>> cameras() => availableCameras();

  Future<Position> currentLocation() => Geolocator.getCurrentPosition();

  Future<bool> ensureLocationPermission() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }
}
