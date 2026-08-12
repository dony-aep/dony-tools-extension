# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Qué es este proyecto

**dony Tools** — extensión CEP para Adobe After Effects: automatiza Twixtor Pro, coloca anchor points, gestiona la cola de render y monta la estructura de un proyecto. Panel React 19 + TypeScript 5.9 + Vite 7. Piso: **CEP 11 / AE 2022 (22.0)+ / Chromium 88**. Se distribuye por GitHub Releases y Gumroad.

## Comandos

Requiere Node 20.19+ o 22.12+.

```bash
npm run dev        # dev server de Vite (preview en navegador, sin AE)
npm test           # vitest — 84 tests sobre src/lib/ y hooks puros
npm run build      # tsc -b + build de producción a dist/
npm run deploy     # build + copia a %APPDATA%\Adobe\CEP\extensions\com.donyaep.DonyTools
npm run package    # build + zip a releases/dony-tools-v{version}.zip
```

- Verificación estándar antes de commitear: `npm test` + `npm run build` (no hay linter). La UI se prueba a mano en AE: `npm run deploy` y luego **"Refresh dony Tools"** desde el flyout del panel. Solo hace falta reiniciar AE si cambió el bundle id.
- Builds sin firmar requieren PlayerDebugMode: `reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f`. Depurador remoto en el **puerto 8089** (`public/.debug`); 8088 es de Layers Pane Plus.

## Arquitectura

Dos mitades comunicadas por un puente:

1. **Panel (Chromium)**: SPA React en `src/` — se bundlea con Vite a `dist/`.
2. **Host (ExtendScript)**: `public/jsx/hostscript.jsx` corre dentro del motor de scripting de AE. El panel lo invoca vía `evalHostScript()` (`src/hooks/useCSInterface.ts`), que resuelve contra el namespace del host.

`public/` se copia tal cual a `dist/` (manifest CSXS, `.debug`, `lib/CSInterface.js`, el JSX): **nada de eso pasa por el bundler**. La versión vive solo en `package.json`: Vite la inyecta como `__APP_VERSION__` y la sincroniza al manifest en build (`vite.config.ts`).

Navegación: **rail** de herramientas en el borde izquierdo (`App.tsx` + `App.module.css`), sin pantalla de inicio. A partir de 480px el rail se abre y muestra los nombres.

## La paleta se calcula en runtime — leer antes de tocar colores

`src/styles/tokens.css` **no manda dentro de After Effects**. `deriveTheme()` (`src/lib/theme.ts`) lee el gris que reporta el host (`appSkinInfo`), resuelve toda la rampa y sobrescribe las custom properties vía `useHostTheme`. Los valores de `tokens.css` son solo el fallback del preview en navegador.

Consecuencia práctica: **editar `tokens.css` cambia la preview y nada más**. Cualquier ajuste real de color va en `theme.ts`, y `tokens.css` se actualiza después para que ambos cuadren.

Cada nivel se resuelve para un **ratio de contraste** contra la superficie sobre la que se apoya, no se elige a ojo:

- Superficies contra `--ground`: `--raised` 1.05, `--plate` 1.14, `--control` 1.35.
- **1.35 en `--control` es un techo, no un gusto**: la tinta se resuelve contra `control`, y un relleno más claro no deja hueco para cuatro niveles de tinta distintos manteniendo `--ink-lo` en 4.5:1.
- La tinta se resuelve contra `ground` **y** `control` a la vez, nunca usando uno como proxy del otro.

## Reglas duras (no inferibles del código)

- **`public/jsx/` es ExtendScript (≈ES3)**: nada de `let`/`const`, arrow functions, template literals ni métodos ES5+ (`map`, `forEach`, `JSON` nativo…). TypeScript NO cubre estos archivos.
- **Puente por namespace IIFE**: todo el host cuelga de `$.global.com_dony_tools`. No añadir globales sueltas. El namespace se reconstruye en cada carga para que las funciones eliminadas dejen de ser invocables sin reiniciar AE.
- **Todo valor de usuario que se interpole en ExtendScript pasa por `escapeForEval()` o `toEvalLiteral()`** (`src/hooks/useCSInterface.ts`). Una comilla sin escapar produce un script malformado, y AE responde a eso con un **diálogo modal que bloquea su motor de scripting** hasta que alguien lo cierre.
- **El host no puede llamar a `alert()` ni `confirm()`**, por lo mismo. Encola mensajes con `report()` y `AppContext` los drena a toasts tras cada llamada. Las confirmaciones usan `useConfirm`.
- **Los grupos de deshacer se cierran en `finally`**, exactamente una vez, incluso si algo por encima lanza.
- **`build.target: 'chrome88'` en `vite.config.ts` está fijado a mano** al Chromium de CEP 11. No subirlo ni dejar que Vite use su default.
- **Extension ID `com.donyaep.DonyTools`** debe coincidir en `public/CSXS/manifest.xml`, `public/.debug`, `scripts/deploy.mjs` y `vite.config.ts`. El id anterior `com.dony.tools` (≤3.x) queda obsoleto y `deploy.mjs` lo limpia vía `LEGACY_EXTENSION_IDS`.
- **UI**: `react-aria-components` + CSS Modules + tokens. **Tailwind está prohibido** (requiere Chromium más nuevo que cualquier runtime CEP). Monocromo estricto: el estado se lee por icono, peso y luminancia, **nunca por tinte**. La excepción es la selección, que adopta el highlight del host.
- **Todo offline**: fuentes e iconos empaquetados; ninguna petición a CDN. La única llamada de red es el update checker, y debe fallar en silencio.
- En el host, preferir la API de scripting nativa sobre `app.executeCommand(id)`; nunca `app.findMenuCommandId()` (frágil en AE localizado).

