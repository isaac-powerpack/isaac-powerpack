import subprocess
from pathlib import Path

import click


def get_isaacsim_kit_path():
    """Get the path to isaacsim.exp.base.kit file.

    Returns:
        Path | None: Path to the kit file if isaacsim is installed, None otherwise.
    """
    try:
        import isaacsim

        return Path(isaacsim.__file__).parent / "apps" / "isaacsim.exp.base.kit"
    except ImportError:
        return None


def generate_settings_block(asset_base: Path) -> str:
    """Generate the settings block to add to the kit file.

    Args:
        asset_base: Base path where Isaac assets are located.

    Returns:
        str: Formatted settings block string to append to the kit file.
    """
    return f'''

# Local asset settings (added by pow cli)
[settings]
exts."isaacsim.asset.browser".visible_after_startup = true
persistent.isaac.asset_root.default = "{asset_base}"

exts."isaacsim.gui.content_browser".folders = [
    "{asset_base}/Isaac/Robots",
    "{asset_base}/Isaac/People",
    "{asset_base}/Isaac/IsaacLab",
    "{asset_base}/Isaac/Props",
    "{asset_base}/Isaac/Environments",
    "{asset_base}/Isaac/Materials",
    "{asset_base}/Isaac/Samples",
    "{asset_base}/Isaac/Sensors",
]

exts."isaacsim.asset.browser".folders = [
    "{asset_base}/Isaac/Robots",
    "{asset_base}/Isaac/People",
    "{asset_base}/Isaac/IsaacLab",
    "{asset_base}/Isaac/Props",
    "{asset_base}/Isaac/Environments",
    "{asset_base}/Isaac/Materials",
    "{asset_base}/Isaac/Samples",
    "{asset_base}/Isaac/Sensors",
]
# End: Local asset settings (added by pow cli)
'''


def update_kit_settings(asset_root: Path, version: str = "5.1.0") -> Path:
    """Update the isaacsim.exp.base.kit file with local asset paths.

    Args:
        asset_root: Root directory containing the extracted Isaac assets.
        version: Isaac Sim asset version string (e.g., "5.1.0").

    Returns:
        Path: Path to the asset base directory on success.

    Raises:
        FileNotFoundError: If isaacsim.exp.base.kit file is not found.
    """
    kit_path = get_isaacsim_kit_path()
    if not kit_path or not kit_path.exists():
        raise FileNotFoundError(
            "Could not find isaacsim.exp.base.kit file. Is isaacsim installed?"
        )

    version_short = ".".join(version.split(".")[:2])  # 5.1.0 -> 5.1
    asset_base = asset_root / "Assets" / "Isaac" / version_short
    settings_block = generate_settings_block(asset_base)

    # Read existing content and remove previous settings block if present
    content = kit_path.read_text()
    start_marker = "# Local asset settings (added by pow cli)"
    end_marker = "# End: Local asset settings (added by pow cli)"

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    # Remove existing if both start and end marker is found
    if start_idx != -1 and end_idx != -1:
        end_idx += len(end_marker)
        content = content[:start_idx].rstrip("\n") + content[end_idx:].lstrip("\n")
        click.echo("Removing existing local asset settings...")

    with open(kit_path, "w") as f:
        f.write(content + settings_block)

    click.echo(f"Updated {kit_path} with local asset settings")
    return asset_base


def download_assets(target_path: Path, version: str = "5.1.0") -> None:
    """Download Isaac Sim asset zip parts using aria2c.

    Downloads three zip parts from NVIDIA's Isaac Sim asset server.
    Supports resuming incomplete downloads.

    Args:
        target_path: Directory to download the zip files to.
        version: Isaac Sim asset version string (e.g., "5.1.0").

    Returns:
        None

    Raises:
        subprocess.CalledProcessError: If aria2c download fails.
    """
    for i in range(1, 4):
        zip_file = target_path / f"isaac-sim-assets-complete-{version}.zip.00{i}"
        aria2_file = (
            target_path / f"isaac-sim-assets-complete-{version}.zip.00{i}.aria2"
        )

        if aria2_file.exists():
            click.echo(f"Incomplete download detected: {zip_file.name}. Resuming...")
        elif not zip_file.exists():
            click.echo(f"Missing asset: {zip_file.name}. Downloading...")
        else:
            click.echo(f"Found complete asset part: {zip_file.name}.")
            continue

        subprocess.run(
            [
                "aria2c",
                f"https://download.isaacsim.omniverse.nvidia.com/isaac-sim-assets-complete-{version}.zip.00{i}",
                "-d",
                str(target_path),
            ],
            check=True,
        )

    click.echo(f"All isaac sim asset v{version} parts are present.")


