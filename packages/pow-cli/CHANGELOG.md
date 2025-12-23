# Changelog

All notable changes to the `pow-cli` package will be documented in this file.

## [0.1.0a1] - 2025-12-23

### Added

- Initial alpha release of Isaac Powerpack CLI (`pow`)
- **Core CLI Structure**
  - Main entry point with Click-based command group architecture
  - Hierarchical command organization under `pow sim` namespace

- **Simulation Commands (`pow sim`)**
  - `pow sim run` - Run Isaac Sim applications with automatic environment setup
    - Auto-discovery of project root via `pow.toml` configuration
    - ROS 2 workspace sourcing support
    - Isaac Sim setup file sourcing
    - Configurable app path and extension loading
  - `pow sim init` - Initialize Isaac Sim development environment
    - VS Code settings generation for Isaac Sim development
    - Asset browser cache fix utility
    - Project configuration scaffolding
  - `pow sim check` - Run Isaac Sim compatibility checker
    - Validates system compatibility with Isaac Sim requirements
  - `pow sim info` - Display Isaac Sim configuration information
    - Show local assets path configuration (`-l, --local-assets` flag)

- **Resource Management (`pow sim add`)**
  - `pow sim add local-assets` - Configure local Isaac Sim assets
    - Updates `isaacsim.exp.base.kit` with local asset paths
    - Configures asset browser and content browser folders
    - Supports versioned asset directories

### Dependencies

- `click>=8.1.7` - Command line interface framework
- `toml>=0.10.2` - TOML configuration file parsing
- Python 3.10+ required
