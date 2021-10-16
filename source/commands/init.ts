// Create a new registry instance

import { constants as FsConstants } from 'fs'
import Fs from 'fs/promises'
import Path from 'path'
import Compose from 'docker-compose'
import Chalk from 'chalk'
import spin from 'ora'
import got from 'got'
import doesCommandExist from 'command-exists'
// @ts-ignore -- No types for this module
import clone from 'git-clone/promise'

import replaceInFilePackage from 'replace-in-file'
const { replaceInFile } = replaceInFilePackage

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

	// Clone the gist that contains the setup files
	spinner = spin('Downloading setup files...').start()
	await clone(Config.setupFilesRepository, currentDirectory).catch(
		(error: any) => {
			spinner.fail(
				Chalk.red(
					`Failed to download setup files: ${error.message}. Is the current directory not empty?`
				)
			)
			process.exit(1)
		}
	)
	spinner.succeed('Fetched setup files successfully')

	// Check that the cloned repo contains an `imports` and `schemas` folder, as well as a `docker-compose.yaml` file.
	spinner = spin('Checking setup files...')
	await Fs.access(
		Path.resolve(currentDirectory, 'imports'),
		FsConstants.F_OK
	).catch(() => {
		spinner.fail(
			Chalk.red(
				`Setup files do not have an 'imports' folder, used to preconfigure keycloak.`
			)
		)
		process.exit(1)
	})
	await Fs.access(
		Path.resolve(currentDirectory, 'schemas'),
		FsConstants.F_OK
	).catch(() => {
		spinner.fail(
			Chalk.red(
				`Setup files do not have an 'schemas' folder, used to add schemas to the registry.`
			)
		)
		process.exit(1)
	})
	await Fs.access(
		Path.resolve(currentDirectory, 'docker-compose.yaml'),
		FsConstants.W_OK
	).catch(() => {
		spinner.fail(
			Chalk.red(
				`Setup files do not have an 'docker-compose.yaml' file, used to start the registry and dependent services.`
			)
		)
		process.exit(1)
	})
	spinner.succeed('Setup files contain necessary info for starting registry')

	// Start elastic search, postgres and keycloak
	spinner = spin('Starting elastic search, postgres and keycloak...').start()
	// Run the docker-compose up command
	await Compose.upMany(Config.containerNames.slice(1)).catch((error: any) => {
		spinner.fail(
			Chalk.red(
				`Failed to start dependent services: ${
					error.message ?? error.err ?? 'unknown error'
				}`
			)
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
			url: `${Config.keycloakUri}/auth/realms/master/protocol/openid-connect/token`,
			form: {
				client_id: 'admin-cli',
				username: Config.keycloakAdminUsername,
				password: Config.keycloakAdminPassword,
				grant_type: 'password',
			},
		}).json()
		const [{ id: clientId }] = await got({
			method: 'get',
			url: `${Config.keycloakUri}/auth/admin/realms/${Config.keycloakRealm}/clients`,
			searchParams: {
				clientId: Config.keycloakAdminClientId,
			},
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		}).json()
		const { value: clientSecret } = await got({
			method: 'post',
			url: `${Config.keycloakUri}/auth/admin/realms/${Config.keycloakRealm}/clients/${clientId}/client-secret`,
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		}).json()

		// Replace the old client secret with the new one
		await replaceInFile({
			files: ['docker-compose.yaml'],
			from: new RegExp(`.*${Config.keycloakClientSecretEnvVar}.*`),
			to: `      - ${Config.keycloakClientSecretEnvVar}=${clientSecret}`,
		})

		spinner.succeed('Setup keycloak successfully!')
	} catch (error: any) {
		spinner.fail(
			Chalk.red(
				`Failed to regenerate client secret for admin-api client in keycloak: ${error.message}. Have you edited your hosts file?`
			)
		)
		process.exit(1)
	}

	// Start the registry
	spinner = spin('Starting the registry...').start()
	// Run the docker-compose up command
	await Compose.upOne(Config.containerNames[0]).catch((error: any) => {
		spinner.fail(
			Chalk.red(
				`Failed to start the registry: ${
					error.message ?? error.err ?? 'unknown error'
				}`
			)
		)
		process.exit(1)
	})
	// Once the up command succeeds, wait 40 seconds for the containers to complete startup
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 40000)
	})
	spinner.succeed('Registry started successfully')

	process.exit(0)
}
