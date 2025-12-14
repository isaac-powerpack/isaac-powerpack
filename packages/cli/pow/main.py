import click

from .install import install_local_asset


@click.group()
def pow():
    """Isaac Powerpack CLI"""
    pass


@pow.group()
def install():
    """Install commands"""
    pass


install.add_command(install_local_asset)


if __name__ == "__main__":
    pow()
