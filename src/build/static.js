const { resolve, posix } = require('path')
const { copy, readFile, writeFile, exists } = require('fs-extra')
const postcss = require('postcss')
const fg = require('fast-glob')

let buildStatic = async (_, outdir) => {
	// Start the esbuild child process once
	const basedir = resolve(outdir)

	// Copy from public
	const publicDir = resolve('public')

	if (await exists(publicDir)) await copy(publicDir, basedir)

	const cssFiles = await fg(posix.join(publicDir, '/**/*.css'))

	let postcssPlugins = null

	if (await exists(resolve('postcss.config.js'))) {
		const postcssConfig = require(resolve('postcss.config.js'))
		postcssPlugins = postcssConfig.plugins
	}

	if (postcssPlugins && postcssPlugins !== null) {
		const cssProcessor = postcss(postcssPlugins)

		for (let file of cssFiles) {
			const filePath = resolve(file)
			const result = await cssProcessor.process(await readFile(filePath), {
				from: filePath,
			})

			const newFilePath = filePath.replace(publicDir, basedir)
			await writeFile(newFilePath, result.css)
		}
	}
}

module.exports = buildStatic
