import subprocess
from pathlib import Path

import click


@click.group()
def pow():
    """Isaac Powerpack CLI"""
    pass


@pow.group()
def install():
    """Install commands"""
    pass


def get_isaacsim_kit_path():
    """Get the path to isaacsim.exp.base.kit file."""
    try:
        import isaacsim

        return Path(isaacsim.__file__).parent / "apps" / "isaacsim.exp.base.kit"
    except ImportError:
        return None


def update_kit_settings(asset_root: Path):
    """Update the isaacsim.exp.base.kit file with local asset paths."""
    kit_path = get_isaacsim_kit_path()
    if not kit_path or not kit_path.exists():
        click.echo("Warning: Could not find isaacsim.exp.base.kit file")
        return False

    asset_base = asset_root / "Assets" / "Isaac" / "5.1"

    settings_block = f'''

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

    # Read existing content and remove previous settings block if present
    content = kit_path.read_text()
    start_marker = "# Local asset settings (added by pow cli)"
    end_marker = "# End: Local asset settings (added by pow cli)"

    if start_marker in content:
        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker)

        # if it found
        if end_idx != -1:
            end_idx += len(end_marker)
            content = content[:start_idx].rstrip("\n") + content[end_idx:].lstrip("\n")
            click.echo("Removing existing local asset settings...")

    with open(kit_path, "w") as f:
        f.write(content + settings_block)

    click.echo(f"Updated {kit_path} with local asset settings")
    return True


@install.command("local-asset")
@click.argument("path", required=True)
@click.option(
    "-s",
    "--skip-download",
    is_flag=True,
    help="Skip downloading and use existing files",
)
def install_local_asset(path, skip_download):
    """Download isaac sim asset and Install at target path.

    Support only asset in Isaac Sim version 5.1.0
    """

    target_path = Path(path).resolve()

    if not skip_download:
        # Check all zip parts exist and no .aria2 files (incomplete downloads)
        for i in range(1, 4):
            zip_file = target_path / f"isaac-sim-assets-complete-5.1.0.zip.00{i}"
            aria2_file = (
                target_path / f"isaac-sim-assets-complete-5.1.0.zip.00{i}.aria2"
            )

            if not zip_file.exists():
                click.echo(f"Error: Missing asset: {zip_file.name}")
                return
            click.echo(f"Found asset part: {zip_file.name}")

            if aria2_file.exists():
                click.echo(
                    f"Incomplete download detected: {zip_file.name}. Resuming..."
                )
            elif not zip_file.exists():
                click.echo(f"Missing asset: {zip_file.name}. Downloading...")
            else:
                click.echo(f"Found complete asset part: {zip_file.name}.")
                continue

            subprocess.run(
                [
                    "aria2c",
                    f"https://download.isaacsim.omniverse.nvidia.com/isaac-sim-assets-complete-5.1.0.zip.00{i}",
                    "-d",
                    str(target_path),
                ],
                check=True,
            )

        click.echo("All isaac sim asset v5.1.0 parts are present.")

        # Merge and extract
        merged_zip = target_path / "isaac-sim-assets-complete-5.1.0.zip"

        if merged_zip.exists():
            click.echo(f"Removing existing merged archive: {merged_zip}")
            merged_zip.unlink()

        click.echo("Merging zip parts...")

        zip_parts = [
            target_path / "isaac-sim-assets-complete-5.1.0.zip.001",
            target_path / "isaac-sim-assets-complete-5.1.0.zip.002",
            target_path / "isaac-sim-assets-complete-5.1.0.zip.003",
        ]
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

        click.echo(
            f"Isaac Sim assets installed to: {target_path}/isaacsim_assets/Assets/Isaac/5.1"
        )

        # Clean up zip files
        click.echo("Cleaning up zip files...")
        for part in zip_parts:
            part.unlink()
        merged_zip.unlink()
        click.echo("Cleanup complete.")

    # Update kit settings with local asset paths
    update_kit_settings(target_path / "isaacsim_assets")

    click.echo("Local asset installation complete.")


if __name__ == "__main__":
    pow()
