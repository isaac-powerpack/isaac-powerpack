"""Run Isaac Sim App command."""

import os
import platform
import shlex
import subprocess
from pathlib import Path

import click
import toml


def find_project_root(start_path: Path | None = None) -> Path | None:
    """Find the project root by locating pow.toml.

    Searches from the start path upward through parent directories
    until pow.toml is found or the filesystem root is reached.

    Args:
        start_path: Directory to start searching from (default: current directory).

    Returns:
        Path | None: Path to the directory containing pow.toml, or None if not found.
    """
    if start_path is None:
        start_path = Path.cwd()

    current = start_path.resolve()

    while current != current.parent:
        if (current / "pow.toml").exists():
            return current
        current = current.parent

    # Check root as well
    if (current / "pow.toml").exists():
        return current

    return None


def load_config(project_root: Path) -> dict:
    """Load pow.toml configuration.

    Args:
        project_root: Path to the project root directory.

    Returns:
        dict: Parsed TOML configuration.

    Raises:
        FileNotFoundError: If pow.toml is not found.
    """
    config_path = project_root / "pow.toml"
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    return toml.load(config_path)


def source_setup_file(file_path: Path, shell_type: str, description: str = "") -> None:
    """Source a shell setup file and apply environment variables.

    Args:
        file_path: Path to the setup file to source.
        shell_type: Shell type (bash, zsh, sh).
        description: Optional description for logging.

    Raises:
        click.ClickException: If sourcing fails.
    """
    safe_path = shlex.quote(str(file_path))
    command = [
        shell_type,
        "-c",
        f"source {safe_path} && env",
    ]

    try:
        subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True,
        )

        label = description if description else str(file_path)
        click.echo(
            click.style(
                f"Sourced {label}",
                fg="green",
            )
        )

    except subprocess.CalledProcessError as e:
        raise click.ClickException(
            click.style(
                f"Failed to source setup file {file_path}: {e.stderr}",
                fg="red",
            )
        )


def source_isaacsim_ros_workspace(config: dict) -> None:
    """Check and prepare ROS workspace environment variables.

    Checks if the ROS setup files exist based on isaacsim_ros_ws config.
    Returns environment variables that would be set by sourcing the setup files.

    Args:
        config: Parsed pow.toml configuration dictionary.

    Returns:
        dict[str, str]: Environment variables to be set for ROS workspace.
    """

    ros_config = config.get("sim", {}).get("ros", {})
    isaacsim_ros_ws = ros_config.get("isaacsim_ros_ws", "")
    ros_distro = ros_config.get("ros_distro", "humble")

    if not isaacsim_ros_ws:
        raise click.ClickException(
            click.style(
                "isaacsim_ros_ws is not set in pow.toml. "
                "Set [sim.ros].isaacsim_ros_ws to your Isaac Sim ROS workspace path.",
                fg="red",
            )
        )

    ros_ws_path = Path(isaacsim_ros_ws).expanduser()

    # Get current shell type
    shell_path = os.environ.get("SHELL", "")
    shell_type = Path(shell_path).name if shell_path else ""
    supported_shells = ("bash", "zsh", "sh")
    if shell_type not in supported_shells:
        raise click.ClickException(
            click.style(
                f"Shell type '{shell_type}' is not supported. "
                f"Supported shells: {', '.join(supported_shells)}",
                fg="red",
            )
        )

    # Construct paths based on the workspace structure
    # Pattern: {isaacsim_ros_ws}/build_ws/{distro}/{distro}_ws/install/local_setup.bash
    # Pattern: {isaacsim_ros_ws}/build_ws/{distro}/isaac_sim_ros_ws/install/local_setup.bash
    distro_local_setup = (
        ros_ws_path
        / "build_ws"
        / ros_distro
        / f"{ros_distro}_ws"
        / "install"
        / f"local_setup.{shell_type}"
    )
    isaac_sim_ros_setup = (
        ros_ws_path
        / "build_ws"
        / ros_distro
        / "isaac_sim_ros_ws"
        / "install"
        / f"local_setup.{shell_type}"
    )

    if not distro_local_setup.exists():
        raise click.ClickException(
            click.style(
                f"{ros_distro.capitalize()} setup file not found at {distro_local_setup}",
                fg="red",
            )
        )

    if not isaac_sim_ros_setup.exists():
        raise click.ClickException(
            click.style(
                f"ROS setup file not found at {isaac_sim_ros_setup}",
                fg="red",
            )
        )

    # Source setup files
    source_setup_file(
        distro_local_setup,
        shell_type,
        f"{ros_distro.capitalize()} setup file at {distro_local_setup}",
    )

    source_setup_file(
        isaac_sim_ros_setup,
        shell_type,
        f"ROS setup file at {isaac_sim_ros_setup}",
    )


