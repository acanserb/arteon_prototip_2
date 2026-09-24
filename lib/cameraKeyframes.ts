import { lumbarCenter, focusGapCenter } from "./spineData";
import { lerpVec3, EASE } from "./math";

export interface CameraKeyframe {
  t: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  /** Eases the transition arriving at this keyframe. */
  ease: (x: number) => number;
}

export const PHASES = {
  full: [0, 0.15] as [number, number],
  approach: [0.15, 0.3] as [number, number],
  focus: [0.3, 0.45] as [number, number],
  explode: [0.45, 0.58] as [number, number],
  implant: [0.58, 0.72] as [number, number],
  hardware: [0.72, 0.84] as [number, number],
  reassemble: [0.84, 0.94] as [number, number],
  exit: [0.94, 1.0] as [number, number],
};

export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // hero — a full-spine establishing shot: pulled back far enough that the
  // whole column (cervical through sacrum) reads as one continuous elegant
  // object, only lightly cropped top/bottom. Close-ups are for later phases.
  { t: 0, position: [0.15, 0.9, 10.5], lookAt: [0, 0.5, -0.1], ease: EASE.easeInOutCubic },
  // full spine — very slow, contemplative drift
  { t: 0.15, position: [1.6, 0.3, 6.6], lookAt: [0, 0.4, 0], ease: EASE.easeInOutQuint },
  // camera approach — slightly accelerating toward the lumbar region
  { t: 0.3, position: [1.3, lumbarCenter[1] + 0.5, 4.2], lookAt: lumbarCenter, ease: EASE.easeInOutCubic },
  // final lumbar framing — slows into the two-vertebra focus
  { t: 0.45, position: [1.3, focusGapCenter[1] + 0.2, 3.7], lookAt: focusGapCenter, ease: EASE.easeOutCubic },
  // exploded anatomy — controlled, deliberate
  { t: 0.58, position: [0.85, focusGapCenter[1] - 0.05, 3.2], lookAt: focusGapCenter, ease: EASE.easeInOutCubic },
  // implant insertion — precise, unhurried
  { t: 0.72, position: [0.55, focusGapCenter[1] - 0.05, 2.7], lookAt: focusGapCenter, ease: EASE.easeInOutQuint },
  { t: 0.84, position: [0.15, focusGapCenter[1], 3.3], lookAt: focusGapCenter, ease: EASE.easeInOutQuint },
  // final assembly — calm pull-back
  { t: 0.94, position: [-1.6, lumbarCenter[1] + 1.2, 5.6], lookAt: lumbarCenter, ease: EASE.easeOutCubic },
  { t: 1.0, position: [-3.6, 0.2, 8.6], lookAt: [0, 0, 0], ease: EASE.easeOutCubic },
];

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
  const localT = upper.ease((p - lower.t) / span);

  return {
    position: lerpVec3(lower.position, upper.position, localT),
    lookAt: lerpVec3(lower.lookAt, upper.lookAt, localT),
  };
}
