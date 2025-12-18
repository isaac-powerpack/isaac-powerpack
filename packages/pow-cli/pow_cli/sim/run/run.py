"""Run Isaac Sim App command."""

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


@click.command()
def run() -> None:
    """Run an Isaac Sim App.

    Loads configuration from pow.toml in the project root.

    Returns:
        None
    """
    project_root = find_project_root()
    if project_root is None:
        raise click.ClickException(
            "Could not find pow.toml in current directory or any parent directory."
        )

    click.echo(f"Project root: {project_root}")

    config = load_config(project_root)
    click.echo(f"Loaded config: {config}")

    # TODO: implement the actual run logic
    click.echo("TODO: check only run in x86_64 environment")
