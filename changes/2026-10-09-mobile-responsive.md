# Mobile responsive pass — 2026-10-09

Makes Grid Playground usable on phones. Desktop layout (`lg`, ≥1024px) is unchanged
except for the Reset button style and the fixed-width Export button.

## Grid preview fits small screens

**File:** `src/components/GridPreview.jsx`

- Below `sm` (640px) the grid is scaled with CSS `zoom: 0.6` (`max-sm:[zoom:0.6]`).
- Zoom shrinks row height, gaps, card padding and text together. Because everything
  scales uniformly, the card auto-grow check (which compares `scrollHeight` to
  `clientHeight`) sees the same ratios as on desktop, so opening the app on a phone
  doesn't inflate `rowSpan` values that are then saved to localStorage.
- Canvas padding tightened on mobile: `p-2 sm:p-4 md:p-6`.
- To tune the scale, change `0.6` in `max-sm:[zoom:0.6]`.

## Mobile layout: fixed viewport, independent scrolling

**Files:** `src/App.jsx`, `src/components/Controls.jsx`

- On mobile the page is locked to the screen height (`max-lg:h-dvh`), so the page itself
  no longer scrolls. Desktop keeps `lg:min-h-screen`.
- The grid preview is shown **above** the controls on mobile (`order-first lg:order-none`).
- The preview and the control panel each take half the space and scroll on their own
  (`min-h-0` + `overflow-y-auto`).
- The control panel is full width on mobile (`w-full`). Its sections are kept from being
  squashed inside the scroll area (`max-lg:*:shrink-0`).

## Header

**File:** `src/App.jsx`

- Tighter padding on small screens: `px-4 py-3 sm:px-6 sm:py-4`.
- **Reset** is now a real button on both desktop and mobile: an outlined pill (dark text,
  thin inset ring, light hover fill) sized like Export code.
- **Export button labels:** on mobile it reads **Export** / **Close**; on desktop it still
  reads **Export code** / **Hide code**.
- **No layout shift when toggling:** both labels sit in the same grid cell
  (`[grid-area:1/1]`) and the inactive one is `invisible`, so the button always takes the
  width of the longer label. Hidden labels are also skipped by screen readers.

> Tried and reverted: moving Reset/Export into their own bar between the header and the
> preview on mobile. They stay in the header.

## Code export panel

**File:** `src/components/CodeExportPanel.jsx`, `src/App.jsx`

- **Mobile overlay:** instead of being squeezed into the preview column, the panel covers
  the preview + controls area (`max-lg:absolute max-lg:inset-0 max-lg:z-50`) and scrolls
  internally.
- It is positioned against the preview/controls wrapper (now `relative`), so its top edge
  lines up exactly with the top of the grid preview at every screen size, regardless of
  header height. The header stays visible, so **Close** is always reachable.
- **Copy buttons — accessibility (mobile):**
  - Minimum 44×44px touch target (`max-lg:min-h-11 max-lg:min-w-11`), meeting WCAG 2.5.5
    (AAA) and Apple HIG; text bumped to 14px.
  - Distinct accessible names: "Copy HTML" / "Copy CSS" via a `sr-only` label.
  - `aria-live="polite"` so "Copied!" is announced.
  - Visible keyboard focus ring (lime outline on `focus-visible`).
- **Copy failure feedback:** clipboard errors are now caught. The button turns red and
  reads "Copy failed" for 1.5s (also announced via `aria-live`). Common cause: the
  clipboard API only exists on HTTPS or `localhost`, so opening the dev server on a phone
  via the computer's LAN IP (`http://192.168.x.x:5173`) can't copy.

## Not done

- No dimmed backdrop or tap-outside-to-close on the mobile export overlay.
- Preview/controls split is 50/50 on mobile; could be weighted toward the preview.
- Changes were verified with `npm run build` only, not on a real device.
