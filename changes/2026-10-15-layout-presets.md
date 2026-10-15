# Layout presets — 0.1.0 — 2026-10-15

## Scope

Added only the preset feature and its supporting storage, documentation, version,
and tests. Existing uncommitted mobile changes were retained. No unrelated bugs
were fixed, and existing card, preview, and export implementations were not changed.

## Behavior

- Three built-in templates use the existing grid, style, color, text, image,
  background-image, content visibility, and span options.
- Bento Showcase is the initial/default and Reset layout. Previous localStorage
  designs are preserved until the user applies a preset.
- A custom combobox/listbox supports pointer input, arrow keys, Home/End,
  Enter/Space, Escape, focus dismissal, and outside-click dismissal.
- The selected name gains `*` when the design differs from its template. Detection
  covers every editable field, colors, card order, addition, and removal, but
  ignores generated card IDs. Exact reversion clears the marker.
- Save as new creates a user preset. Update applies only to a user preset.
  Delete removes only a user preset and keeps the current design.
- Built-in definitions remain in `src/presets.js`; writable records are isolated
  in `data/user-presets.json`. The API rejects attempts to update/delete built-ins.
- The storage endpoint validates incoming data, rejects duplicate names, serializes
  writes, and replaces JSON through a temporary file. An unreadable preset file
  produces an error rather than silently overwriting it.
- Current edits and the selected preset ID remain in localStorage. Saved user
  presets are shared through the local project server, not browser-local files.

## Validation

- `npm run test:presets`: 5 tests passed. Covers all editable design fields, JSON
  create/read/update/delete, all built-in schemas, built-in write protection,
  duplicate/invalid input rejection, concurrent saves, and malformed JSON preservation.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Browser: applied all three built-ins and checked their layouts visually.
- Browser: changed text and gap settings; confirmed `*` appears and clears when
  original values are restored. Unsaved edits and the marker survive reload.
- Browser: created a user preset, updated it, reloaded and reapplied it, then deleted
  it and reloaded again. Inspected the actual JSON file after save/update and deletion.
- Browser: Reset restored Bento and preserved the saved user preset. Built-in
  choices expose no Update/Delete controls. Duplicate-name errors are visible.
- Browser: keyboard selection worked; export included the selected grid/styles,
  and Copy CSS displayed its success feedback.
- Browser: inspected the picker at phone, tablet, and desktop sizes (320–1440 CSS
  pixels wide). Compact phone rows avoid overly tall option descriptions.
- Verification used resized desktop browser viewports, not physical mobile devices.
- Temporary browser-test presets were deleted after verification.

## Storage/runtime requirements

The API runs with the existing Vite development server and Vite preview server.
Static hosting of `dist` alone cannot write the JSON file. No new package
installations or third-party service connections were added.

## Out-of-scope observation (left unchanged)

At very narrow phone widths, the existing header's Reset/Export buttons extend
past the header container; at roughly 291 CSS pixels the page also scrolls
horizontally. The header markup and styling were already present before this
feature and were not changed. This remains available for the assignment's later
bug-report/fix workflow.

## Visual evidence

- [Desktop preset picker](evidence/preset-picker-desktop.jpg)
- [Phone preset picker](evidence/preset-picker-phone.jpg)
- [Tablet preset picker](evidence/preset-picker-tablet.jpg)
- [Existing narrow header overflow, left unchanged](evidence/existing-header-narrow.jpg)
