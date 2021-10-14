#!/usr/bin/env -S node --no-warnings --es-module-specifier-resolution node
// Entrypoint for CLI

import { Command } from 'commander'

import createRegistryInstance from './commands/init'

// Create the command-and-option parser
const program = new Command()

// Set the name
program.name('registry')

// Register all commands
program
	.command('init')
	.description('create a new registry instance in the current directory')
	.action(createRegistryInstance)

// Parse
program.parse()
