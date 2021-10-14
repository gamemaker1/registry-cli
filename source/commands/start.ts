// Start registry related containers

import Docker from 'dockerode'
import Chalk from 'chalk'
import spin from 'ora'
import doesCommandExist from 'command-exists'

import EnquirerPackage from 'enquirer'
const { prompt } = EnquirerPackage

export default async () => {
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
	spinner.stop()

	// Create a docker instance
	const docker = new Docker()

	// Start the containers
	spinner = spin('Starting containers...').start()
	// List running containers
	await docker
		.listContainers({ filters: { status: ['paused', 'exited', 'dead'] } })
		.then((containers) => {
			if (containers?.length <= 0) {
				spinner.fail('Could not find stopped containers')
				process.exit(1)
			}

			return containers
		})
		.then(async (containers) => {
			// Parse options and figure out which containers to start
			spinner.stop()
			let { containersToStart } = (await prompt({
				type: 'multiselect',
				name: 'containersToStart',
				message: Chalk.reset('Choose the containers to start'),
				choices: containers.map((containerInfo) => {
					return {
						name: `${containerInfo.Image} (${containerInfo.Id.slice(0, 12)}) (${
							containerInfo.Names[0]
						})`,
						value: containerInfo.Names[0],
					}
				}),
				required: true,
			})) as { containersToStart: string[] }
			spinner = spin('Starting containers...').start()

			for (const containerInfo of containers) {
				if (
					containerInfo.Names.some((name) =>
						containersToStart.some((containerName) =>
							containerName.includes(name)
						)
					)
				) {
					spinner.text = `Starting ${
						containerInfo.Names[0]
					} (${containerInfo.Id.slice(0, 12)})...`
					await docker.getContainer(containerInfo.Id).start()
					spinner.succeed(
						`Started ${containerInfo.Names[0]} (${containerInfo.Id.slice(
							0,
							12
						)})`
					)
					spinner = spin('Starting containers...').start()
				}
			}
		})
		.catch((error: any) => {
			spinner.fail(Chalk.red(`Failed to start containers: ${error.message}`))
			process.exit(1)
		})
	// Once the start command succeeds, wait 20 seconds for the containers to complete startup
	spinner.text = 'Waiting for containers to start...'
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 20000)
	})

	spinner.stop()
	process.exit(0)
}
