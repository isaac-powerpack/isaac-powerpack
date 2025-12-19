"""Run Isaac Sim App command."""

import platform
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
                "Could not find pow.toml in current directory or any parent directory.",
                fg="red",
            )
        )

    config = load_config(project_root)
    click.echo(f"Loaded config: {config}")

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

    # TODO: implement the actual run logic
    click.echo("TODO: check and source isaac ros workspace")

    click.echo(
        f"TDO: Pass Extra arguments to isaacsim command (support for example --reset-user): {ctx.args}"
    )

    click.echo("TODO: ")
