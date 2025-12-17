import json
from pathlib import Path

import click


def get_asset_browser_cache_path() -> Path | None:
    """Get the path to isaacsim.asset.browser.cache.json file.

    Returns:
        Path | None: Path to the cache file if isaacsim is installed, None otherwise.
    """
    try:
        import isaacsim

        return (
            Path(isaacsim.__file__).parent
            / "exts"
            / "isaacsim.asset.browser"
            / "cache"
            / "isaacsim.asset.browser.cache.json"
        )
    except ImportError:
        return None


def fix_asset_browser_cache() -> bool:
    """Fix the Isaac Sim asset browser cache issue by creating an empty cache file.

    The asset browser extension requires a cache.json file to exist. If it doesn't,
    the browser may fail to load. This function creates an empty cache structure.

    Returns:
        bool: True if cache was created/fixed, False if isaacsim not found.
    """
    cache_path = get_asset_browser_cache_path()
    if cache_path is None:
        click.echo("Warning: Could not find isaacsim installation")
        return False

    # Create cache directory if it doesn't exist
    cache_path.parent.mkdir(parents=True, exist_ok=True)

    if cache_path.exists():
        click.echo(f"Asset browser cache already exists: {cache_path}")
        return True

    # Create empty cache structure
    empty_cache = {}

    with open(cache_path, "w") as f:
        json.dump(empty_cache, f, indent=4)

    click.echo(f"Created asset browser cache: {cache_path}")
    return True


@click.command("init")
def init_sim() -> None:
    """Initialize a new Isaac Sim project.

    Returns:
        None
    """

    # TODO: implement the actual initialization logic

    click.echo("TODO: check only run in x86_64 environment")
    click.echo("TODO: check if isaac sim installed")
    click.echo("TODO: check if in isaac sim project directory")
    click.echo("TODO: Create pow.sim.toml config if not exists")

    # Fix: isaacsim browser cache issue
    fix_asset_browser_cache()