def extract_assets(
    target_path: Path, version: str = "5.1.0", keep_zip: bool = False
) -> None:
    """Merge and extract Isaac Sim asset zip files.

    Combines three zip parts into a single archive, extracts it to
    target_path/isaacsim_assets, and optionally cleans up the zip files.

    Args:
        target_path: Directory containing the downloaded zip parts.
        version: Isaac Sim asset version string (e.g., "5.1.0").
        keep_zip: If True, keep zip files after extraction.

    Returns:
        None

    Raises:
        subprocess.CalledProcessError: If unzip extraction fails.
    """
    merged_zip = target_path / f"isaac-sim-assets-complete-{version}.zip"
    zip_parts = [
        target_path / f"isaac-sim-assets-complete-{version}.zip.001",
        target_path / f"isaac-sim-assets-complete-{version}.zip.002",
        target_path / f"isaac-sim-assets-complete-{version}.zip.003",
    ]

    if merged_zip.exists():
        click.echo(f"Removing existing merged archive: {merged_zip}")
        merged_zip.unlink()

    click.echo("Merging zip parts...")

    total_size = sum(p.stat().st_size for p in zip_parts)
    written = 0

    with open(merged_zip, "wb") as outfile:
        for part in zip_parts:
            with open(part, "rb") as infile:
                while chunk := infile.read(1024 * 1024 * 10):  # 10MB chunks
                    outfile.write(chunk)
                    written += len(chunk)
                    pct = (written / total_size) * 100
                    click.echo(f"\r  Progress: {pct:.1f}%", nl=False)
    click.echo()  # newline after progress
    click.echo(f"Created merged archive: {merged_zip}")

    click.echo("Extracting assets...")
    subprocess.run(
        ["unzip", str(merged_zip), "-d", str(target_path / "isaacsim_assets")],
        check=True,
    )
    click.echo("Extraction complete.")

    version_short = ".".join(version.split(".")[:2])  # 5.1.0 -> 5.1
    click.echo(
        f"Isaac Sim assets installed to: {target_path}/isaacsim_assets/Assets/Isaac/{version_short}"
    )

    click.echo("Cleaning up zip files parts...")
    for part in zip_parts:
        if part.exists():
            part.unlink()

    if merged_zip.exists() and not keep_zip:
        merged_zip.unlink()
    else:
        click.echo(f"Keeping zip files at: {target_path}")

    click.echo("Cleanup complete.")


@click.command("local-assets")
@click.argument("path", required=True)
@click.option(
    "-s",
    "--skip-download",
    is_flag=True,
    help="Skip downloading and use existing files",
)
@click.option(
    "-v",
    "--version",
    default="5.1.0",
    help="Isaac Sim asset version (default: 5.1.0)",
)
@click.option(
    "-k",
    "--keep-zip",
    is_flag=True,
    help="Keep zip files after extraction",
)
def add_local_assets(
    path: str, skip_download: bool, version: str, keep_zip: bool
) -> None:
    """Download Isaac Sim assets and install at target path.

    Main CLI command that orchestrates downloading, extracting, and configuring
    Isaac Sim local assets.

    Args:
        path: Target directory path for asset installation.
        skip_download: If True, skip download and use existing files.
        version: Isaac Sim asset version string (e.g., "5.1.0").
        keep_zip: If True, keep zip files after extraction.

    Returns:
        None
    """
    target_path = Path(path).resolve()

    if not skip_download:
        download_assets(target_path, version)
        extract_assets(target_path, version, keep_zip)

    # Update kit settings with local asset paths
    update_kit_settings(target_path / "isaacsim_assets", version)

    click.echo(f"Isaac sim local assets version {version} installation complete.")
