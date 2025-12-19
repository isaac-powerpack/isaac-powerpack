import json
import re
import subprocess
from importlib.resources import files
from pathlib import Path

import click

from ...lib import get_isaacsim_path


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
        click.echo(f"Asset browser cache already exists: {cache_path}.")
        return True

    # Create empty cache structure
    empty_cache = {}

    with open(cache_path, "w") as f:
        json.dump(empty_cache, f, indent=4)

    click.echo(f"Created asset browser cache: {cache_path}")
    return True


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
            click.echo("vscode settings already exist.")
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


def create_pow_config_toml() -> bool:
    """Create pow.toml config file in the project root.

    Copies the default pow.toml template to the current working directory.
    If pow.toml already exists, it will not be overwritten.

    Returns:
        bool: True if pow.toml was created or already exists, False on error.
    """
    pow_toml_path = Path.cwd() / "pow.toml"

    if pow_toml_path.exists():
        click.echo("pow.toml already exists.")
        return True

    try:
        default_toml = files("pow_cli").joinpath("data", "pow.default.toml")
        content = default_toml.read_text()
        pow_toml_path.write_text(content)
        click.echo("Created pow.toml config")
        return True
    except FileNotFoundError:
        click.echo("Error: Default template not found in package")
        return False


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

    # Generate VS Code settings for Isaac Sim
    generate_vscode_settings()

    # Fix: isaacsim browser cache issue
    fix_asset_browser_cache(isaacsim_path)

    # TODO: setup ROS workspace if user agrees
    #       prompt asking to use ROS in isaac sim project and select ROS distro
    #       peform clone and install in .pow/
    #       function should return {enable_ros: bool, ros_distro: str}
    # ... implement here ...

    # Create pow.toml config if not exists in root
    create_pow_config_toml()

    click.echo(click.style("🎉 Successfully initialized Sim project 🎉", fg="green"))
