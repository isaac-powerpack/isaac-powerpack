import json
import re
import subprocess
from importlib.resources import files
from pathlib import Path

import click
import toml

from ...lib import get_isaacsim_path


def generate_vscode_settings() -> bool:
    """Generate VS Code settings for Isaac Sim development.

    Runs 'python -m isaacsim --generate-vscode-settings' to create
    VS Code configuration for Isaac Sim extensions and Python paths.

    Returns:
        bool: True if settings were generated successfully, False otherwise.
    """
    try:
        settings_path = Path.cwd() / ".vscode" / "settings.json"
        if settings_path.exists():
            click.echo("Skipped creating vscode settings, already exists.")
            return True

        # run isaacsim script to generate settings
        subprocess.run(
            ["uv", "run", "python", "-m", "isaacsim", "--generate-vscode-settings"],
            check=True,
            capture_output=True,
            text=True,
        )
        click.echo("Generated vscode settings for Isaac Sim")

        # replace absolute paths with ${workspaceFolder} in settings.json

        settings_path = Path.cwd() / ".vscode" / "settings.json"
        content = settings_path.read_text()

        # Replace absolute paths before .venv with ${workspaceFolder}
        # Pattern matches: "/any/path/.venv" -> "${workspaceFolder}/.venv"
        updated_content = re.sub(
            r'"[^"]+/\.venv/',
            r'"${workspaceFolder}/.venv/',
            content,
        )

        if content != updated_content:
            settings_path.write_text(updated_content)
        else:
            click.echo(
                "No absolute paths to replace with ${workspaceFolder} in VS Code settings"
            )

        return True

    except subprocess.CalledProcessError as e:
        click.echo(f"Error generating VS Code settings: {e.stderr}")
        return False
    except FileNotFoundError:
        click.echo("Error: Python not found in PATH")
        return False


def fix_asset_browser_cache(isaacsim_path: Path) -> bool:
    """Fix the Isaac Sim asset browser cache issue by creating an empty cache file.

    The asset browser extension requires a cache.json file to exist. If it doesn't,
    the browser may fail to load. This function creates an empty cache structure.

    Args:
        isaacsim_path: Path to the Isaac Sim installation directory.

    Returns:
        bool: True if cache was created or already exists, False otherwise.
    """
    cache_path = (
        isaacsim_path
        / "exts"
        / "isaacsim.asset.browser"
        / "cache"
        / "isaacsim.asset.browser.cache.json"
    )

    if cache_path is None:
        click.echo("Warning: Could not find isaacsim installation")
        return False

    # Create cache directory if it doesn't exist
    cache_path.parent.mkdir(parents=True, exist_ok=True)

    if cache_path.exists():
        click.echo(
            f"Skipped creating Asset browser cache, already exists:\n  {cache_path}"
        )
        return True

    # Create empty cache structure
    empty_cache = {}

    with open(cache_path, "w") as f:
        json.dump(empty_cache, f, indent=4)

    click.echo(f"Created asset browser cache: {cache_path}")
    return True


def create_pow_config_toml() -> tuple[dict, bool]:
    """Create pow.toml config file in the project root.

    Copies the default pow.toml template to the current working directory.
    If pow.toml already exists, it will not be overwritten.

    Returns:
        tuple[dict, bool]: A tuple containing:
            - dict: The parsed pow.toml configuration dictionary.
            - bool: True if pow.toml already existed, False if newly created.
    """
    pow_toml_path = Path.cwd() / "pow.toml"

    if pow_toml_path.exists():
        click.echo("Skipped creating pow.toml config, already exists.")
        return (toml.load(pow_toml_path), True)

    try:
        default_toml = files("pow_cli").joinpath("data", "pow.default.toml")
        content = default_toml.read_text()
        pow_toml_path.write_text(content)
        click.echo("Created pow.toml config")
        return (toml.load(pow_toml_path), False)
    except FileNotFoundError:
        click.echo("Error: Default template not found in package")
        return ({}, False)


def update_pow_config_toml(pow_config: dict) -> None:
    """Update pow.toml config file with ROS settings.

    Uses regex replacement to preserve file formatting and comments.

    Args:
        pow_config: The pow.toml configuration dictionary with updated values.
    """
    pow_toml_path = Path.cwd() / "pow.toml"
    content = pow_toml_path.read_text()

    # Replace enable_ros value
    enable_ros = str(pow_config["sim"]["ros"]["enable_ros"]).lower()
    content = re.sub(
        r"^(\s*enable_ros\s*=\s*).*$",
        rf"\g<1>{enable_ros}",
        content,
        flags=re.MULTILINE,
    )

    # Replace ros_distro value
    ros_distro = pow_config["sim"]["ros"]["ros_distro"]
    content = re.sub(
        r"^(\s*ros_distro\s*=\s*).*$",
        rf'\g<1>"{ros_distro}"',
        content,
        flags=re.MULTILINE,
    )

    pow_toml_path.write_text(content)


