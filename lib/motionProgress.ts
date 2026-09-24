import gsap from "gsap";
import { PHASES } from "./cameraKeyframes";
import { HERO_POSE, SCENE1_POSE, liveHeroPose, heroPoseActive } from "./scenePoses";
import { sceneProgress } from "./scrollProgress";

/**
 * The value every non-hero visual consumer (spine explode, implant, legacy
 * camera keyframe path, annotations) reads from. Kept as a plain mutable ref
 * (not React state) since this updates every animation frame and must never
 * trigger a re-render.
 *
 * This is no longer driven by raw scroll at all. Scene navigation is fully
 * explicit (see goToScene below) — this value just gets tweened to each
 * scene's fixed target as a side effect of that navigation, on a real GSAP
 * timeline, never by reading ScrollTrigger progress. For the Hero <-> Scene 1
 * composition specifically, camera/root motion is driven directly through
 * lib/scenePoses.ts's `liveHeroPose`; this value keeps moving in lockstep
 * (same timeline, same curve) purely so annotations and the scene-1-onward
 * legacy keyframe path stay synced.
 */
export const renderedProgress = { value: 0 };

// Discrete scene rest-states, expressed on the same 0..1 timeline the camera
// keyframes / explode / implant phases already use — SCENE_TARGETS[i] is the
// progress value where composition i is fully settled. There are exactly as
// many scenes as entries here; scroll/wheel input no longer scrubs the space
// between them, it only ever asks for the next or previous index. Implant
// reveal/insertion and hardware assembly are each a single scene (their own
// internal staggering happens inside one transition, not across several).
export const SCENE_TARGETS = [
  0, // scene 0 — hero / full spine
  PHASES.hero[1], // scene 1 — "İnsan anatomisi. Hassas mühendislik."
  PHASES.lumbarFocus[1], // scene 2 — lumbar focus, L3/L4/L5
  PHASES.narrativeBeat[1], // scene 3 — "Cerrahi çözüm anatomiyi anlamakla başlar."
  PHASES.explode[1], // scene 4 — exploded anatomy
  PHASES.implant[1], // scene 5 — implant revealed, oriented, inserted, seated
  PHASES.hardware[1], // scene 6 — hardware / stabilization assembled
  PHASES.exit[1], // scene 7 — final state, "Hassasiyet. Stabilite. Teknoloji."
];

export const LAST_SCENE = SCENE_TARGETS.length - 1;

// Time (seconds) for each scene-to-scene transition, indexed by the lower
// scene of the pair (i -> i+1). Pure TIME durations — nothing here is a
// function of scroll distance/speed. Implant and hardware are the two
// longest and slowest on purpose: the user needs to actually see what is
// being placed and where it's going, not watch a quick motion-graphic blur
// past. These stay cinematic; see INPUT_COOLDOWN_MS below for the separate,
// much shorter guard against wheel inertia queueing a second gesture.
const TRANSITION_DURATIONS = [1.7, 1.45, 1.15, 1.45, 2.4, 2.6, 1.8];
const TRANSITION_EASE = "power3.inOut";

// After a transition finishes, further navigation is blocked for this long —
// just enough to absorb trailing wheel-inertia events from the same
// physical gesture so they can't queue a second scene change. This is a
// short input cooldown, NOT a reading-time hold: once it elapses the scene
// stays on screen indefinitely until the user makes a fresh gesture, and
// crucially it only ever runs AFTER a transition completes — never before
// one starts.
const INPUT_COOLDOWN_MS = 300;

function setVec3(target: { x: number; y: number; z: number }, v: [number, number, number]) {
  target.x = v[0];
  target.y = v[1];
  target.z = v[2];
}

function vec3Props(v: [number, number, number]) {
  return { x: v[0], y: v[1], z: v[2] };
}

let currentSceneIndex = 0;
let activeTimeline: gsap.core.Timeline | null = null;
let cooldownTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Live navigation state. `isAnimating` is true for the exact duration of a
 * scene transition; `canNavigate` additionally covers the short post-
 * transition input cooldown. Callers (SpineExperience's Observer handlers)
 * check both before calling goToScene — this is what makes wheel inertia
 * unable to queue multiple scene changes from a single physical gesture.
 */
export const navState = { isAnimating: false, canNavigate: true };

export function getCurrentScene() {
  return currentSceneIndex;
}

/**
 * Explicit scene navigation — the ONLY way the story advances now. No raw
 * scroll progress, no threshold math, no distance accumulation involved.
 * Ignored outright while a transition is playing or the input cooldown
 * hasn't elapsed, so a caller can call this freely from a wheel handler
 * without its own guard duplicating this logic. Everything from this call to
 * the GSAP timeline actually starting animating is synchronous — there is no
 * setTimeout, debounce, or queued delay anywhere in this path.
 */
export function goToScene(index: number) {
  const target = Math.max(0, Math.min(LAST_SCENE, index));
  if (target === currentSceneIndex) return;
  if (navState.isAnimating || !navState.canNavigate) return;

  const from = currentSceneIndex;
  currentSceneIndex = target;

  const isHeroHop = (from === 0 && target === 1) || (from === 1 && target === 0);
  heroPoseActive.value = isHeroHop;

  const duration = TRANSITION_DURATIONS[Math.min(from, target)];

  navState.isAnimating = true;
  navState.canNavigate = false;
  if (cooldownTimer) clearTimeout(cooldownTimer);

  activeTimeline?.kill();
  const tl = gsap.timeline({
    defaults: { duration, ease: TRANSITION_EASE },
    onComplete: () => {
      activeTimeline = null;
      navState.isAnimating = false;
      cooldownTimer = setTimeout(() => {
        navState.canNavigate = true;
      }, INPUT_COOLDOWN_MS);
    },
  });

  tl.to(renderedProgress, { value: SCENE_TARGETS[target] }, 0);
  tl.to(sceneProgress, { value: SCENE_TARGETS[target] }, 0);
  // Root recenter always rides along, even for scenes beyond the dedicated
  // hero hop — it has no legacy fallback, so it must never stay stale.
  tl.to(liveHeroPose, { rootT: target === 0 ? 0 : 1 }, 0);

  if (isHeroHop) {
    const pose = target === 1 ? SCENE1_POSE : HERO_POSE;
    tl.to(liveHeroPose.cameraPosition, vec3Props(pose.cameraPosition), 0);
    tl.to(liveHeroPose.cameraLookAt, vec3Props(pose.cameraLookAt), 0);
  }

  activeTimeline = tl;
}

/** For reduced-motion / non-scrolling fallbacks: jump straight to a scene with no tween. */
export function setSceneImmediate(index: number) {
  const clampedIndex = Math.max(0, Math.min(LAST_SCENE, index));
  if (cooldownTimer) clearTimeout(cooldownTimer);
  activeTimeline?.kill();
  activeTimeline = null;
  navState.isAnimating = false;
  navState.canNavigate = true;

  currentSceneIndex = clampedIndex;
  renderedProgress.value = SCENE_TARGETS[clampedIndex];
  sceneProgress.value = SCENE_TARGETS[clampedIndex];

  heroPoseActive.value = clampedIndex <= 1;
  liveHeroPose.rootT = clampedIndex === 0 ? 0 : 1;
  const pose = clampedIndex === 0 ? HERO_POSE : SCENE1_POSE;
  setVec3(liveHeroPose.cameraPosition, pose.cameraPosition);
  setVec3(liveHeroPose.cameraLookAt, pose.cameraLookAt);
}
