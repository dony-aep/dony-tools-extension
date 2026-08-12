# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0] - 2026-08-11

A rebuild around two goals: the panel should never interrupt After Effects, and it
should read as part of it rather than as an app running inside it. Nearly
everything below follows from one or the other.

### Breaking

- **Minimum version is now After Effects 2022 (22.0).** The 3.x manifest claimed CC 2018, but the panel already relied on browser features no runtime that old provides. The declared floor now matches what the code actually needs.
- **Bundle id is now `com.donyaep.DonyTools`.** After Effects treats this as a new extension: delete the old `com.dony.tools` folder from the CEP extensions directory and restart After Effects once. Saved presets survive the change.

### Nothing the panel does can block After Effects

- Every message that used to go through the host's `alert()` and `confirm()` is shown in the panel instead. A modal raised from the scripting engine holds After Effects hostage until someone dismisses it.
- Anything the user types — preset names, output module templates, folder names — is escaped before it reaches ExtendScript. A single quote used to produce a malformed script, and After Effects answers that with exactly the kind of blocking dialog above.
- Undo groups close exactly once, even when something above them throws; one host function had six ends for two begins. Host failures are reported now, instead of leaving buttons that silently do nothing.

### It reads as part of After Effects

- The panel takes its greys from the host's own theme and follows the brightness slider live, instead of painting a fixed black. Every level is solved for a contrast ratio against the surface it sits on rather than picked by eye — and the suite now proves the ramp holds for any grey the host could report, not just the four it does.
- Strictly monochrome: state reads through icon, weight and luminance, never hue. The exception is selection, which adopts the host's own highlight colour, so a selection here matches every other selection in the app.
- Controls are flat — the fill identifies them, not an outline. This is a deliberate departure from WCAG 1.4.11, which asks 3:1 of a control boundary: unreachable for a filled control on a near-black panel without turning the whole UI mid-grey. `tokens.css` records the trade-off and the two values that restore the outlined look.

### Navigation shaped for a docked panel

- A rail of tools replaces the home screen. Everything sits one click from everything else; the hub cost two clicks to reach a tool and a third to leave it, which is the wrong shape for a panel used in short bursts beside the comp.
- The layout answers the panel's width: compact below 300px, labels beside their controls at 380px, the rail opening out to name its tools at 480px. After Effects ignores the manifest MinSize once a panel is docked, so the real range is whatever the user drags it to.

### Foundations

- A token layer and shared primitives — `Button`, `Icon`, `Section`, `Toggle`, `ValueField`, `Dropdown` — replace styles that had been copy-pasted across five tabs.
- Fonts and icons ship with the panel. Opened without a network connection, 3.x fell back to a system font and drew every icon as its literal ligature name.
- Logic that needs no screen — preset matching, setup conversions, escaping, the colour ramp — moved to `src/lib` under 84 tests.
- CEP baseline modernised: CSInterface v11, CSXS 11 manifest, `chrome88` build target.

### Fixed

- Text sat below WCAG AA throughout: section titles and captions measured 2.14:1 where 4.5:1 is required. Ink clears 4.5:1 wherever it carries text, and the suite fails if that stops being true.
- The keyboard focus indicator was a 1px outline at 40% opacity. It is a 2px ring now, on every control, and text fields carry it inside their own frame instead of floating it outside.
- The layout was calibrated against a 350px panel; docked panels are commonly 270px or narrower, where paired fields collapsed and option text ran past the panel edge.
- The host reused its namespace across loads, so functions removed in a newer version stayed callable until After Effects was restarted.
- The 4:3 quick setup claimed 1440×1080; it creates 1600×1080.
- Animations respect `prefers-reduced-motion`.

## [3.0.0] - 2026-02-14

### Added

- Full migration to React 19 + TypeScript + Vite build system, replacing the legacy JSX/HTML-based architecture.
- React Aria Components for accessible, headless UI primitives (buttons, dropdowns, modals, checkboxes).
- CSS Modules per component for scoped, collision-free styling.
- Twixtor Pro effect controls: Speed %, Input Frame Rate, Motion Vectors, Image Prep, Frame Interp, and Warping dropdowns with correct values for Twixtor v5–v8.
- Twixtor plugin detection system that verifies installation and v5+ property compatibility on tab load.
- Twixtor info bar displaying plugin status (compatible, incompatible, or not found) at the bottom of the Twixtor tab.
- Hover tooltips (`title`) and `aria-label` attributes across all interactive elements in every tab, header, and modal for improved accessibility.
- `aria-label` support in the reusable Dropdown component.
- Home dashboard with stack navigation replacing the traditional tab bar for improved discoverability.
- Batch Twixtor mode to apply the effect to all selected layers simultaneously via a checkbox toggle.
- Confirmation dialog when saving a preset with an existing name to prevent accidental overwrites.
- Interactive folder add/remove list in Custom Setup replacing the plain textarea input.
- Error Boundary component that catches React crashes and displays a fallback with Reload/Dismiss options.
- Global React Context (`AppProvider` + `useApp()` hook) for centralized extension state management.
- Dynamic version display sourced from `package.json` via Vite build-time injection.

