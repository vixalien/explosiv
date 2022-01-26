# 🧨 Explosiv

![npm version](https://img.shields.io/npm/v/explosiv) ![Size](https://img.shields.io/bundlephobia/minzip/explosiv)

> A fork of the already beautiful [Dhow](https://www.github.com/kartiknair/dhow)

A simple and powerful JSX Static Site Generator.



## Getting started

### 1. Install it to your development dependencies.

```bash
npm i explosiv -D
```

### 2. Write your first page.

Explosiv allow you to build static sites written in JSX. To get started, create a file called `pages/index.js`:

```jsx
// pages/index.js
export default () => (
  <main>
    <Head>
      <title>Home page</title>
    </Head>
    <h3>This is my home</h3>
    <p>On the internet obviously</p>
  </main>
)
```

### 3. Build your static site!

```bash
npx explosiv build
```

Building your site will transform your JSX into static HTML. Your site will be exported into the `out/` directory.

> An alternate way to use: Install Explosiv globally `npm i explosiv -g` then run your commands like this: `explosiv build`

### 4. Serve your site!

```bash
npx explosiv serve
```

Your site will be ready at [http://localhost:3000]()

> There is an [article about how Explosiv works][article].

## Public files

Files in `public/` will be copied into your build output. However, CSS files will be processed with [PostCSS](https://github.com/postcss/postcss). This means you can create a `postcss.config.js` file in the root of your directory, and Explosiv will use the plugins you use in that file (you can see this in the [TailwindCSS example](https://github.com/vixalien/explosiv/tree/master/examples/tailwind)).

## CLI

**explosiv build**

Build production ready static files

```bash
npx explosiv build -i ./pages -d ./out
```

| Option          | Description                               | Default        |
| --------------- | ----------------------------------------- | -------------- |
| -i, --indir     | Change input directory for your files.    | `./pages`        |
| -o, --outdir    | Change directory where your temporary development builds are  stored.  | `./out` |

<br/>

**explosiv dev**

Build files, start a development server, & rebuilds static files on each file change.

```bash
explosiv dev -i ./pages -d ./__explosiv__ -p 3000
```

| Option          | Description                               | Default        |
| --------------- | ----------------------------------------- | -------------- |
| -i, --indir     | Change input directory for your files.    | `./pages`        |
| -d, --devdir    | Change directory where your temporary development builds are  stored.  | `./__explosiv__` |
| -p, --port      | Change port for HTTP Server              | `process.env.PORT` or `3000` |

> **Note:** `explosiv dev` doesn't rebuild files when a file changed is in `node_modules` or in the temporary development directory (`devdir`).

<br/>

**explosiv serve**

Start a simple & static HTTP file server.

```bash
explosiv serve -d ./pages -p 3000
```

| Option          | Description                               | Default        |
| --------------- | ----------------------------------------- | -------------- |
| -d, --dir       | Change input directory for your files.    | `./pages`      |
| -p, --port      | Change port for HTTP Server              | process.env.PORT or `3000` |

<br/>

## API

There is no case we can see you doing `require('explosiv')`. But, it exports a JSX Runtime, that we uses under the hood to transform your JSX pages into HTML. Functions it export are listed here.

**el(tag, props, ...children)**

Append a new Element to the DOM. In other words, turn a JSX component into an HTML DOM element.

* **tag** {`String `|`Function`} tagName of component to create, or a function to create an element.
* **props** {`Object`} A dictionary of HTML attributes.
* **children** {`Array`|`String`|`Fragment`|`Component`}

> The prop `html` sets the innerHTML of the element.

> The `class` and `className` props all create a `class` attribute.

> The `style` attribute can be a `String` or `Object`. If it is an Object, it will be transformed into a String.

<br/>

**Head({ children, ...props })**

Add children to the DOM's `<head>` element. Available built-in, no need to import it

<br/>

**Fragment({ children, ...props })**

Add children to the parent component without creating a new HTML element. Built-in in JSX as `<>text</>`

<br/>

## Contributing

Feel free to add any features you might find useful. Just open an issue and we can go there. If you find a bug you can also open an issue but please make sure to include details like your system, node version, etc.

## Notes

Please read the [notes] to see Improvements over Dhow, and differences with React.


## Usage Cases

> There are real-world examples in [the `examples/` directory](examples)

**With Fragment tags**

```jsx
// pages/fragment.js
export default () => (
  <main>
    <h3>Hello!</h3>
    <>
      <p>I'm vixalien</p>
      <p>But only on the internet</p>
    </>
  </main>
)
```

<br/>

**`style` can either be an Object or String**

```jsx
// pages/style-prop.js
export default () => (
  <main>
    <Head>
      <title>Home page</title>
    </Head>
    <p style="color: blue;">This is my blue paragraph</p>
    <p style={{color: 'blue'}}>This does the same thing</p>
  </main>
)
```

<br/>

**`class` and `className`**

The `className` prop will export a `class` HTML attribute.

```jsx
// pages/className-is-same-as-class.js
export default () => (
  <main>
    <Head>
      <title>Home page</title>
    </Head>
    <p class="fancy">This is my fancy paragraph</p>
    <p className="fancy">Another similarly fancy paragraph</p>
  </main>
)
```

> Note that using `class` is not recommended. Please use `className` instead.

<br/>

**Using `Head`**

`Head` will export it's children into the `<head>` of HTML. Useful for SEO!

```jsx
// pages/Head.js
export default () => (
  <main>
    <Head>
      <title>Home page</title>
      <meta name="description" content="This is my Internet home"/>
    </Head>
    <h3>This is my home</h3>
    <p>On the internet obviously</p>
  </main>
)
```

<br/>

**Using getProps**

If you export `getProps`, it will be called at build time to get any data you may require. That data will be passed into the main export of your file.

```jsx
// pages/onepost.js
export default (data) => (
  <main>
    <Head>
      <title>{data.name}</title>
      <meta name="description" content={data.description}/>
    </Head>
    <h3>Post name: {data.name}</h3>
    <p>Description: {data.description}</p>
    <small>Created: {data.created}</small>
  </main>
)

export getProps = () => {
  return {
    name: 'Post',
    description: 'A Post lol',
    created: 'Yesterday'
  }
}
```

<br/>

**Using getPaths**

If you name your file like `[slug].js`, (i.e with square brackets) and export `getPaths`, it will be called at build time to get all possible slugs.

```jsx
// pages/[posts].js
export default (data) => (
  <main>
    <Head>
      <title>{data.name}</title>
      <meta name="description" content={data.description}/>
    </Head>
    <h3>Post name: {data.name}</h3>
    <p>Description: {data.description}</p>
    <small>Created: {data.created}</small>
  </main>
)

export getProps = (slug) => {
  return somehowGetDataAboutPost(slug);
}

export getPaths = () => {
  return ['post1', 'post2']
}
```

<br/>

**Using `_document.js`**

If you create a file `_document.js` in your pages' root (i.e `pages/_document.js`), it will be used as a wrapper for all your documents. Actual page data will be rendered in the first element with class `root` or `<body/>`.

```jsx
// pages/_document.js
export default () => (
  <>
    <Head>
      <title>All pages will have this title (unless you override it)</title>
      <link rel="stylesheet" href="/css/site-css-maybe.css"/>
      <script src="https://some-analytics.com"/>
    </Head>
    <body>
      <div class="root"/>
    </body>
  </>
)
```

```jsx
// pages/index.js
export default () => (
  <main>
    <Head>
      <title>Yes you can override the title!</title>
    </Head>
    <h3>Hello!</h3>
    <p>But only on the internet</p>
  </main>
)
```

<br/>

**Using `postcss.config.js`**

If you create a file `postcss.config.js` in your absolute root (i.e `./postcss.config.js`), it will be used as a [PostCSS] config for post-processing your CSS files. This allows you to do things like use [`autoprefixer`][autoprefixer] or [`cssnano`][cssnano] or

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    })
  ],
};
// Our CSS will be auto prefixed now and minified!
```
> You can see a working `postcss.config.js` in the [tailwind example][tailwind]

<br/>

[autoprefixer]: https://autoprefixer.github.io/
[postcss]: https://postcss.org/
[react]: https://reactjs.org
[cssnano]: https://cssnano.co/

[article]: https://vixalien.ga/post/explosiv
[notes]: https://github.com/vixalien/explosiv/blob/master/notes.md

[examples]: https://github.com/vixalien/explosiv/tree/master/examples
[tailwind]: https://github.com/vixalien/explosiv/tree/master/examples/tailwind