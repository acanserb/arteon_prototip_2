export function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Remaps progress into a local 0..1 range for a given phase window. */
export function phaseT(progress: number, start: number, end: number) {
  return smoothstep(start, end, progress);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpVec3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** Rotates a local (x,y) offset around Z by angleRad, leaving z untouched. */
export function rotateOffsetZ(
  offset: [number, number, number],
  angleRad: number
): [number, number, number] {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return [offset[0] * cos - offset[1] * sin, offset[0] * sin + offset[1] * cos, offset[2]];
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeInOutQuint(x: number) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

export const EASE = { easeInOutCubic, easeInOutQuint, easeOutCubic };