### Changed

- Complete UI redesign with monochrome "Darkroom" aesthetic: #0c0c0c backgrounds, muted text, subtle borders, Google Sans typography.
- Flat, borderless section layouts with divider-based visual separation replacing card-style panels.
- Tab bar replaced with Home dashboard + stack navigation pattern (Home → Feature → Back button).
- Responsive panel-first layout system using flex/container queries instead of `@media` breakpoints.
- CustomSetupModal fully redesigned with improved layout, preset management, and comp name customization.
- Dropdown component upgraded with search functionality, popover positioning, and keyboard navigation.
- All components restructured into modular folder architecture (`components/tabs/`, `components/ui/`, `components/modals/`).
- Build target set to Chrome 57 for CEP 8 / After Effects CC 2018+ compatibility.
- All PNG icons replaced with Google Material Symbols Outlined (weight 200, FILL 0) for a unified icon system.
- Anchor Point tab icons changed from static PNG images to Material Symbols directional arrows.
- Increased border-radius design tokens for a softer, more modern look (`--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`).
- Refined button and control sizing in Custom Setup modal for consistent visual alignment.

### Fixed

- Fixed `__detect__` solid orphan left in After Effects project after Twixtor plugin detection (added cleanup in `finally` block).
- Fixed misaligned button sizing in Custom Setup modal for composition and folder row controls.

## [2.0.1] - 2025-04-09

### Added

- JSON polyfill for improved stability and compatibility with different AE environments.
- Refresh button in the Custom Setup modal's "Load Preset" section to manually reload presets from the JSON file.
- Panel Flyout Menu with options to refresh the extension window and open the documentation website.
- Visual feedback (check icon and "Loaded" text) to the "Load Preset" button for 2 seconds upon successful loading.

## [2.0.0] - 2025-03-20

### Added

- Modern responsive interface with dark theme and custom tooltips.
- Tabbed interface for better organization of tools.
- Improved dropdown menus with search functionality for presets, resolutions, FPS values, and output modules.
- Custom project setup with ability to name compositions and assign to folders.
- Responsive design for various panel sizes.

### Changed

- Complete migration from JSX script to a full-featured CEP extension.
- Enhanced user experience with intuitive controls.
- Maintained all functionality from previous versions with significant UI improvements.

## [1.2.0] - 2025-02-20

### Added

- Render Settings Tab: Button to easily access output modules settings location.
- Setup Tab: Button to access project presets location.

### Changed

- All Tabs: Improved responsive design for better window resizing.
- Anchor Point Tab: Reorganized controls into a vertical layout with titled sections.
- About Tab: Enhanced information panel organization.

## [1.1.0] - 2025-01-31

### Changed

- Setup Tab: Replaced text buttons with icon buttons for 16:9, 1:1, and 4:3 preset setups.
- Setup Tab: Adjusted button sizes for better visual consistency.
- About Tab: Improved UI for better readability and user experience.
- Twixtor Pro Tab: Improved the efficiency of keyframe placement for the "Speed %" property.

## [1.0.1] - 2025-01-08

### Fixed

- Issue where output modules wouldn't load correctly after restarting After Effects.

### Changed

- Improved JSON formatting for better reliability.

### Removed

- Unnecessary JSON sanitization.

## [1.0.0]

### Added

- Initial release with a full suite of tools.
- Twixtor Pro automation for speed adjustments.
- Anchor point management with quick positioning and offset controls.
- Render queue optimization with output module selection and auto render.
- Project setup utilities with preset and custom configurations.

[Unreleased]: https://github.com/dony-aep/dony-tools-extension/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/dony-aep/dony-tools-extension/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/dony-aep/dony-tools-extension/compare/v2.0.1...v3.0.0
[2.0.1]: https://github.com/dony-aep/dony-tools-extension/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/dony-aep/dony-tools-extension/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/dony-aep/dony-tools-extension/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/dony-aep/dony-tools-extension/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/dony-aep/dony-tools-extension/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/dony-aep/dony-tools-extension/releases/tag/v1.0.0
