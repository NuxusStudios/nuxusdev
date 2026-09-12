/**
 * sRGB ↔ OKLCH, and WCAG contrast.
 *
 * Themes are authored as hex because that is what a designer hands over, and
 * shipped as oklch because that is what the stylesheet uses. Converting here
 * rather than by eye means the swatch on the card and the token in the CSS
 * cannot drift apart.
 */

export function hexToRgb(hex) {
  const clean = hex.replace("#", "").trim()
  const full =
    clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ]
}

/** sRGB transfer function, undone. */
function linear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function hexToOklch(hex) {
  const [r8, g8, b8] = hexToRgb(hex)
  const r = linear(r8)
  const g = linear(g8)
  const b = linear(b8)

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  const C = Math.sqrt(A * A + B * B)
  let H = (Math.atan2(B, A) * 180) / Math.PI
  if (H < 0) H += 360

  const round = (n, p) => Number(n.toFixed(p))
  // hue is meaningless once chroma is this low, and printing it invites
  // someone to "fix" a number that does nothing
  return C < 0.0005
    ? `oklch(${round(L, 3)} 0 0)`
    : `oklch(${round(L, 3)} ${round(C, 3)} ${round(H, 1)})`
}

/** WCAG relative luminance. */
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** WCAG contrast ratio, 1–21. */
export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Blends two hex colours in linear light. t=0 is a, t=1 is b. */
export function mix(a, b, t) {
  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)
  const A = hexToRgb(a).map(toLinear)
  const B = hexToRgb(b).map(toLinear)
  const out = A.map((v, i) => toSrgb(v + (B[i] - v) * t))
  return (
    "#" +
    out
      .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0"))
      .join("")
  )
}

/**
 * The lightest blend of `from` toward `to` that still clears `target`
 * contrast against `against`. Used to place muted text as close to the
 * background as it can sit while staying readable.
 */
export function blendUntilReadable(from, to, against, target = 4.5) {
  let best = from
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const candidate = mix(from, to, t)
    if (contrast(candidate, against) >= target) best = candidate
    else break
  }
  return best
}
