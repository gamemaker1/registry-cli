// Restart the registry and optionally the dependent containers as well

import Docker from 'dockerode'
import Chalk from 'chalk'
import spin from 'ora'
import doesCommandExist from 'command-exists'

export default async (options: { all: boolean }) => {
	let spinner = spin('Checking environment...').start()
	// Check for docker
	if (!(await doesCommandExist('docker'))) {
		spinner.fail(
			Chalk.red(
				'Could not find `docker` installed on your system. Please install docker from https://docs.docker.com/engine/install/ before running this command.'
			)
		)
		process.exit(1)
	}
	spinner.succeed('We are in a sane environment, good to go!')

	// Create a docker instance
	const docker = new Docker()

	// Restart the containers
	spinner = spin('Restarting containers...').start()
	// List running containers
	await docker
		.listContainers()
		.then((containers) => {
			if (containers?.length <= 0) {
				spinner.fail('Could not find running registry container.')
				process.exit(1)
			}

			return containers
		})
		.then(async (containers) => {
			for (const containerInfo of containers) {
				// Restart all containers if the --all option is passed
				if (
					containerInfo.Names.some((name) =>
						(options.all ? ['/es', '/db', '/kc', '/rg'] : ['/rg']).includes(
							name
						)
					)
				) {
					spinner.text = `Restarting ${
						containerInfo.Names[0]
					} (${containerInfo.Id.slice(0, 12)})...`
					await docker.getContainer(containerInfo.Id).restart()
					spinner.succeed(
						`Restarted ${containerInfo.Names[0]} (${containerInfo.Id.slice(
							0,
							12
						)})`
					)
					spinner = spin('Restarting containers...').start()
				}
			}
		})
		.catch((error: any) => {
			spinner.fail(Chalk.red(`Failed to restart containers: ${error.message}`))
			process.exit(1)
		})
	// Once the restart succeeds, wait 20 seconds for the containers to complete startup
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 20000)
	})

	spinner.stop()
	process.exit(0)
}