def setup_ros_workspace(pow_config: dict, is_existing: bool) -> dict:
    """Setup ROS workspace for Isaac Sim project.

    Prompts the user to enable ROS integration and select a ROS distro.
    If enabled, clones and installs isaac_ros_common in .pow/ directory.

    Args:
        pow_config: The pow.toml configuration dictionary.
        is_existing: True if pow.toml already existed, False if newly created.

    Returns:
        dict: Updated pow_config with ros settings:
            - sim.ros.enable_ros (bool): Whether ROS is enabled
            - sim.ros.ros_distro (str): Selected ROS distro or empty string if disabled
    """

    # Ensure nested structure exists
    if "sim" not in pow_config:
        pow_config["sim"] = {}
    if "ros" not in pow_config["sim"]:
        pow_config["sim"]["ros"] = {}

    if not is_existing:
        # Ask if user wants to use ROS
        enable_ros = click.confirm(
            click.style(
                "Do you want to enable ROS integration in IsaacSim?",
                fg="bright_black",
            ),
            default=True,
        )
        if not enable_ros:
            click.echo("Skipping ROS setup.")
            pow_config["sim"]["ros"]["enable_ros"] = False
            pow_config["sim"]["ros"]["ros_distro"] = ""
            return pow_config

        pow_config["sim"]["ros"]["enable_ros"] = True

        # Select ROS distro
        ros_distros = ["humble", "jazzy"]
        click.echo(click.style("Available ROS distributions:", fg="bright_black"))
        for i, distro in enumerate(ros_distros, 1):
            click.echo(click.style(f"  {i}. {distro}", fg="bright_black", bold=True))

        choice = click.prompt(
            click.style("Select ROS distro", fg="bright_black"),
            type=click.IntRange(1, len(ros_distros)),
            default=1,  # humble
        )
        selected_distro = ros_distros[choice - 1]
        pow_config["sim"]["ros"]["ros_distro"] = selected_distro
        click.echo(f"Selected ROS distro: {selected_distro}")

    # Setup .pow directory
    pow_dir = Path.cwd() / ".pow"
    pow_dir.mkdir(parents=True, exist_ok=True)

    # Clone IsaacSim-ros_workspaces
    ros_workspace_path = pow_dir / "IsaacSim-ros_workspaces"

    if ros_workspace_path.exists():
        click.echo("IsaacSim-ros_workspaces already exists")
    else:
        click.echo("Cloning IsaacSim-ros_workspaces...")
        try:
            subprocess.run(
                [
                    "git",
                    "clone",
                    "-b",
                    "IsaacSim-5.1.0",
                    "--quiet",
                    "https://github.com/isaac-sim/IsaacSim-ros_workspaces.git",
                    str(ros_workspace_path),
                ],
                check=True,
                capture_output=True,
            )
            click.echo(f"Cloned IsaacSim-ros_workspaces to: {ros_workspace_path}")
        except subprocess.CalledProcessError as e:
            click.echo(f"Error cloning IsaacSim-ros_workspaces: {e}")
            pow_config["sim"]["ros"]["enable_ros"] = False
            return pow_config

    # Install the selected ROS workspace base on this guide
    # https://docs.isaacsim.omniverse.nvidia.com/5.1.0/installation/install_ros.html
    ros_distro = pow_config["sim"]["ros"].get("ros_distro", "")
    if ros_distro in ["humble", "jazzy"]:
        # Install ROS dependencies
        click.echo(f"Building ROS {ros_distro} workspace...")
        try:
            subprocess.run(
                ["./build_ros.sh", "-d", ros_distro, "-v", "22.04"],
                cwd=ros_workspace_path,
                check=True,
            )
            click.echo(f"Built ROS {ros_distro} workspace.")
        except subprocess.CalledProcessError as e:
            click.echo(
                f"Skipped build: failed to build ROS {ros_distro} workspace ({e})"
            )
            pow_config["sim"]["ros"]["enable_ros"] = False
            return pow_config

    click.echo(f"Setup ROS workspace complete at path:\n  {ros_workspace_path}")

    return pow_config


@click.command("init")
def init_sim() -> None:
    """Initialize a new Isaac Sim project.

    Returns:
        None
    """

    # Check if isaacsim is installed

    isaacsim_path = get_isaacsim_path()
    if isaacsim_path is None:
        click.echo("Error: Isaac Sim not found. Please install Isaac Sim first.")
        return

    # Create pow.toml config if not exists in root
    pow_config, is_existing = create_pow_config_toml()

    # Generate VS Code settings for Isaac Sim
    generate_vscode_settings()

    # Fix: isaacsim browser cache issue
    fix_asset_browser_cache(isaacsim_path)

    # Setup ROS workspace if user agrees
    updated_powconfig = setup_ros_workspace(pow_config, is_existing)

    # Update pow.toml with ROS settings
    update_pow_config_toml(updated_powconfig)

    click.echo(click.style("🎉 Successfully initialized Sim project 🎉", fg="green"))
