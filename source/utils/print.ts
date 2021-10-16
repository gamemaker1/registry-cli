// Fancy output

import Chalk from 'chalk'

export const info = (...text: (string | number | boolean | object)[]) => {
	console.info(Chalk.cyan(':'), ...text)
}
export const success = (...text: (string | number | boolean | object)[]) => {
	console.info(Chalk.green('>'), ...text)
}
export const warn = (...text: (string | number | boolean | object)[]) => {
	console.warn(Chalk.yellow('='), ...text)
}
export const error = (...text: (string | number | boolean | object)[]) => {
	console.error(Chalk.red('!'), ...text)
}
