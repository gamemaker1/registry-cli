// Stop registry related containers

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

	// Stop the containers
	spinner = spin('Stopping containers...').start()
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
			// Parse options and figure out which containers to stop
			spinner.stop()
			let { containersToStop } = (await prompt({
				type: 'multiselect',
				name: 'containersToStop',
				message: Chalk.reset('Choose the containers to stop'),
				choices: containers.map((containerInfo) => {
					return {
						name: `${containerInfo.Image} (${containerInfo.Id.slice(0, 12)}) (${
							containerInfo.Names[0]
						})`,
						value: containerInfo.Names[0],
					}
				}),
				required: true,
			})) as { containersToStop: string[] }
			spinner = spin('Stopping containers...').start()

			for (const containerInfo of containers) {
				if (
					containerInfo.Names.some((name) =>
						containersToStop.some((containerName) =>
							containerName.includes(name)
						)
					)
				) {
					spinner.text = `Stopping ${
						containerInfo.Names[0]
					} (${containerInfo.Id.slice(0, 12)})...`
					await docker.getContainer(containerInfo.Id).stop()
					spinner.succeed(
						`Stopped ${containerInfo.Names[0]} (${containerInfo.Id.slice(
							0,
							12
						)})`
					)
					spinner = spin('Stopping containers...').start()
				}
			}
		})
		.catch((error: any) => {
			spinner.fail(Chalk.red(`Failed to stop containers: ${error.message}`))
			process.exit(1)
		})

	spinner.stop()
	process.exit(0)
}
