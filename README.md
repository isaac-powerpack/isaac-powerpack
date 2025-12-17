<p align="center">
    <img src="https://raw.githubusercontent.com/bemunin/isaac-powerpack/main/docs/public/logo.svg" width="400"/>
</p>

✨ Isaac Powerpack’s goal is to provide a toolkit that simplifies Isaac ROS development on NVIDIA Jetson boards.

Key features include:

- 🪻 Foxglove Studio extensions — for visualizing and debugging Isaac ROS data
- 🛠️ CLI tools — to streamline Isaac ROS and Isaac Sim project setup and management

🚧 This project is in early development. Features and APIs are still evolving and subject to breaking changes.

🙋 We’ll open this project for contributions soon.

[Read the Docs to Learn More](docs/index.md)

## Features & Milestones

<details open>
<summary><b>v0.1.0 (🏃 In Progress)</b></summary>

- Detection2D Module
  - [x] Detection2D panel with image display
  - [x] `Detection2DArray` → `ImageAnnotations` conversion
  - [x] 2D bounding box visualization
  - [x] Configurable object labels and IDs via Foxglove variables
  - [x] Object ID, confidence, and label display

- CLI
  - [x] Install Isaac Sim local assets (`sim add local-assets`, v5.1.0)
  - [ ] Isaac Sim commands: `sim init`, `sim run` for simplified setup workflows
  - [ ] Isaac ROS commands: `ros init`, `ros run`, `ros build` for streamlined Docker workflows

- Sim Camera Module
  - [ ] Keyboard camera movement control for `pow.workcell.camera` extension in Isaac Sim

  ***

  > Note: `pow.workcell.camera` is implemented in [pow-orin-starter](https://github.com/bemunin/pow-orin-starter) template project.

  </details>

<details>
<summary><b>v0.2.0</b></summary>

- Detection3D Module
  - [ ] Detection3D panel for 3D pose and bounding box visualization
  - [ ] `Detection3DArray` support with configurable labels, IDs, and confidence
  - [ ] Interactive object inspection (pose, distance, metadata) with camera mesh and pose axes rendering
  - [ ] Support visualization for Isaac ROS pose estimation packages (CenterPose, DOPE, FoundationPose)

- Sim Camera Module
  - [ ] Joystick-based camera movement for `pow.workcell.camera` extension in Isaac Sim. support [Logitech F710 Gamepad](https://www.logitechg.com/th-th/products/gamepads/f710-wireless-gamepad.html) and [PS5 DualSense Wireless Controller](https://www.playstation.com/en-th/accessories/dualsense-wireless-controller/)
  </details>

<details>
<summary><b>Future Ideas</b></summary>

- Jetson Stat Module: Create a Foxglove panel to monitor Jetson device statistics
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
| OS                | Ubuntu 22.04                                                                   |

<br>
 
> 💡 Notes
> - This project is actively developed and tested with Isaac ROS version `release-3.2` on the NVIDIA Jetson AGX Orin 32GB. 
> - The Jetson Orin Nano 8GB (also known as the Jetson Nano Super Developer Kit) is scheduled for upcoming testing.
> - Pow CLI, Isaac Sim extension is tested on Ubuntu 22.04.

## Contribution

See [Contribution Guide](docs/contributing.md)

## License

[Apache-2.0](LICENSE).
