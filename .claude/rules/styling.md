---
paths:
  - "src/**/*.css"
  - "src/lib/theme*.ts"
  - "src/hooks/useHostTheme.ts"
---

# Palette and layout

## The palette is computed at runtime

`deriveTheme()` (`src/lib/theme.ts`) reads the grey the host reports (`appSkinInfo`), solves
the whole ramp and overwrites the custom properties through `useHostTheme`. Editing
`tokens.css` changes the browser preview and nothing else. Change colors in `theme.ts`, then
update `tokens.css` to match.

Each level is solved for a contrast ratio against the surface under it:

- Surfaces against `--ground`: `--raised` 1.05, `--plate` 1.14, `--control` 1.35.
- 1.35 on `--control` is a ceiling. Ink is solved against `control`, and a lighter fill leaves
  no room for four distinct ink levels while keeping `--ink-lo` at 4.5:1.
- Ink is solved against `ground` and `control` at once. Never use one as a proxy for the other.
- `theme.test.ts` sweeps all 256 possible host greys. An earlier solver returned `--ink-lo`
  lighter than `--ink-hi` on mid greys, and sampling only AE's four slider values missed it.
  Do not shrink the sweep.
- Between host greys 103 and 137 no ink reaches 4.5:1 against both surfaces (the real maximum
  is about 4.1:1). That is a mathematical limit, not a bug. The ramp compresses as a block
  there to stay ordered, and AE never reports those greys.
- Strictly monochrome: state reads through icon, weight and luminance, never hue. The one
  exception is selection, which takes the host highlight color.

## Flat controls

`--control-edge` and `--control-edge-hover` in `tokens.css` set the border of everything the
user operates (buttons, fields, dropdowns, checkbox, presets, the anchor keypad). They are
`transparent`, so the fill alone identifies a control. This is a deliberate departure from
WCAG 1.4.11, which asks 3:1 of the outline and cannot be met by a filled control on a
near-black panel without turning the UI mid-grey. To revert, point them at `var(--edge)` and
`var(--edge-hover)`. Surfaces the user does not operate keep their border: popover, confirm
dialog, toasts and the status box.

## Width steps: 300 / 380 / 480

They are spread across three files. Change them together.

| Step | File | Effect |
|---|---|---|
| 300 / 380 | `tokens.css` | `--gutter` 12px / 16px |
| 380 | `Dropdown.module.css` | label beside the control instead of above |
| 480 | `App.module.css` | the rail opens and shows tool names |

Compute them from what a control receives, `panel − 44 (rail) − 2 × gutter`, not from the
panel width.
