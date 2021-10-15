// Stop registry related containers

import Chalk from 'chalk'
import spin from 'ora'
import doesCommandExist from 'command-exists'

import EnquirerPackage from 'enquirer'
const { prompt } = EnquirerPackage

import * as Docker from '../utils/helpers/docker'

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

	// List running containers
	let runningContainers = await Docker.listContainers().catch((error: any) => {
		spinner.fail(Chalk.red(`Failed to list containers: ${error.message}`))
		process.exit(1)
	})

	spinner.stop()
	let { containersToStop } = (await prompt({
		type: 'multiselect',
		name: 'containersToStop',
		message: Chalk.reset('Choose the containers to stop'),
		choices: runningContainers.map((containerInfo) => {
			return `${containerInfo.name} (${containerInfo.id})`
		}),
		// @ts-expect-error -- Weird typings
		onSubmit() {
			// @ts-expect-error -- Weird typings
			if (this.selected.length === 0) {
				// @ts-expect-error -- Weird typings
				this.enable(this.focused)
			}
		},
	})) as { containersToStop: string[] }
	spinner = spin('Stopping containers...').start()

	for (const containerInfo of runningContainers) {
		if (
			containersToStop.some((containerName) =>
				containerName.includes(containerInfo.name)
			)
		) {
			spinner.text = `Stopping ${containerInfo.name} (${containerInfo.id})...`
			await Docker.stopContainer(containerInfo.id)

			spinner.succeed(`Stopped ${containerInfo.name} (${containerInfo.id})`)
			spinner = spin('Stopping containers...').start()
		}
	}

	spinner.stop()
	process.exit(0)
}
