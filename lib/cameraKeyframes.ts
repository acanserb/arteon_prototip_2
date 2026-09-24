import { lumbarCenter, focusGapCenter } from "./spineData";
import { lerpVec3, EASE } from "./math";

export interface CameraKeyframe {
  t: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  /** Eases the transition arriving at this keyframe. */
  ease: (x: number) => number;
}

/**
 * Scene-to-scene progress spans. Each span is exactly one GSAP scene
 * transition (see lib/motionProgress.ts's SCENE_TARGETS / goToScene) — the
 * camera/model motion happens once, driven by an explicit goToScene() call
 * (never raw scroll progress), then progress sits frozen at the span's end
 * value until the next deliberate gesture.
 *
 * Implant reveal/orientation/insertion and hardware/screw/rod assembly are
 * each ONE combined scene-to-scene span (not several) — internal staggering
 * (screw 1, screw 2, rods…) happens inside that single span/timeline, not
 * across separate user gestures.
 */
export const PHASES = {
  hero: [0, 0.1] as [number, number], // scene 0 -> 1
  lumbarFocus: [0.1, 0.2] as [number, number], // scene 1 -> 2 (camera arrives at L3/L4/L5)
  narrativeBeat: [0.2, 0.3] as [number, number], // scene 2 -> 3 ("Cerrahi çözüm...")
  explode: [0.3, 0.42] as [number, number], // scene 3 -> 4
  implant: [0.42, 0.58] as [number, number], // scene 4 -> 5: reveal + orient + move + seat, ONE beat
  hardware: [0.58, 0.74] as [number, number], // scene 5 -> 6: screw/rod stagger, ONE beat
  reassemble: [0.76, 0.94] as [number, number], // within scene 6 -> 7 (vertebrae close back up)
  exit: [0.94, 1.0] as [number, number], // within scene 6 -> 7 (final camera settle)
};

export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // hero — a full-spine establishing shot: pulled back far enough that the
  // whole column (cervical through sacrum) reads as one continuous elegant
  // object, only lightly cropped top/bottom. Close-ups are for later phases.
  { t: 0, position: [0.15, 0.9, 10.5], lookAt: [0, 0.5, -0.1], ease: EASE.easeInOutCubic },
  // approach / centered — camera + root recenter (Hero <-> Scene 1 is
  // actually driven directly by lib/scenePoses.ts's liveHeroPose, not this
  // keyframe's own `ease`; kept here as the data source for that pose and
  // as the start of the legacy path below).
  { t: 0.1, position: [1.6, 0.3, 6.6], lookAt: [0, 0.4, 0], ease: EASE.easeInOutQuint },
  // lumbar focus — mid-distance framing where individual lumbar vertebrae
  // read clearly; rest point for the L3/L4/L5 label moment.
  { t: 0.2, position: [1.3, lumbarCenter[1] + 0.5, 4.2], lookAt: lumbarCenter, ease: EASE.easeInOutCubic },
  // narrative beat — tighter two-vertebra framing; anatomy has settled here
  // before "Cerrahi çözüm anatomiyi anlamakla başlar." appears.
  { t: 0.3, position: [1.3, focusGapCenter[1] + 0.2, 3.7], lookAt: focusGapCenter, ease: EASE.easeOutCubic },
  // exploded anatomy — controlled, deliberate
  { t: 0.42, position: [0.85, focusGapCenter[1] - 0.05, 3.2], lookAt: focusGapCenter, ease: EASE.easeInOutCubic },
  // intermediate-only waypoint (not a scene rest point) — the implant is
  // fully visible/presenting itself here, mid-way through the single
  // reveal -> insertion beat, giving that beat a gentle arc rather than a
  // straight cut from explode to seated.
  { t: 0.48, position: [0.72, focusGapCenter[1] - 0.05, 3.0], lookAt: focusGapCenter, ease: EASE.easeOutCubic },
  // implant seated — end of the combined reveal/orient/insert beat
  { t: 0.58, position: [0.55, focusGapCenter[1] - 0.05, 2.7], lookAt: focusGapCenter, ease: EASE.easeInOutQuint },
  // hardware assembled — end of the combined screw/rod stabilization beat
  { t: 0.74, position: [0.15, focusGapCenter[1], 3.3], lookAt: focusGapCenter, ease: EASE.easeInOutQuint },
  // pull-back arc — intermediate-only keyframe (not a scene rest point),
  // gives the final approach a calm cinematic arc rather than a straight cut
  { t: 0.88, position: [-1.6, lumbarCenter[1] + 1.2, 5.6], lookAt: lumbarCenter, ease: EASE.easeOutCubic },
  // final state — fully reassembled, stabilized spine, pulled back
  { t: 1.0, position: [-3.6, 0.2, 8.6], lookAt: [0, 0, 0], ease: EASE.easeOutCubic },
];

/**
 * Interpolates camera position/lookAt for scene 1 onward. Deliberately
 * LINEAR between keyframes (ignores each keyframe's own `ease` field) —
 * the driving `progress` value is already eased exactly once by the GSAP
 * scene-transition timeline in lib/motionProgress.ts (goToScene). Applying
 * a second per-keyframe ease on top of that already-eased input is what
 * previously made a transition's visible start (and the input response
 * that triggers it) feel delayed: the compounded slow-start of two nested
 * ease curves reads as "nothing happening yet" for a few hundred ms even
 * though the tween began immediately.
 */
export function getCameraFrame(progress: number): {
  position: [number, number, number];
  lookAt: [number, number, number];
} {
  const p = Math.min(1, Math.max(0, progress));

  let lower = CAMERA_KEYFRAMES[0];
  let upper = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];

  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    if (p >= CAMERA_KEYFRAMES[i].t && p <= CAMERA_KEYFRAMES[i + 1].t) {
      lower = CAMERA_KEYFRAMES[i];
      upper = CAMERA_KEYFRAMES[i + 1];
      break;
    }
  }

  const span = upper.t - lower.t || 1;
  const localT = (p - lower.t) / span;

  return {
    position: lerpVec3(lower.position, upper.position, localT),
    lookAt: lerpVec3(lower.lookAt, upper.lookAt, localT),
  };
}
