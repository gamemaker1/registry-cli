// Start registry related containers

import Chalk from 'chalk'
import spin from 'ora'
import doesCommandExist from 'command-exists'

import EnquirerPackage from 'enquirer'
const { prompt } = EnquirerPackage

import * as Docker from '../helpers/docker'

export default async () => {
	let spinner = spin('Checking environment...').start()
	// Check for docker
	if (!(await doesCommandExist('docker'))) {
		spinner.fail(
			Chalk.red(
				'Could not find `docker` installed on your system. Please install docker from https://docs.docker.com/engine/install/ before stopped this command.'
			)
		)
		process.exit(1)
	}

	// List stopped containers
	let stoppedContainers = await Docker.listContainers({
		filters: { status: ['paused', 'exited', 'dead'] },
	}).catch((error: any) => {
		spinner.fail(Chalk.red(`Failed to list containers: ${error.message}`))
		process.exit(1)
	})

	spinner.stop()
	let { containersToStart } = (await prompt({
		type: 'multiselect',
		name: 'containersToStart',
		message: Chalk.reset('Choose the containers to start'),
		choices: stoppedContainers.map((containerInfo) => {
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
	})) as { containersToStart: string[] }
	spinner = spin('Starting containers...').start()

	for (const containerInfo of stoppedContainers) {
		if (
			containersToStart.some((containerName) =>
				containerName.includes(containerInfo.name)
			)
		) {
			spinner.text = `Starting ${containerInfo.name} (${containerInfo.id})...`
			await Docker.startContainer(containerInfo.id)

			spinner.succeed(`Started ${containerInfo.name} (${containerInfo.id})`)
			spinner = spin('Starting containers...').start()
		}
	}
	// Once the start succeeds, wait 40 seconds for the containers to complete startup
	spinner.text = 'Waiting for containers to start...'
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 40000)
	})

	spinner.stop()
	process.exit(0)
}
