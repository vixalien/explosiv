import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { spawnSync } from 'child_process'

function exec(file, argv = []) {
	return spawnSync('node', [file, ...argv])
}

test('`--help` parameter', () => {
	let pid = exec('src/cli.js', ['--help'])
	assert.equal(pid.status, 0, 'should exits without error code')
	assert.is(
		pid.stdout.toString(),
		`
  Usage
    $ explosiv <command> [options]

  Available Commands
    dev      Start the dev server, & rebuilds static files on file change
    serve    Start a static file server
    build    Build production ready static files

  For more info, run any command with the \`--help\` flag
    $ explosiv dev --help
    $ explosiv serve --help

  Options
    -v, --version    Displays current version
    -h, --help       Displays this message

`,
		'should display help message'
	)
})

test('`build` parameter', () => {
	let pid = exec('src/cli.js', ['build'])
	// assert.equal(pid.status, 0, 'should exits without error code')
	console.log(pid.stdout.toString())
	assert.equal(pid.stdout.toString(), '')
})

test.run()
