"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group } from "three";
import { lerp } from "@/lib/math";
import { HERO_POSE, SCENE1_POSE, REFERENCE_ASPECT, liveHeroPose } from "@/lib/scenePoses";
import SpineModel from "./SpineModel";
import Implant from "./Implant";
import AtmosphereParticles from "./AtmosphereParticles";

/**
 * Shifts the spine toward the right side of the viewport (partially cropping
 * past the edge) and gives it a moderate three-quarter yaw while idle in the
 * hero, then recenters/un-rotates it as the Hero -> Scene 1 GSAP transition
 * plays. `liveHeroPose.rootT` is animated directly by that same timeline
 * (lib/motionProgress.ts) — this just linearly interpolates the two known
 * endpoints by it, no smoothstep/re-easing of its own, so the root recenter
 * rides the exact same curve as the camera instead of a second one.
 *
 * Calibrated at REFERENCE_ASPECT (~1920x1080) and rescaled by the current
 * viewport's aspect ratio every frame — a fixed world-space offset lands at
 * a very different screen percentage on a wide 16:9 monitor than on a
 * narrow or near-square one.
 */
export default function SceneRoot() {
  const groupRef = useRef<Group>(null);
  const size = useThree((state) => state.size);

  useFrame(() => {
    const aspect = size.width / size.height;
    const heroOffsetX = HERO_POSE.rootOffsetXAtReferenceAspect * (aspect / REFERENCE_ASPECT);
    const t = liveHeroPose.rootT;
    if (groupRef.current) {
      groupRef.current.position.x = lerp(heroOffsetX, SCENE1_POSE.rootOffsetXAtReferenceAspect, t);
      groupRef.current.rotation.y = lerp(HERO_POSE.rootYaw, SCENE1_POSE.rootYaw, t);
    }
  });

  return (
    <group ref={groupRef}>
      <SpineModel />
      <Implant />
      <AtmosphereParticles />
    </group>
  );
}
