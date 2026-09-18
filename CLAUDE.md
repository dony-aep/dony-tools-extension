# CLAUDE.md

dony Tools is a CEP panel for After Effects: Twixtor Pro automation, anchor point placement,
render queue and project setup. Floor: CEP 11 / AE 2022 / Chromium 88. Shipped only through
GitHub Releases.

Workspace-wide rules (bridge, build target, UI stack, offline assets) live in
`../../CLAUDE.md`. Path-scoped rules in `.claude/rules/` load when you open the files they
cover: `host-jsx.md` (public/jsx), `styling.md` (CSS and the palette), `icons.md`.

## Commands

Beyond the shared `dev`, `test`, `build`, `deploy`, `package`:

```bash
npm run package -- --with-debug   # diagnostic zip that keeps .debug
npm run sign                      # build + signed .zxp in releases/ (needs tools/ and DT_CERT_PASSWORD_FILE)
```

- After `npm run deploy`, reload with **Refresh dony Tools** in the panel flyout. Restart AE
  only when the manifest or the bundle id changed.
- Remote debugger on port 8089 (`public/.debug`). 8088 belongs to Layers Pane Plus.

## Bridge

- The host hangs off `$.global.com_dony_tools`. No loose globals.
- Every user value interpolated into ExtendScript goes through `escapeForEval()` or
  `toEvalLiteral()` (`src/hooks/useCSInterface.ts`). An unescaped quote produces a malformed
  script, and AE answers with a modal dialog that blocks its scripting engine until someone
  closes it.
- One host call per action. `evalHostScript` wraps it with `wrapHostCall`
  (`src/lib/hostEnvelope.ts`) and the host returns result and messages together from
  `envelope()`. Each `evalScript` freezes AE while it runs, so never split an action into two
  calls. Per-function counters are in `window.__dtHostStats`, readable with
  `shared/diagnostics/cdp-eval.mjs` on port 8089.
- `public/` is copied to `dist/` untouched. The version lives only in `package.json`: Vite
  injects it as `__APP_VERSION__` and writes it into the manifest at build time.

## Gotchas

- Detect CEP with `'__adobe_cep__' in window`, never `typeof CSInterface`. `index.html` loads
  `lib/CSInterface.js` as a plain script, so the class also exists in the Vite preview, and
  calling `addEventListener` there takes the whole panel down through the ErrorBoundary.
- `useCSInterface` degrades to no-ops outside CEP, which is what lets the tests run. Keep pure
  logic in `src/lib/` and CEP side effects in hooks and components.
- Presets live in a file on the host, not in `localStorage`. In the browser preview the list is
  always empty, so saving and deleting presets can only be tested inside AE.
- `src/styles/tokens.css` is only the browser-preview fallback. Inside AE, `deriveTheme()`
  (`src/lib/theme.ts`) overwrites every color from the host skin. Real color changes go in
  `theme.ts`.

## Changes and commits

- Every user-visible change goes into `CHANGELOG.md` and `CHANGELOG_es.md` (Keep a Changelog,
  SemVer), both in the same commit as the change.
- If features, compatibility or installation change, update `README.md` and `README_es.md`
  too, including the "Current Version" block.
- Commit messages and code comments are in English.

## Releases

The update checker (`src/hooks/useUpdateChecker.ts`) reads `releases/latest` of
`dony-aep/dony-tools-extension` without authentication and compares tags. So:

- The tag must be `vX.Y.Z`. A malformed tag breaks update detection for every installed copy.
- The repo must stay public.
- Steps: bump `version` in `package.json`, add `## [X.Y.Z] - YYYY-MM-DD` to both changelogs,
  `npm test` and `npm run build`, commit and tag, `npm run package` and `npm run sign`, then
  `gh release create vX.Y.Z releases/dony-tools-vX.Y.Z.zip releases/dony-tools-vX.Y.Z.zxp
  --title "dony Tools vX.Y.Z"` with the English changelog section as notes.
- Signing details: `extensions/ZXP_DISTRIBUTION.md`. Secret locations:
  `extensions/CREDENTIALS.md`.
