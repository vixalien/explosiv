#!/usr/bin/env node

const { resolve } = require('path')
const chokidar = require('chokidar')
const ora = require('ora')
const sirv = require('sirv')
const compression = require('compression')
const connect = require('connect')
const morgan = require('morgan')
const http = require('http')
const { readFileSync } = require('fs')
const chalk = require('chalk')
const sade = require('sade')
const build = require('./build')
const { removeSync } = require('fs-extra')

const cli = sade('explosiv')

cli.version(
	JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'))).version
)

cli
	.command('dev')
	.describe('Start the dev server, & rebuilds static files on file change')
	.action(explosivDev)
	.option(
		'-i, --indir',
		'Change input directory for your files. (defaults to `./pages`)'
	)
	.option(
		'-d, --devdir',
		'Change directory where your temporary development builds are stored. (defaults to `./__explosiv__`)'
	)
	.option(
		'-p, --port',
		'Change port for `dev server`. (defaults to process.env.PORT or `3000`)'
	)

cli
	.command('serve')
	.describe('Start a static file server')
	.action(explosivServe)
	.option(
		'-d, --dir',
		'Change directory whom files will be served. (defaults to `./out`)'
	)
	.option(
		'-p, --port',
		'Change port for `server`. (defaults to process.env.PORT or `3000`)'
	)

cli
	.command('build')
	.describe('Build production ready static files')
	.action(explosivProd)
	.option(
		'-i, --indir',
		'Change input directory for your files. (defaults to `./pages`)'
	)
	.option(
		'-o, --outdir',
		'Change output directory of your `build` command. (defaults to `./out`)'
	)

cli.parse(process.argv)

function explosivServe({ dir = 'out', port = 3000 }, dev = false) {
	const assets = sirv(resolve(dir), {
		dev: true,
	})

	let server = connect()

	if (!dev) {
		server.use(compression())
	}

	server.use(morgan('dev')).use(assets)

	http.createServer(server).listen(process.env.PORT || port, (err) => {
		if (err) throw err
		console.log(
			`${dev ? 'Development' : 'Static'} server is live at: ${chalk.cyan(
				`http://localhost:${process.env.PORT || port}`
			)}\n`
		)
	})
}

function explosivDev({
	indir = 'pages',
	devdir = '__explosiv__',
	port = 3000,
}) {
	process.env.NODE_ENV = 'development'

	const watcher = chokidar.watch('.', {
		awaitWriteFinish: true,
		ignoreInitial: true,
		ignored: (path) =>
			path.startsWith(devdir) || path.startsWith('node_modules'),
	})

	const spinner = ora('Building...')

	const buildWithSpinner = async () => {
		spinner.start()

		try {
			await build(indir, devdir)
			spinner.succeed('Built successfully...')
		} catch (err) {
			spinner.fail(err)
			console.error(err)
		}
	}

	watcher.on('change', async () => await buildWithSpinner())
	watcher.on('add', async () => await buildWithSpinner())
	watcher.on('ready', async () => {
		await buildWithSpinner()

		explosivServe({ dir: devdir, port }, true)
	})

	function exitHandler() {
		watcher.close()
		process.exit(0)
	}

	process.on('exit', exitHandler)
	process.on('SIGINT', exitHandler)
	process.on('SIGUSR1', exitHandler)
	process.on('SIGUSR2', exitHandler)
	process.on('uncaughtException', exitHandler)
}

async function explosivProd({ indir = 'pages', outdir = 'out' }) {
	removeSync(outdir)

	process.env.NODE_ENV = 'production'

	const spinner = ora('Building production build...').start()

	try {
		await build(indir, outdir)
		spinner.succeed('Built successfully...')
	} catch (err) {
		spinner.fail(err)
		throw err
	}
}
