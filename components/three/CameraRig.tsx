"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { pointer } from "@/lib/scrollProgress";
import { renderedProgress } from "@/lib/motionProgress";
import { getCameraFrame } from "@/lib/cameraKeyframes";
import { liveHeroPose, heroPoseActive } from "@/lib/scenePoses";

const IDLE_THRESHOLD = 0.02;

export default function CameraRig() {
  const { camera } = useThree();
  const lookAtTarget = useRef(new Vector3(0, 0.8, 0));
  const desiredPos = useRef(new Vector3());
  const desiredLookAt = useRef(new Vector3());
  const dampedMouseX = useRef(0);
  const dampedMouseY = useRef(0);

  useFrame((_, delta) => {
    const progress = renderedProgress.value;

    if (heroPoseActive.value) {
      // Hero <-> Scene 1: assign the pose GSAP is animating directly — no
      // lerp, no follow-speed damping. Exactly one ease curve (the GSAP
      // timeline in lib/motionProgress.ts) drives this composition; a
      // per-frame low-pass filter on top of it would just reintroduce the
      // stacked-easing lag this rig used to have.
      camera.position.set(
        liveHeroPose.cameraPosition.x,
        liveHeroPose.cameraPosition.y,
        liveHeroPose.cameraPosition.z
      );
      lookAtTarget.current.set(
        liveHeroPose.cameraLookAt.x,
        liveHeroPose.cameraLookAt.y,
        liveHeroPose.cameraLookAt.z
      );

      if (progress < IDLE_THRESHOLD) {
        // Idle mouse parallax — a small, independent stabilization applied
        // only at rest, not part of the scroll-driven transition curve.
        dampedMouseX.current += (pointer.x - dampedMouseX.current) * Math.min(1, delta * 1.6);
        dampedMouseY.current += (pointer.y - dampedMouseY.current) * Math.min(1, delta * 1.6);

        const yaw = (dampedMouseX.current * 3 * Math.PI) / 180;
        const pitch = (dampedMouseY.current * 1.5 * Math.PI) / 180;

        camera.position.x += Math.sin(yaw) * 1.2;
        camera.position.y += Math.sin(pitch) * 0.45;
      }

      camera.lookAt(lookAtTarget.current);
      return;
    }

    // Scene 1 onward: direct assignment from the (now linearly-interpolated)
    // keyframe path — no per-frame follow-lerp. That damping made sense in
    // the old continuously-scrubbed architecture (smoothing a target that
    // moved every frame); now `progress` only ever changes via a single
    // discrete, already-eased GSAP timeline, so chasing it with an
    // exponential lerp on top just adds an extra, undesigned ~0.5-1s of
    // visible lag before a transition reads as "started."
    const frame = getCameraFrame(progress);
    desiredPos.current.set(...frame.position);
    desiredLookAt.current.set(...frame.lookAt);
    camera.position.copy(desiredPos.current);
    lookAtTarget.current.copy(desiredLookAt.current);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
