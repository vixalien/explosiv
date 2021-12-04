const {
	join,
	resolve,
	posix: { join: posixJoin },
} = require('path')
const fg = require('fast-glob')

let LoadCustomDocument = (document, indir, outdir) => {
	const basedir = resolve(outdir)

	if (fg.sync(posixJoin(outdir, indir, '_document.js')).length) {
		const customDocument = require(join(
			basedir,
			indir,
			'_document.js'
		)).default()

		const bodyEl = customDocument.getElementsByTagName('body')[0]
		const headEl = customDocument.getElementsByTagName('head')[0]

		// Copy className
		document.getElementsByTagName('html')[0].className =
			customDocument.className
		document.body.className = bodyEl.className

		Object.entries(customDocument._attributes[null]).forEach(([key, value]) => {
			document
				.getElementsByTagName('html')[0]
				.setAttribute(key, value.value.toString())
		})

		// Have to use Array.from for `min-document` specific reasons
		Array.from(bodyEl.childNodes).forEach((childNode) => {
			document.body.appendChild(childNode)
		})

		Array.from(headEl.childNodes).forEach((childNode) => {
			document.head.appendChild(childNode)
		})
	} else {
		const containerDiv = document.createElement('div')
		containerDiv.className += 'root'
		document.body.appendChild(containerDiv)
	}
}

let initDocument = (indir, outdir) => {
	const document = require('min-document')

	document.body.childNodes = []
	document.body.innerHTML = ''
	document.head.childNodes = []
	document.head.innerHTML = ''

	LoadCustomDocument(document, indir, outdir)

	return document
}

module.exports = initDocument
