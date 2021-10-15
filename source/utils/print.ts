// Fancy output

import Chalk from 'chalk'

export const info = (...text: any[]) => {
	console.info(Chalk.cyan(':'), ...text)
}
export const success = (...text: any[]) => {
	console.info(Chalk.green('>'), ...text)
}
export const warn = (...text: any[]) => {
	console.warn(Chalk.yellow('='), ...text)
}
export const error = (...text: any[]) => {
	console.error(Chalk.red('!'), ...text)
}
