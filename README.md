# Grid Playground

A visual editor for building bento-style CSS grid layouts. Drag, resize, and style cards on a live grid, then export the result as ready-to-use code.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need Node.js and npm installed.

```
node -v
npm -v
```

### Installing

Clone the repo and install dependencies:

```
npm install
```

Start the dev server:

```
npm run dev
```

Open the printed local URL in your browser. Changes to the grid, columns, gap, and card styles are auto-saved to `localStorage` so a refresh won't lose your layout.

## Running the tests

There are no automated tests yet. To check the code manually:

```
npm run lint
```

### And coding style tests

Linting is handled by [Oxlint](https://oxc.rs), configured in [.oxlintrc.json](.oxlintrc.json).

## Deployment

Build a static production bundle with:

```
npm run build
```

The output lands in `dist/` and can be served from any static file host (Vercel, Netlify, GitHub Pages, etc.). Preview the production build locally with `npm run preview`.

## Built With

* [React](https://react.dev/) - UI library
* [Vite](https://vite.dev/) - build tool and dev server
* [Tailwind CSS](https://tailwindcss.com/) - styling
* [Oxlint](https://oxc.rs) - linting

## Contributing

This is a personal playground project; there's no formal contribution process at the moment. Feel free to open an issue or PR if you find a bug.

## Versioning

No formal versioning scheme is in use yet — see `package.json` for the current version.

## Authors

* **Jim Wang**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

* Default layout inspired by common bento-grid marketing sites
