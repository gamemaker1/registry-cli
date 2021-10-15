// Create a new registry instance

import { constants as FsConstants } from 'fs'
import Fs from 'fs/promises'
import Compose from 'docker-compose'
import Chalk from 'chalk'
import spin from 'ora'
import got from 'got'
import doesCommandExist from 'command-exists'
// @ts-ignore -- No types for this module
import clone from 'git-clone/promise'

import replaceInFilePackage from 'replace-in-file'
const { replaceInFile } = replaceInFilePackage

import * as Print from '../utils/print'
import * as Config from '../utils/config'

export default async () => {
	let spinner = spin('Checking environment...').start()
	// Create the registry in the current directory
	const currentDirectory = process.cwd()
	// Check for git, docker and docker-compose
	if (!(await doesCommandExist('git'))) {
		spinner.fail(
			Chalk.red(
				'Could not find `git` installed on your system. Please install git from https://github.com/git-guides/install-git before running this command.'
			)
		)
		process.exit(1)
	}
	if (!(await doesCommandExist('docker'))) {
		spinner.fail(
			Chalk.red(
				'Could not find `docker` installed on your system. Please install docker from https://docs.docker.com/engine/install/ before running this command.'
			)
		)
		process.exit(1)
	}
	if (!(await doesCommandExist('docker-compose'))) {
		spinner.fail(
			Chalk.red(
				'Could not find `docker-compose` installed on your system. Please install docker-compose from https://docs.docker.com/compose/install/ before running this command.'
			)
		)
		process.exit(1)
	}
	// Check if directory is writable
	await Fs.access(currentDirectory, FsConstants.W_OK).catch(() => {
		spinner.fail(
			Chalk.red(
				`Process does not have write permission for ${currentDirectory}. Try creating a registry instance in a different directory that you have write access to.`
			)
		)
		process.exit(1)
	})
	spinner.succeed('We are in a sane environment, good to go!')
	Print.warn(
		'Add the following line at the end of `/etc/hosts`: `127.0.0.1 kc` (excluding quotes) (on Windows, it is `c:\\windows\\system32\\drivers\\etc\\hosts`).'
	)

	// Clone the gist that contains the setup files
	spinner = spin('Downloading setup files...').start()
	await clone(Config.setupFilesRepository, currentDirectory).catch(
		(error: any) => {
			spinner.fail(
				Chalk.red(`Failed to download setup files: ${error.message}`)
			)
			process.exit(1)
		}
	)
	spinner.succeed('Fetched setup files successfully')

	// Start elastic search, postgres and keycloak
	spinner = spin('Starting elastic search, postgres and keycloak...').start()
	// Run the docker-compose up command
	await Compose.upMany(['es', 'db', 'kc']).catch((error: any) => {
		spinner.fail(
			Chalk.red(`Failed to start dependent services: ${error.message}`)
		)
		process.exit(1)
	})
	// Once the up command succeeds, wait 40 seconds for the containers to complete startup
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 40000)
	})
	spinner.succeed('Dependent services started successfully')

	// Setup keycloak
	spinner = spin('Setting up keycloak...').start()
	// The realm-export file is automatically imported by keycloak on startup.
	// However, keycloak does not export client secret along with it. So we need to
	// regenerate it and set it in the docker-compose file before starting the registry
	try {
		const { access_token: accessToken } = await got({
			method: 'post',
			url: 'http://kc:8080/auth/realms/master/protocol/openid-connect/token',
			form: {
				client_id: 'admin-cli',
				username: 'admin',
				password: 'admin',
				grant_type: 'password',
			},
		}).json()
		const response: { id: string }[] = await got({
			method: 'get',
			url: 'http://kc:8080/auth/admin/realms/sunbird-rc/clients',
			searchParams: {
				clientId: 'admin-api',
			},
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		}).json()
		const clientId = response[0].id
		const { value: clientSecret } = await got({
			method: 'post',
			url: `http://kc:8080/auth/admin/realms/sunbird-rc/clients/${clientId}/client-secret`,
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		}).json()

		// Replace the old client secret with the new one
		await replaceInFile({
			files: ['docker-compose.yaml'],
			from: /.*sunbird_sso_admin_client_secret.*/,
			to: `      - sunbird_sso_admin_client_secret=${clientSecret}`,
		})

		spinner.succeed('Setup keycloak successfully!')
	} catch (error: any) {
		spinner.fail(
			Chalk.red(
				`Failed to regenerate client secret for admin-api client in keycloak: ${error.message}`
			)
		)
		process.exit(1)
	}

	// Start the registry
	spinner = spin('Starting the registry...').start()
	// Run the docker-compose up command
	await Compose.upOne('rg').catch((error: any) => {
		spinner.fail(Chalk.red(`Failed to start the registry: ${error.message}`))
		process.exit(1)
	})
	// Once the up command succeeds, wait 40 seconds for the containers to complete startup
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 40000)
	})
	spinner.succeed('Registry started successfully')

	process.exit(0)
}