@click.command(
    context_settings={"ignore_unknown_options": True, "allow_extra_args": True}
)
@click.pass_context
def run(ctx) -> None:
    """Run an Isaac Sim App.

    Loads configuration from pow.toml in the project root.
    Supports passing arbitrary flags to Isaac Sim.

    Args:
        ctx: Click context containing extra arguments.

    Returns:
        None
    """
    project_root = find_project_root()
    if project_root is None:
        raise click.ClickException(
            click.style(
                "Not initialized. Run 'pow sim init' in your project directory.",
                fg="red",
            )
        )

    config = load_config(project_root)

    # Check x86_64 environment
    if platform.machine().lower() not in ("x86_64", "amd64"):
        raise click.ClickException(
            click.style(
                "This command is not supported on Jetson devices; it is intended for x86_64 systems.",
                fg="red",
            )
        )

    # check if system is Ubuntu Linux
    os_release = Path("/etc/os-release")
    if not os_release.exists() or "id=ubuntu" not in os_release.read_text().lower():
        raise click.ClickException(
            click.style("This command is supported only on Ubuntu.", fg="red")
        )

    ros_config = config.get("sim", {}).get("ros", {})
    enable_ros = ros_config.get("enable_ros", False)
    if enable_ros:
        source_isaacsim_ros_workspace(config)
    else:
        click.echo(click.style("ROS integration is disabled."))

    # construct isaacsim command
    launch_cmd = "uv run isaacsim"
    ext_folders = config.get("sim", {}).get("ext_folders", [])

    if ext_folders:
        # append each ext folder to the command
        for folder in ext_folders:
            launch_cmd += f" --ext-folder {folder}"

    profiles = config.get("sim", {}).get("profiles", [])

    target_profile = next((p for p in profiles if p.get("name") == "default"), None)
    if target_profile is None:
        raise click.ClickException(
            click.style("No profile named 'default' found in pow.toml.", fg="red")
        )

    headless = target_profile.get("headless", False)
    if headless:
        launch_cmd += " --headless"

    enable_exts = target_profile.get("extensions", [])
    for ext in enable_exts:
        launch_cmd += f" --enable {ext}"

    raw_args = target_profile.get("raw_args", [])
    for arg in raw_args:
        launch_cmd += f" {arg}"

    open_scene_path = target_profile.get("open_scene_path", "")
    if open_scene_path:
        full_scene_path = project_root / open_scene_path
        launch_cmd += f' --exec "open_stage.py file://{full_scene_path}"'

    # if there are extra args from CLI, append them
    if ctx.args:
        extra_args = " ".join(shlex.quote(arg) for arg in ctx.args)
        launch_cmd += f" {extra_args}"

    # --- Execute the command ---
    # cpu performance mode
    cpu_performance_mode = target_profile.get("cpu_performance_mode", False)
    if cpu_performance_mode:
        click.echo(
            click.style(
                "🔓 Setting CPU to performance mode requires 'sudo' privileges.",
                fg="bright_black",
            )
        )
        cmd = "sudo cpupower frequency-set -g performance"
        subprocess.run(shlex.split(cmd), check=True)

    # launch isaacsim with constructed command
    subprocess.run(shlex.split(launch_cmd), check=True)
