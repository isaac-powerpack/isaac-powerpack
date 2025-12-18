import subprocess

import click

from ...lib.path import get_isaacsim_path


@click.command("check")
def check_compatibility() -> None:
    isaacsim_path = get_isaacsim_path()
    if isaacsim_path is None:
        click.echo("Error: Isaac Sim not found. Please install Isaac Sim first.")
        return False

    try:
        subprocess.run(
            ["uv", "run", "isaacsim", "isaacsim.exp.compatibility_check"],
            check=True,
            text=True,
        )

        return True
    except subprocess.CalledProcessError as e:
        click.echo(f"Compatibility check failed: {e.stderr}")
        return False
