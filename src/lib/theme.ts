/**
 * Derives the panel's colour ramp from After Effects' own UI theme.
 *
 * A CEP panel can read the host's skin (`appSkinInfo`), so instead of painting
 * a fixed black the panel adopts the grey After Effects is currently using and
 * follows the four steps of its brightness slider. Ink levels are not picked by
 * eye: each one is solved for a target WCAG contrast ratio against the surface
 * it sits on, so the ramp stays legible at every step.
 */

export interface HostSkin {
  /** Panel background reported by After Effects, 0–255 per channel. */
  red: number
  green: number
  blue: number
}

export interface Theme {
  ground: string
  plate: string
  raised: string
  control: string
  controlHover: string
  controlPress: string
  rule: string
  edge: string
  edgeHover: string
  inkHi: string
  ink: string
  inkLo: string
  inkDim: string
  key: string
  keyHover: string
  keyPress: string
  keyInk: string
  select: string
  selectInk: string
  veil: string
  veilStrong: string
}

const clamp = (v: number, lo = 0, hi = 255) => Math.min(hi, Math.max(lo, v))

const toLinear = (c: number) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance of an sRGB grey level (0–255). */
export function luminance(grey: number): number {
  return toLinear(grey)
}

/** WCAG contrast ratio between two grey levels (0–255). */
export function contrast(a: number, b: number): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Which extreme a value sitting on these backgrounds has to walk toward. */
function walksToWhite(bgs: number[]): boolean {
  const mean = bgs.reduce((sum, b) => sum + luminance(b), 0) / bgs.length
  return mean < 0.18
}

/**
 * The *quietest* level that still reaches `ratio` against every background in
 * `bgs`.
 *
 * The search walks outward from the backgrounds, not inward from the extreme:
 * starting at white would return white for every ratio and collapse the whole
 * ramp to one value. Stepping away instead yields a real hierarchy — each
 * level is only as loud as its ratio demands.
 *
 * Takes a list because ink has to clear more than one surface: it sits on the
 * panel and inside fields alike. Solving it against `control` alone used to be
 * justified by "control is the lower-contrast of the two, so clearing it
 * clears the panel" — true while both surfaces sit on the same side of the
 * luminance midpoint, false on a mid-grey host, where `ground` can end up
 * *lighter* than `control` and the ink walks away from it while walking toward
 * the other.
 *
 * Used for surfaces as well: a control's fill is solved the same way its label
 * is, which is what keeps the ramp honest when the host moves.
 */
function lift(bg: number | number[], ratio: number): number {
  const bgs = Array.isArray(bg) ? bg : [bg]
  const toWhite = walksToWhite(bgs)
  const limit = toWhite ? 255 : 0
  const stepDir = toWhite ? 1 : -1

  let level = toWhite ? Math.min(...bgs) : Math.max(...bgs)
  for (; toWhite ? level <= 255 : level >= 0; level += stepDir) {
    if (bgs.every((b) => contrast(level, b) >= ratio)) return level
  }
  // Ratio unreachable from these backgrounds (host theme at an extreme).
  return limit
}

const grey = (level: number) => {
  const v = clamp(Math.round(level))
  const hex = (v < 16 ? '0' : '') + v.toString(16)
  return `#${hex}${hex}${hex}`
}

/** WCAG relative luminance of an arbitrary sRGB colour. */
function colorLuminance(c: HostSkin): number {
  return 0.2126 * toLinear(c.red) + 0.7152 * toLinear(c.green) + 0.0722 * toLinear(c.blue)
}

/** Perceived grey level of the host panel colour. */
function baseLevel(skin: HostSkin): number {
  // After Effects panels are neutral; average is enough and avoids a colour
  // cast if the host ever reports a slightly tinted grey.
  return clamp(Math.round((skin.red + skin.green + skin.blue) / 3))
}

/**
 * How far the panel's ground sits from the grey After Effects reports, in
 * 0–255 steps. Zero makes the panel indistinguishable from a native AE panel;
 * a negative value sinks it so dony Tools reads as its own surface while still
 * following the host's brightness slider.
 *
 * Slide this one number to retune the panel's identity — the whole ramp is
 * re-solved for contrast around it, so no other value needs touching.
 */
const IDENTITY_OFFSET = -10

