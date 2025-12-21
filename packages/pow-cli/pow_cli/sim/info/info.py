"""Info commands for Isaac Sim."""

import re
from pathlib import Path

import click

from ...lib.path import get_isaacsim_path


def get_local_assets_path_from_kit(kit_path: Path) -> str | None:
    """Read local assets path from isaacsim.exp.base.kit file.

    Parses the kit file to find the persistent.isaac.asset_root.default
    setting in the [settings] section.

    Returns:
        str | None: The local assets path if found, None otherwise.
    """
    if not kit_path or not kit_path.exists():
        click.echo(
            click.style(
                "Error: Could not find isaacsim.exp.base.kit file. Please ensure Isaac Sim is installed.",
                fg="red",
            )
        )

    content = kit_path.read_text()

    # Look for persistent.isaac.asset_root.default in settings section
    pattern = r'persistent\.isaac\.asset_root\.default\s*=\s*"([^"]*)"'
    match = re.search(pattern, content)

    if match:
        return match.group(1)
    return None


@click.command("info")
@click.option(
    "-l",
    "--local-assets",
    is_flag=True,
    help="Show local assets path configured in isaacsim",
)
def info(local_assets: bool) -> None:
    """Display Isaac Sim configuration information."""

    if local_assets:
        kit_path = get_isaacsim_path() / "apps" / "isaacsim.exp.base.kit"

        assets_path = get_local_assets_path_from_kit(kit_path)
        if assets_path:
            click.echo(f"Local assets path: {assets_path}")
        else:
            click.echo(
                click.style(
                    "Local assets not configured. Run 'pow sim add local-assets <path>' to set up.",
                    fg="yellow",
                )
            )
