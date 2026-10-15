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

## Layout presets (v0.1.0)

Use **Layout preset** at the top of the controls panel:

- **Bento Showcase** (default): mixed-size tiles for a landing page.
- **Editorial Magazine**: a lead story with supporting articles.
- **Product Gallery**: equal-width product cards and a promotional banner.

Choosing a preset replaces the working layout, including its cards, colors, grid,
and shared card styling. You can still edit everything using the existing controls.
Built-in presets cannot be updated or deleted. **Reset** restores Bento Showcase
without deleting your saved presets. Older browser-saved layouts are preserved and
shown as **Custom layout** until you choose or save a preset.

A **\*** after a preset name means the current design differs from that preset.
Restoring its original values clears the marker. Enter a unique name and choose
**Save as new preset** to save the current design. For your own selected preset,
**Update preset** saves edits in place; **Delete preset** removes the saved preset
while keeping the working layout. These actions never alter built-in templates.

User presets are stored as JSON in **`data/user-presets.json`**, created on the first
save. Each entry contains a generated ID, name, grid settings, shared card styles,
custom colors, and ordered cards. The file is ignored by Git; back it up separately
if you want to keep your presets when moving the project. Presets belong to this
project server and are shared by browsers using it. The current working design and
selected preset ID continue to save in the browser's `localStorage`.

JSON saving requires the project server: `npm run dev`, or `npm run build` followed
by `npm run preview`. Serving `dist` as static files alone does not provide the
preset storage API; a static deployment would need a separate storage service.

The custom dropdown matches the dark, lime, and lavender controls. Use arrow keys,
Home/End, and Enter/Space to choose a preset, Escape to dismiss, or pointer input.
On phones, the menu uses compact rows inside the existing scrolling controls panel.

## Running the tests

Run the focused preset tests (Node's built-in test runner; no extra dependencies):

```sh
npm run test:presets
```

Check linting:

```
npm run lint
```

Check the production build:

```sh
npm run build
```

The preset tests cover JSON persistence, built-in protection, validation, concurrent
writes, and modification detection. Browser verification is recorded in
[the preset feature change log](changes/2026-10-15-layout-presets.md).

### And coding style tests

Linting is handled by [Oxlint](https://oxc.rs), configured in [.oxlintrc.json](.oxlintrc.json).

## Built With

* [React](https://react.dev/) - UI library
* [Vite](https://vite.dev/) - build tool and dev server
* [Tailwind CSS](https://tailwindcss.com/) - styling
* [Oxlint](https://oxc.rs) - linting

## Contributing

This is a personal playground project; there's no formal contribution process at the moment. Feel free to open an issue or PR if you find a bug.

## Versioning

Current version: **0.1.0**. See [CHANGELOG.md](CHANGELOG.md) for release notes.

## Authors

* **Jim Wang**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

* Default layout inspired by common bento-grid marketing sites