export function deriveTheme(skin: HostSkin, highlight?: HostSkin): Theme {
  const hostLevel = baseLevel(skin)
  const hostIsDark = luminance(hostLevel) < 0.18
  // Sink on dark host themes, lift on light ones: the panel should read as a
  // deliberate surface in both directions, never as a hole punched in the UI.
  const base = clamp(hostLevel + (hostIsDark ? IDENTITY_OFFSET : -IDENTITY_OFFSET))
  const isDark = luminance(base) < 0.18
  // Surfaces step away from the host grey; on a dark theme they climb, on a
  // light one they sink, so a raised surface always reads as raised.
  const step = (n: number) => clamp(base + (isDark ? n : -n))

  const ground = step(-4)

  /* ── Surfaces, solved rather than stepped ──
     These used to be fixed offsets (+4, +6, +8), which packed plate, raised
     and control into four levels out of 255 — near-invisible on any host, and
     fatal once controls went borderless and the fill became the only thing
     marking them. Each surface now targets a contrast ratio against the
     ground, so the spacing survives the host's brightness slider instead of
     collapsing at one end of it.

     1.35 on `control` is not a taste call, it is the ceiling: the ink ramp is
     solved against `control`, and a lighter fill leaves too little headroom
     above it to fit four distinct ink levels while `--ink-lo` still clears
     4.5:1. Past that the top of the ramp collapses into flat white. */
  const control = lift(ground, 1.35)

  /* The modal sheet sits close to the ground on purpose. Anything brighter
     eats the contrast its own controls need — that is exactly what made the
     Custom setup modal unreadable — and the scrim plus the shadow already do
     the work of lifting it off the panel. */
  const raised = lift(ground, 1.05)

  /* Surfaces that have to hold their own against the panel behind them:
     popovers, toasts, the rail, the update notice. */
  const plate = lift(ground, 1.14)

  /* Ink lands on the panel and inside fields alike, so it is solved against
     both surfaces at once — never one as a proxy for the other, see lift(). */
  const inkOn = [ground, control]

  /* The targets are capped by the headroom those surfaces have. Contrast
     tops out at whatever the extreme lift() walks toward gives, and on After
     Effects' brightest theme that is barely 7:1 — asking for 12:1 and 7:1
     there returns the same clamped white twice and collapses the top of the
     ramp into one level.

     The ceiling is measured toward the extreme lift() actually walks to, and
     against whichever surface runs out of room first. Reading the direction
     off the theme's own `isDark` was wrong: lift decides per background, so on
     a mid-grey host it capped the ramp against the opposite endpoint and
     produced inks that were not even in order. */
  const inkExtreme = walksToWhite(inkOn) ? 255 : 0
  const ceiling = Math.min(...inkOn.map((b) => contrast(inkExtreme, b)))

  /* Four strictly decreasing targets fitted under that ceiling.

     4.5:1 is the AA floor for the small text on --ink-lo, and it is held
     wherever the surfaces can carry it — every brightness step After Effects
     reports does. The loud levels compress first, because that costs
     hierarchy where lowering the floor would cost legibility.

     A host grey near the luminance midpoint cannot carry it at all: with both
     surfaces straddling that point the best any ink reaches on both at once
     is about 4.1:1. There the whole set scales down together rather than
     clamping onto one value, so the four levels stay distinct and ordered
     instead of collapsing into two. */
  // Ratio kept free above the floor so the two loud levels have somewhere to
  // go. Only ever binds in the degenerate band described above.
  const HEADROOM = 0.7

  const hiRatio = Math.min(12, ceiling)
  const loRatio = Math.min(4.5, ceiling - HEADROOM)
  const midRatio = Math.min(7, loRatio + (hiRatio - loRatio) * 0.55)
  const dimRatio = Math.min(3, loRatio * 0.7)

  const inkHi = lift(inkOn, hiRatio)
  const inkMid = lift(inkOn, midRatio)
  const inkLo = lift(inkOn, loRatio)
  const inkDim = lift(inkOn, dimRatio)

  // The boundary of an interactive control must reach 3:1 against the ground
  // (WCAG 1.4.11), which is why it is solved rather than picked. Only the
  // surfaces that still draw a border use it — see --control-edge in
  // tokens.css for the ones that went flat.
  const edge = lift(ground, 3)
  const edgeHover = lift(ground, 4.5)

  const keyInkLevel = isDark ? clamp(base - 20) : 255
  const highlightHex = highlight
    ? `rgb(${Math.round(highlight.red)}, ${Math.round(highlight.green)}, ${Math.round(highlight.blue)})`
    : grey(inkHi)

  // The tick sitting on the selection fill: black or white, whichever the
  // host's highlight colour can actually carry. After Effects' default blue
  // needs white, a light theme's highlight may need black.
  const selectInk = highlight
    ? (colorLuminance(highlight) > 0.35 ? '#000000' : '#ffffff')
    : grey(keyInkLevel)

  const inkHiRgb = `${inkHi}, ${inkHi}, ${inkHi}`

  return {
    ground: grey(ground),
    plate: grey(plate),
    raised: grey(raised),
    control: grey(control),
    controlHover: grey(lift(control, 1.18)),
    controlPress: grey(lift(control, 1.34)),
    rule: grey(lift(ground, 1.4)),
    edge: grey(edge),
    edgeHover: grey(edgeHover),
    inkHi: grey(inkHi),
    ink: grey(inkMid),
    inkLo: grey(inkLo),
    inkDim: grey(inkDim),
    key: grey(inkHi),
    keyHover: grey(clamp(inkHi + (isDark ? 18 : -18))),
    keyPress: grey(clamp(inkHi - (isDark ? 36 : -36))),
    keyInk: grey(keyInkLevel),
    select: highlightHex,
    selectInk,
    veil: `rgba(${inkHiRgb}, 0.06)`,
    veilStrong: `rgba(${inkHiRgb}, 0.12)`,
  }
}

/** Maps a derived theme onto the CSS custom properties defined in tokens.css. */
export const THEME_VARS: Record<keyof Theme, string> = {
  ground: '--ground',
  plate: '--plate',
  raised: '--raised',
  control: '--control',
  controlHover: '--control-hover',
  controlPress: '--control-press',
  rule: '--rule',
  edge: '--edge',
  edgeHover: '--edge-hover',
  inkHi: '--ink-hi',
  ink: '--ink',
  inkLo: '--ink-lo',
  inkDim: '--ink-dim',
  key: '--key',
  keyHover: '--key-hover',
  keyPress: '--key-press',
  keyInk: '--key-ink',
  select: '--select',
  selectInk: '--select-ink',
  veil: '--veil',
  veilStrong: '--veil-strong',
}
