# Changelog

## 0.1.0 — 2026-10-15

- Added a custom, responsive layout preset dropdown matching the existing controls.
- Added three permanent presets: Bento Showcase (default), Editorial Magazine, and Product Gallery.
- Added JSON-backed creation, updating, and deletion of user presets.
- Added a `*` marker when the working design differs from the selected preset.
- Protected built-in presets from update/deletion in the interface and storage API.
- Preserved older browser-saved layouts and existing editing/export behavior.
- Added focused preset tests and documented local storage requirements.

Validation: preset tests (5 passed), lint, production build, and browser checks.
See [implementation and browser verification notes](changes/2026-10-15-layout-presets.md).

Earlier local changes are recorded in [the mobile responsiveness notes](changes/2026-10-09-mobile-responsive.md).
