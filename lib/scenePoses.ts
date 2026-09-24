import { CAMERA_KEYFRAMES } from "./cameraKeyframes";

/** Calibration aspect for the hero's world-space X offset — see SceneRoot. */
export const REFERENCE_ASPECT = 16 / 9;

export interface ScenePose {
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  /** Spine root world-space X offset, expressed at REFERENCE_ASPECT. */
  rootOffsetXAtReferenceAspect: number;
  rootYaw: number;
}

// Mirrors CAMERA_KEYFRAMES[0]/[1] exactly (not duplicated literals) so the
// handoff to the legacy keyframe path at Scene 1 is numerically seamless.
export const HERO_POSE: ScenePose = {
  cameraPosition: CAMERA_KEYFRAMES[0].position,
  cameraLookAt: CAMERA_KEYFRAMES[0].lookAt,
  rootOffsetXAtReferenceAspect: 2.6,
  rootYaw: 0.38,
};

export const SCENE1_POSE: ScenePose = {
  cameraPosition: CAMERA_KEYFRAMES[1].position,
  cameraLookAt: CAMERA_KEYFRAMES[1].lookAt,
  rootOffsetXAtReferenceAspect: 0,
  rootYaw: 0,
};

/**
 * Live Hero <-> Scene 1 camera state. A single GSAP tween (motionProgress.ts's
 * goToScene) animates cameraPosition/cameraLookAt directly to HERO_POSE
 * or SCENE1_POSE's numbers — CameraRig just assigns these to the camera
 * every frame while `heroPoseActive` is true. No lerp/smoothstep/keyframe-
 * ease of its own: one GSAP ease curve drives the whole shot.
 *
 * `rootT` (0 = hero offset, 1 = centered) is always kept in sync with the
 * active scene by goToScene, tweened smoothly regardless of whether the
 * current transition is the dedicated hero hop — SceneRoot reads it
 * unconditionally, since spine-root recentering has no legacy fallback path.
 */
export const liveHeroPose = {
  cameraPosition: { x: HERO_POSE.cameraPosition[0], y: HERO_POSE.cameraPosition[1], z: HERO_POSE.cameraPosition[2] },
  cameraLookAt: { x: HERO_POSE.cameraLookAt[0], y: HERO_POSE.cameraLookAt[1], z: HERO_POSE.cameraLookAt[2] },
  rootT: 0,
};

/**
 * True only while the active transition is specifically the Hero<->Scene1
 * hop — CameraRig reads `liveHeroPose`'s camera fields exactly then and
 * defers to the legacy keyframe path otherwise (including for a fast scroll
 * that skips past Scene 1 entirely), so those fields are never read in a
 * state that doesn't correspond to a real, currently-driving tween.
 */
export const heroPoseActive = { value: true };
