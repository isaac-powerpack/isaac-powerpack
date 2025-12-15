import click


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
    click.echo(
        "Create pow.sim.toml config if not exists, if exists exit with normal code notice user sim is initialized"
    )
