"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group } from "three";
import { renderedProgress, SCENE_TARGETS } from "@/lib/motionProgress";
import { smoothstep, lerp } from "@/lib/math";
import SpineModel from "./SpineModel";
import Implant from "./Implant";
import AtmosphereParticles from "./AtmosphereParticles";

/**
 * Shifts the spine toward the right side of the viewport (partially cropping
 * past the edge) and gives it a moderate three-quarter yaw while idle in the
 * hero, then recenters/un-rotates it as soon as the pinned scroll experience
 * begins. Calibrated at REFERENCE_ASPECT (~1920x1080) and scaled by the
 * current viewport's aspect ratio — a fixed world-space offset lands at a
 * very different screen percentage on a wide 16:9 monitor than on a narrow
 * or near-square one, since a wider aspect exposes more horizontal FOV for
 * the same vertical FOV.
 */
const HERO_OFFSET_X_BASE = 2.6;
const HERO_YAW = 0.38;
const REFERENCE_ASPECT = 16 / 9;

export default function SceneRoot() {
  const groupRef = useRef<Group>(null);
  const size = useThree((state) => state.size);

  useFrame(() => {
    const progress = renderedProgress.value;
    // Spans the entire hero -> scene 1 GSAP transition (not a hair-trigger
    // sliver of it), so the recenter/un-rotate rides the same eased,
    // time-based move as the camera instead of snapping almost instantly.
    const centeredT = smoothstep(0, SCENE_TARGETS[1], progress);
    const aspect = size.width / size.height;
    const heroOffsetX = HERO_OFFSET_X_BASE * (aspect / REFERENCE_ASPECT);
    if (groupRef.current) {
      groupRef.current.position.x = lerp(heroOffsetX, 0, centeredT);
      groupRef.current.rotation.y = lerp(HERO_YAW, 0, centeredT);
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
