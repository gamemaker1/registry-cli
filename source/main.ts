#!/usr/bin/env -S node --no-warnings --es-module-specifier-resolution node
// Entrypoint for CLI

import { Command } from 'commander'

import createRegistryInstance from './commands/init'
import restartContainers from './commands/restart'
import stopContainers from './commands/stop'
import startContainers from './commands/start'

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
	.description('restarts registry-related containers')
	.action(restartContainers)
program
	.command('stop')
	.description('stops registry-related containers')
	.action(stopContainers)
program
	.command('start')
	.description('starts registry-related containers')
	.action(startContainers)

// Parse
program.parseAsync()
