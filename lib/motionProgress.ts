import gsap from "gsap";
import { PHASES } from "./cameraKeyframes";
import { clamp } from "./math";

/**
 * The damped, "chapter-aware" progress every visual consumer (camera, spine
 * explode, implant, hero-offset fade, annotations) reads from — as opposed
 * to lib/scrollProgress.ts's `sceneProgress`, which is the raw scrub value
 * ScrollTrigger writes every tick. Kept as a plain mutable ref (not React
 * state) for the same reason: this updates every animation frame and must
 * never trigger a re-render.
 *
 * Unlike before, this value is no longer a per-frame damped follower of raw
 * scroll — it's driven directly by GSAP tweens fired from discrete scene
 * transitions (see driveToScroll below). Every consumer still just reads
 * `renderedProgress.value` each frame, so none of them needed to change.
 */
export const renderedProgress = { value: 0 };

// Discrete scene rest-states, expressed on the same 0..1 timeline the camera
// keyframes / explode / implant phases already use — so SCENE_TARGETS[i] is
// exactly the progress value where composition i is fully settled. Scroll no
// longer scrubs the space *between* these values; it only decides which one
// is currently targeted.
export const SCENE_TARGETS = [
  0, // scene 0 — hero / full spine
  PHASES.full[1], // scene 1 — camera moves toward lumbar / centered composition
  PHASES.focus[1], // scene 2 — lumbar focus
  PHASES.explode[1], // scene 3 — exploded anatomy
  PHASES.implant[1], // scene 4 — implant reveal
  PHASES.hardware[1], // scene 5 — hardware / stabilization
  PHASES.exit[1], // scene 6 — final state
];

// Time (seconds) for a direct one-scene-step tween, indexed by the lower
// scene of the pair (i -> i+1). Tuned so the hero transition — the one
// explicitly called out as harsh — gets the longest, most deliberate move.
const TRANSITION_DURATIONS = [1.7, 1.4, 1.2, 1.15, 1.1, 1.5];
const TRANSITION_EASES = [
  "power4.inOut",
  "power3.inOut",
  "power3.inOut",
  "power3.inOut",
  "power3.inOut",
  "power3.inOut",
];

// How far past a boundary raw scroll has to move before we commit to
// stepping across it — prevents the scene index flickering back and forth
// when raw progress happens to sit right on a threshold.
const THRESHOLD_HYSTERESIS = 0.012;

function thresholdBetween(i: number) {
  return (SCENE_TARGETS[i] + SCENE_TARGETS[i + 1]) / 2;
}

function durationBetween(a: number, b: number) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  let total = 0;
  for (let k = lo; k < hi; k++) total += TRANSITION_DURATIONS[k];
  // Cap so a very fast multi-threshold scroll still resolves promptly
  // instead of dragging out a long queued animation.
  return Math.min(total, 2.4);
}

let currentSceneIndex = 0;
let activeTween: gsap.core.Tween | null = null;

/** Walks the scene index one threshold at a time toward wherever raw progress currently sits. */
function stepSceneIndex(raw: number, from: number): number {
  let idx = from;
  while (idx < SCENE_TARGETS.length - 1 && raw > thresholdBetween(idx) + THRESHOLD_HYSTERESIS) idx++;
  while (idx > 0 && raw < thresholdBetween(idx - 1) - THRESHOLD_HYSTERESIS) idx--;
  return idx;
}

/**
 * Call from the ScrollTrigger onUpdate with the raw 0..1 scrub progress.
 * Raw scroll only ever decides *which scene should be active* — crossing a
 * threshold commits to a new scene index and fires (or redirects) a single
 * time-based GSAP tween of renderedProgress toward that scene's rest state.
 * Scroll deltas that don't cross a threshold are ignored entirely: they
 * neither restart nor perturb an in-flight tween.
 */
export function driveToScroll(raw: number) {
  const clamped = clamp(raw, 0, 1);
  const targetIndex = stepSceneIndex(clamped, currentSceneIndex);
  if (targetIndex === currentSceneIndex) return;

  const from = currentSceneIndex;
  currentSceneIndex = targetIndex;

  activeTween?.kill();
  activeTween = gsap.to(renderedProgress, {
    value: SCENE_TARGETS[targetIndex],
    duration: durationBetween(from, targetIndex),
    ease: TRANSITION_EASES[Math.min(from, targetIndex)],
    overwrite: true,
    onComplete: () => {
      activeTween = null;
    },
  });
}

/** For reduced-motion / non-scrolling fallbacks: jump straight to a scene with no tween. */
export function setSceneImmediate(index: number) {
  const clampedIndex = Math.max(0, Math.min(SCENE_TARGETS.length - 1, index));
  activeTween?.kill();
  activeTween = null;
  currentSceneIndex = clampedIndex;
  renderedProgress.value = SCENE_TARGETS[clampedIndex];
}
