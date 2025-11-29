# Isaac Powerpack 🔋

Isaac Powerpack’s goal is to build a Foxglove extension that simplifies NVIDIA Isaac ROS development with Foxglove Studio and NVIDIA Jetson boards.

🚧 This project is in early development. Many features are still in progress and subject to breaking changes.

🙋 We’ll be opening this project for contributions soon.

[Read the Docs to Learn More](docs/index.md)

## Current Features
- [ ] **(In progress)** Detection 2D Module
  - [ ] `vision_msgs/msg/Detection2DArray` to `foxglove.ImageAnnotations` Converter
  - [ ] Detection 2D Panel to display image and bounding box from Jetson Orin Device
  - [ ] Display bounding box, Id, Object Label
  - [ ] Custom mapping between Object Label and Id
- [ ] Isaac Sim Camera Controller Module
  - [ ] Isaac Sim extension Camera Spawner and required ROS2 omnigraph generator for [Hawk Stereo Camera](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/assets/usd_assets_camera_depth_sensors.html#hawk-stereo-camera)
  - [ ] Keyboard Control via Foxglove
  - [ ] Joy Control via Foxglove. Support [Logitech F710 Gamepad](https://www.logitechg.com/th-th/products/gamepads/f710-wireless-gamepad.html) and [PS5 DualSense wireless controller](https://www.playstation.com/en-th/accessories/dualsense-wireless-controller/)
  - [ ] Add Support to [Intel Realsense Depth Camera D455](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/assets/usd_assets_camera_depth_sensors.html#hawk-stereo-camera)
- [ ] Detection 3D Module
- [ ] Jetson Stat Module

## Installation
?

## Usage
Here is the table of Isaac Powerpack features mapping to their corresponding Isaac ROS Packages or Isaac Sim Extensions:

| Feature | Package |
| :------ | :------ |
| ?       | ?       |


## Support Matrix

| Platform          | Version / Validation                                                         |
| :---------------- | :--------------------------------------------------------------------------- |
| Device            | ✅ Jetson AGX Orin 32 GB — Tested <br> ⏳ Jetson Orin Nano 8 GB — Pending Test |
| Isaac ROS Version | `release-3.2`                                                                |
| Isaac Sim         | `5.1.0`                                                                      |

<br>
 
> 💡 Notes
> - This project is actively developed and tested with Isaac ROS release-3.2 on NVIDIA Jetson AGX Orin 32GB. 
> - The Jetson Orin Nano 8GB (also known as the Jetson Nano Super Developer Kit) is scheduled for upcoming testing.
> - Isaac Sim is tested on Ubuntu 22.04.


## Contribution
See [Contribution Guide](docs/contributing.md)

## License
[Apache-2.0](LICENSE).