"""Isaac Powerpack CLI - Main entry point."""

import click

from .sim.add.local_assets import add_local_assets
from .sim.check.check import check_compatibility
from .sim.init.init_sim import init_sim
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

    # simulation command run only in x86_64 environment workstation, not in jetson device

    if ctx.invoked_subcommand is None:
        ctx.invoke(run)


@sim.group()
def add():
    """Add resources to Isaac Sim."""
    pass


# Register commands
add.add_command(add_local_assets)
sim.add_command(run)
sim.add_command(init_sim)
sim.add_command(check_compatibility)

if __name__ == "__main__":
    pow()
