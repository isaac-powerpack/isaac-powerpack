<p align="center">
    <img src="https://raw.githubusercontent.com/bemunin/isaac-powerpack/main/docs/public/logo.svg" width="400"/>
</p>

✨ Isaac Powerpack’s goal is to build a Foxglove extension that simplifies NVIDIA Isaac ROS development on NVIDIA Jetson boards using Foxglove Studio.

🚧 This project is in early development. Many features are still in progress and subject to breaking changes.

🙋 We’ll open this project for contributions soon.

[Read the Docs to Learn More](docs/index.md)

## Features & Milestones

<details open>
<summary><b>v0.1.0 (🏃 In Progress)</b></summary>

- [x] Detection2D Module
  - [x] Create a Detection2D panel for displaying images
  - [x] Implement a `vision_msgs/msg/Detection2DArray` to `foxglove.ImageAnnotations` converter
  - [x] Display 2D bounding boxes on images
  - [x] Support custom object labels and IDs through Foxglove variables
  - [x] Display object IDs, confidence scores, and label information
- [ ] Pow CLI
  - [ ] Add `sim` or `sim run` command to launch Isaac Sim using Isaac Powerpack preconfigured settings
  - [x] Add `sim add local-assets` command to install Isaac Sim local assets for version 5.1.0
  - [ ] Add `sim add sim-exts` command to install Isaac Powerpack specific simulation extensions
  - [ ] Add `ros run` command to launch the Isaac ROS Docker container on NVIDIA Jetson Orin boards
- [ ] Sim-Camera Module
  - [ ] Develop an Isaac Sim extension for spawning cameras and generating the required ROS 2 Omnigraph nodes for the [Hawk Stereo Camera](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/assets/usd_assets_camera_depth_sensors.html#hawk-stereo-camera)
  - [ ] Enable manual camera control via keyboard input in Foxglove Studio

</details>

<details>
<summary><b>v0.2.0</b></summary>

- [ ] Detection3D Module
  - [ ] Implement a Detection3D Panel for visualizing 3D object pose estimation
  - [ ] Add support for the message type `vision_msgs/msg/Detection3DArray`
  - [ ] Enable right-click interactions on detected objects or camera meshes to view detailed information (pose, distance to the camera, and other metadata)
  - [ ] Support custom object labels and IDs using Foxglove variables
  - [ ] Display camera meshes directly within the Detection3D panel
  - [ ] Visualize 3D bounding boxes, object IDs, confidence scores, and label information
  - [ ] Render pose axes for each detected object within the Detection3D panel
- [] Sim-Camera Module
  - [ ] Add joystick support for the [Logitech F710 Gamepad](https://www.logitechg.com/th-th/products/gamepads/f710-wireless-gamepad.html) and [PS5 DualSense Wireless Controller](https://www.playstation.com/en-th/accessories/dualsense-wireless-controller/)
  </details>

<details>
<summary><b>Future Ideas</b></summary>

- Jetson Stat Module: Create a Foxglove panel to monitor Jetson device statistics
- sim-camera: Add Support to [Intel Realsense Depth Camera D455](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/assets/usd_assets_camera_depth_sensors.html#hawk-stereo-camera)
- create-isaac: A starter project template generator for developing Isaac ROS and Isaac Sim applications.
</details>

## Usage

Here is the table of Isaac ROS Packages or Isaac Sim Extensions mapping to our corresponding Isaac Powerpack features:

| Isaac ROS/Sim              | Isaac Powerpack Feature |
| :------------------------- | :---------------------- |
| Isaac ROS Object Detection | pow: Detection 2D panel |

## Support Matrix

| Platform          | Version / Validation                                                           |
| :---------------- | :----------------------------------------------------------------------------- |
| Device            | ✅ Jetson AGX Orin 32 GB — Tested <br> ⏳ Jetson Orin Nano 8 GB — Pending Test |
| Isaac ROS Version | `release-3.2`                                                                  |
| Isaac Sim         | `5.1.0`                                                                        |

<br>
 
> 💡 Notes
> - This project is actively developed and tested with Isaac ROS version `release-3.2` on the NVIDIA Jetson AGX Orin 32GB. 
> - The Jetson Orin Nano 8GB (also known as the Jetson Nano Super Developer Kit) is scheduled for upcoming testing.
> - Isaac Sim is tested on Ubuntu 22.04.

## Contribution

See [Contribution Guide](docs/contributing.md)

## License

[Apache-2.0](LICENSE).
