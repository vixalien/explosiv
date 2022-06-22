const document = require('min-document')

const createElement = (tag, props, ...children) => {
	if (!props) props = {}
	if (children.length == 0) children = props.children
	delete props.children
	if (typeof tag === 'function') return tag({ ...props, children })
	const element = document.createElement(tag)

	Object.entries(props || {}).forEach(([name, value]) => {
		if (!value) return
		if (name === 'html') element.innerHTML = value
		else if (name === 'class') element.className += value.toString()
		else if (name === 'className') element.className += value.toString()
		else if (name === 'style' && typeof value === 'object') {
			const styleString = Object.entries(value)
				.map(
					([k, v]) =>
						`${k.replace(
							/[A-Z]/g,
							(m) => '-' + m.toLowerCase()
						)}:${v.toString()}`
				)
				.join(';')

			element.setAttribute('style', styleString)
		} else element.setAttribute(name, value.toString())
	})

	children = [children].flat()

	children.forEach((child) => appendChild(element, child))

	return element
}

const appendChild = (parent, child) => {
	if (!child) return;
	if (Array.isArray(child)) {
		child.forEach((nestedChild) => appendChild(parent, nestedChild))
	} else if (child) {
		parent.appendChild(child.nodeType ? child : document.createTextNode(child))
	}
}

const createFragment = ({ children, ...props }) => {
	return [children]
		.flat()
		.map((child) => {
			if ((child === undefined) || (child === null)) return null;
			return child.nodeType ? child : document.createTextNode(child)
		})
		.filter(child => child)
}

const Head = ({ children, ...props }) => {
	if (!global.headContents) global.headContents = [];
	global.headContents = global.headContents.concat(children.filter((child) => !!child))
	return false
}

module.exports = {
	el: createElement,
	fragment: createFragment,
	Head,
}
