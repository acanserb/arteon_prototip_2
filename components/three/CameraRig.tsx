"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { pointer } from "@/lib/scrollProgress";
import { renderedProgress } from "@/lib/motionProgress";
import { getCameraFrame } from "@/lib/cameraKeyframes";

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
    const frame = getCameraFrame(progress);

    desiredPos.current.set(...frame.position);
    desiredLookAt.current.set(...frame.lookAt);

    if (progress < IDLE_THRESHOLD) {
      dampedMouseX.current += (pointer.x - dampedMouseX.current) * Math.min(1, delta * 1.6);
      dampedMouseY.current += (pointer.y - dampedMouseY.current) * Math.min(1, delta * 1.6);

      const rotYDeg = 3;
      const rotXDeg = 1.5;
      const yaw = (dampedMouseX.current * rotYDeg * Math.PI) / 180;
      const pitch = (dampedMouseY.current * rotXDeg * Math.PI) / 180;

      desiredPos.current.x += Math.sin(yaw) * 1.2;
      desiredPos.current.y += Math.sin(pitch) * 0.45;
    }

    // renderedProgress already provides the primary temporal smoothing —
    // this only needs to take the edge off actual per-frame camera motion,
    // not re-dampen an already-damped input (stacking two slow lerps reads
    // as mushy, delayed control rather than cinematic).
    const followSpeed = Math.min(1, delta * 3.8);
    camera.position.lerp(desiredPos.current, followSpeed);
    lookAtTarget.current.lerp(desiredLookAt.current, followSpeed);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
