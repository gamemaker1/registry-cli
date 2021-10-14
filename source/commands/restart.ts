// Restart registry related containers

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

	// Restart the containers
	spinner = spin('Restarting containers...').start()
	// List running containers
	await docker
		.listContainers()
		.then((containers) => {
			if (containers?.length <= 0) {
				spinner.fail('Could not find running containers')
				process.exit(1)
			}

			return containers
		})
		.then(async (containers) => {
			// Parse options and figure out which containers to restart
			spinner.stop()
			let { containersToRestart } = (await prompt({
				type: 'multiselect',
				name: 'containersToRestart',
				message: Chalk.reset('Choose the containers to restart'),
				choices: containers.map((containerInfo) => {
					return {
						name: `${containerInfo.Image} (${containerInfo.Id.slice(0, 12)} | ${
							containerInfo.Names[0]
						})`,
						value: containerInfo.Names[0],
					}
				}),
			})) as { containersToRestart: string[] }
			spinner = spin('Restarting containers...').start()

			for (const containerInfo of containers) {
				if (
					containerInfo.Names.some((name) =>
						containersToRestart.some((containerName) =>
							containerName.includes(name)
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
	spinner.text = 'Waiting for containers to start...'
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 20000)
	})

	spinner.stop()
	process.exit(0)
}
