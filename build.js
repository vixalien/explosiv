const fs = require('fs')
const { resolve } = require('path')
const { copy } = require('fs-extra')
const esbuild = require('esbuild')

let Build = async () => {
	try {
		await esbuild.build({
			entryPoints: ['src/jsx-runtime.js', 'src/cli.js'],
			outdir: 'dist',
			bundle: true,
			platform: 'node',
			format: 'cjs',
			external: fs.readdirSync('node_modules'),
		})
	} catch (err) {
		throw err
	}
	await copy(resolve('src/explosiv.shim.js'), resolve('dist/explosiv.shim.js'))
}

Build()
	.then(() => console.log('Build successful!'))
	.catch((err) => console.log('Error', err))
