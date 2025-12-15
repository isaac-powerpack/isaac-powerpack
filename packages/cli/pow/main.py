"""Isaac Powerpack CLI - Main entry point."""

import click

from .sim.add.local_assets import add_local_assets
from .sim.run.run import run


@click.group()
def pow():
    """Isaac Powerpack CLI for Isaac Sim workflows."""
    pass


# Sim commands
@pow.group(invoke_without_command=True)
@click.pass_context
def sim(ctx):
    """Isaac Sim related commands.

    Defaults to 'pow sim run' when no subcommand is specified.
    """
    if ctx.invoked_subcommand is None:
        ctx.invoke(run)


@sim.group()
def add():
    """Add resources to Isaac Sim."""
    pass


# Register commands
add.add_command(add_local_assets)
sim.add_command(run)

if __name__ == "__main__":
    pow()
