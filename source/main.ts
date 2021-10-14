#!/usr/bin/env -S node --no-warnings --es-module-specifier-resolution node
// Entrypoint for CLI

import { Command } from 'commander'

import createRegistryInstance from './commands/init'
import restartRegistryInstance from './commands/restart'

// Create the command-and-option parser
const program = new Command()

// Set the name
program.name('registry')

// Register all commands
program
	.command('init')
	.description('create a new registry instance in the current directory')
	.action(createRegistryInstance)
program
	.command('restart')
	.description('restarts any running registry instances')
	.option(
		'-a, --all',
		'restart dependent services (keycloak, postgres, elastic search)',
		false
	)
	.action(restartRegistryInstance)

// Parse
program.parseAsync()
