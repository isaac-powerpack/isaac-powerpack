from pathlib import Path


def get_isaacsim_path() -> Path | None:
    """Get the installation path of Isaac Sim.

    Returns:
        Path | None: Path to the Isaac Sim installation if found, None otherwise.
    """
    try:
        import isaacsim

        return Path(isaacsim.__file__).parent
    except ImportError:
        return None