## Dos interruptores con números que hay que mantener en sync

**Controles planos.** `--control-edge` y `--control-edge-hover` (en `tokens.css`) gobiernan el borde de *todo* lo que el usuario opera: botones, campos, dropdowns, checkbox, presets y el teclado del anchor. Ahora mismo están en `transparent`: el relleno es lo único que identifica un control. Es una **desviación deliberada de la WCAG 1.4.11** (pide 3:1 al contorno), inalcanzable para un control relleno sobre un panel casi negro sin volver gris medio toda la UI. Se revierte apuntándolos a `var(--edge)` / `var(--edge-hover)`. Lo que sigue con borde son las superficies que *no* se operan: popover, diálogo de confirmación, toasts y la caja de estado.

**Escalones de ancho del panel: 300 / 380 / 480.** Están repartidos en tres archivos y hay que tocarlos juntos:

| Escalón | Dónde | Qué hace |
|---|---|---|
| 300 / 380 | `tokens.css` | `--gutter` 12px / 16px |
| 380 | `Dropdown.module.css` | etiqueta al lado del control en vez de encima |
| 480 | `App.module.css` | el rail se abre y muestra nombres |

El número que importa al calcularlos no es el ancho del panel sino **`panel − 44 (rail) − 2 × gutter`**, que es lo que recibe un control.

## Iconos

La fuente es un subset estático de Material Symbols con **27 glifos** (`src/styles/fonts/material-symbols-outlined.woff2`, ~3.5 KB, se inlinea en el CSS por estar bajo el límite de Vite). Al añadir o quitar un `<Icon name="…">`:

1. Actualizar `ICONS` en `scripts/subset-icons.py` **y** el comentario de `src/styles/fonts.css` (llevan la misma lista).
2. `python scripts/subset-icons.py` (necesita `pip install fonttools brotli`).
3. **Verificar en pantalla que los iconos siguen dibujándose.** Un subset mal hecho no da error: elimina los glifos en silencio y cada icono se renderiza como el nombre literal de su ligadura.

## Workflow de cambios

- **Todo cambio visible para el usuario se registra en `CHANGELOG.md` y `CHANGELOG_es.md`** (Keep a Changelog, SemVer). Ambos idiomas siempre en sync, en el mismo commit que el cambio.
- Si cambian features, compatibilidad o instalación, actualizar también `README.md` y `README_es.md` (par bilingüe), incluido el bloque "Current Version / Versión Actual".
- Mensajes de commit en inglés, imperativos. Los comentarios de código de este repo están **en inglés**: no traducirlos.
- No commitear `dist/`, `releases/` ni `node_modules/` (ya ignorados).

## Releases

El update checker (`src/hooks/useUpdateChecker.ts`) consulta `releases/latest` de `dony-aep/dony-tools-extension` y compara el tag — por eso las convenciones de release son contrato:

1. Subir `version` en `package.json` (única fuente de verdad).
2. Añadir la sección `## [X.Y.Z] - AAAA-MM-DD` a ambos CHANGELOGs.
3. `npm test` y `npm run build` en verde; commit + tag `vX.Y.Z`.
4. `npm run package` → `releases/dony-tools-vX.Y.Z.zip`.
5. `gh release create vX.Y.Z releases/dony-tools-vX.Y.Z.zip --title "dony Tools vX.Y.Z" --notes-file <notas>`.

- **El tag DEBE ser `vX.Y.Z`.** Un tag mal formado rompe la detección de updates de todos los usuarios instalados.
- El repo debe seguir **público**: el checker usa la API sin autenticación.
- Para venta (Gumroad) el `.zxp` se firma con `ZXPSignCMD`; `npm run package` produce un zip **sin firmar** y `npm run deploy` es solo instalación local.

## Gotchas

- **`typeof CSInterface === 'undefined'` no sirve para detectar CEP.** `index.html` carga `lib/CSInterface.js` como script suelto, así que la clase también existe en el preview de Vite. Hay que comprobar `'__adobe_cep__' in window` (lo hace `useHostTheme`); sin eso, `addEventListener` revienta y el ErrorBoundary se come el panel entero en navegador.
- `theme.test.ts` barre **los 256 grises posibles** del host, no solo los cuatro del slider de AE. Existe porque una versión del solver devolvía inks desordenados en grises medios —`--ink-lo` más claro que `--ink-hi`— y muestrear solo los cuatro valores reales no lo detectaba. No reducir ese barrido.
- Entre host 103 y 137 ninguna tinta alcanza 4.5:1 contra ambas superficies a la vez (el máximo real es ~4.1:1). Es un límite matemático, no un bug: ahí la rampa se comprime en bloque para seguir ordenada. AE nunca reporta esos grises.
- El flyout menu de CEP se define como XML string en `App.tsx`; sus clicks llegan por el evento `com.adobe.csxs.events.flyoutMenuClicked`.
- Los tests corren fuera de CEP: `useCSInterface` degrada a no-ops off-host. Mantener la separación — lógica pura en `src/lib/`, efectos CEP en hooks y componentes.
- Los presets viven en un archivo del host, no en `localStorage`: fuera de AE la lista siempre sale vacía y no se puede probar guardar ni borrar desde el navegador.
