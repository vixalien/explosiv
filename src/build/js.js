const { join, resolve, dirname, posix } = require('path')
const { ensureFile, writeFile, remove } = require('fs-extra')
const esbuild = require('esbuild')
const fg = require('fast-glob')
const newDocument = require('./document')

let buildJS = async (indir, outdir) => {
	const basedir = resolve(outdir)
	global.headContents = []

	try {
		// Part 5: write Into DOM
		let writePageDOM = async (pageDOM, path) => {
			document = newDocument(indir, outdir)
			const rootEl = document.getElementsByClassName('root')[0] || document.body

			if (Array.isArray(pageDOM)) {
				pageDOM.forEach((singleEl) => {
					rootEl.appendChild(singleEl)
				})
			} else {
				rootEl.appendChild(pageDOM)
			}

			for (let i = 0; i < global.headContents.length; i++) {
				const el = global.headContents[i]
				if (el.nodeType) {
					document.head.appendChild(el)
				}
			}

			await ensureFile(path)
			await writeFile(
				path,
				`<!DOCTYPE html>` + document.documentElement.toString()
			)

			rootEl.removeChild(pageDOM)

			global.headContents = []
		}

		// Part 1: transpile files
		const jsFiles = await fg(posix.join(indir, '/**/*.{ts,js,jsx,tsx}'))

		const services = jsFiles.map(async (file) =>
			esbuild.build({
				entryPoints: [file],
				outfile: join(basedir, file),
				bundle: true,
				platform: 'node',
				format: 'cjs',
				loader: {
					'.js': 'jsx',
					'.ts': 'tsx',
				},
				jsxFactory: 'Explosiv.el',
				jsxFragment: 'Explosiv.fragment',
				inject: [resolve(__dirname, './explosiv.shim.js')],
			})
		)

		await Promise.all(services)

		// Part 2: Handle configuration
		let pages = await fg(posix.join(outdir, indir, '/**/*.{ts,js,jsx,tsx}'))
		pages = pages.filter(
			(page) => page !== posix.join(outdir, indir, '_document.js')
		)

		for (let page of pages) {
			const fileExports = require(resolve(page))

			const filePath = posix
				.normalize(page)
				.split('/')
				.slice(1 + posix.normalize(indir).split('/').length)
				.join('/')
				.replace(/\..+$/, '')

			// Part 4: write the component
			let writeComponent = async (path = null) => {
				const props = fileExports.getProps
					? await fileExports.getProps(path)
					: {}

				let src

				if (path) src = join(dirname(filePath), path)
				else src = filePath

				if (src.endsWith('/index') || src == 'index') src = src + '.html'

				src = join(basedir, src, src.endsWith('html') ? '' : 'index.html')

				await writePageDOM(fileExports.default(props), src)
			}

			// Part 2...
			// Checks that the default export is a function
			if (typeof fileExports.default !== 'function')
				throw `Default export from a file in ${indir} must be a funtion`

			if (typeof fileExports.getPaths === 'function') {
				const paths = await fileExports.getPaths()

				for (let path of paths) {
					await writeComponent(path)
				}
			} else {
				await writeComponent()
			}
		}
	} catch (err) {
		throw err
	} finally {
		await remove(join(basedir, indir))
	}
}

module.exports = buildJS
