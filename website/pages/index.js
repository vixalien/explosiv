import promises from 'fs/promises'
const { readFile, readdir } = promises;
import { join } from 'path'
import { marked } from 'marked'
import prism from 'prismjs'
import { version } from '../package.json'

const Post = ({post, toc}) => (
	<>
		<Head>
			<title>🧨 Explosiv</title>
			<meta name="description" content='Documentation for the Explosiv JSX Framework' />
		</Head>

		<header>
			<h1>🧨 Explosiv</h1>
			<nav html={toc.join('\n')}/>
		</header>

		<main html={post}/>
	</>
)

export const getProps = async (slug) => {
	let post = await readFile(join('..', `README.md`), 'utf-8')

	const renderer = new marked.Renderer()

	var toc = [];

	renderer.heading = function(text, level, raw) {
			var anchor = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');
			
			if (level == 2) {
				toc.push(`<a href="#${anchor}">${text}</a>`)
			}
			if (level == 1) {
				return '';
			} else {
				return `<h${level} id="${anchor}">${text}</h${level}>`;
			}
	};

	marked.setOptions({
			renderer: renderer
	});

	marked.setOptions({
		renderer,
		highlight: function (code, lang) {
			if (prism.languages[lang]) {
				return prism.highlight(code, prism.languages[lang], lang)
			} else {
				return code
			}
		},
	})

	return { post: marked(post), toc }
}

export default Post
