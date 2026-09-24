"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { renderedProgress } from "@/lib/motionProgress";
import { phaseT, lerp, lerpVec3 } from "@/lib/math";
import { PHASES } from "@/lib/cameraKeyframes";
import { focusGapCenter } from "@/lib/spineData";

const TITANIUM = {
  color: "#c9d0d3",
  roughness: 0.24,
  metalness: 0.9,
  emissive: "#0a1418",
  emissiveIntensity: 0.15,
};

// Kept close ("nearby surgical-space offset") so the cage stays inside the
// tight implant-phase camera frame for its whole float-in, instead of
// spending most of the transition off-screen before snapping into view.
const FLOAT_START: [number, number, number] = [
  focusGapCenter[0] + 0.45,
  focusGapCenter[1] + 0.25,
  focusGapCenter[2] + 0.55,
];

function useTitaniumMaterial() {
  return useMemo(
    () => new MeshStandardMaterial({ ...TITANIUM, transparent: true, opacity: 0 }),
    []
  );
}

const SCREW_OFFSETS: Array<{ side: number; y: number }> = [
  { side: 1, y: 0.22 },
  { side: -1, y: 0.22 },
  { side: 1, y: -0.22 },
  { side: -1, y: -0.22 },
];

export default function Implant() {
  const cageRef = useRef<Group>(null);
  const cageMat = useTitaniumMaterial();
  const perfMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#050c10",
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: 0,
      }),
    []
  );
  const screwRefs = useRef<Array<Mesh | null>>([]);
  const screwHeadRefs = useRef<Array<Mesh | null>>([]);
  const screwMats = useMemo(
    () => SCREW_OFFSETS.map(() => new MeshStandardMaterial({ ...TITANIUM, transparent: true, opacity: 0 })),
    []
  );
  const rodRefs = useRef<Array<Mesh | null>>([]);
  const rodMats = useMemo(
    () => [0, 1].map(() => new MeshStandardMaterial({ ...TITANIUM, roughness: 0.14, transparent: true, opacity: 0 })),
    []
  );

  useFrame(() => {
    const progress = renderedProgress.value;

    // One combined beat (reveal -> orient -> move -> seat), all inside
    // PHASES.implant — not several separate scenes. The implant fades in
    // over the first ~40% of the beat while it's still near its float
    // start, then position/rotation carry it to its seated pose across
    // essentially the whole beat, so reveal and insertion read as one
    // continuous cinematic move rather than two.
    const implantStart = PHASES.implant[0];
    const implantEnd = PHASES.implant[1];
    const implantSpan = implantEnd - implantStart;
    const floatT = phaseT(progress, implantStart, implantStart + implantSpan * 0.4);
    const settleT = phaseT(progress, implantStart + implantSpan * 0.15, implantEnd);

    const pos = lerpVec3(FLOAT_START, focusGapCenter, settleT);

    if (cageRef.current) {
      cageRef.current.position.set(pos[0], pos[1], pos[2]);
      cageRef.current.rotation.y = lerp(Math.PI * 0.6, 0, settleT);
      cageRef.current.rotation.x = lerp(0.4, 0, settleT);
    }
    cageMat.opacity = floatT;
    perfMat.opacity = floatT * 0.9;

    // Sequential assembly: each screw's window starts noticeably later than
    // the last (0.025 apart, ~50% of the whole hardware span end to end)
    // instead of nearly all firing at once, so the eye can actually follow
    // first element -> second -> remaining components -> final assembly.
    const hardwareBase = PHASES.hardware[0];

    SCREW_OFFSETS.forEach((offset, i) => {
      const stagger = i * 0.025;
      const t = phaseT(progress, hardwareBase + stagger, hardwareBase + stagger + 0.055);
      const mesh = screwRefs.current[i];
      const head = screwHeadRefs.current[i];
      const target = [
        focusGapCenter[0] + offset.side * 0.55,
        focusGapCenter[1] + offset.y,
        focusGapCenter[2] - 0.1,
      ];
      const start = [target[0] + offset.side * 0.6, target[1], target[2] - 0.9];
      const p = lerpVec3(start as [number, number, number], target as [number, number, number], t);
      if (mesh) mesh.position.set(p[0], p[1] - 0.16, p[2]);
      if (head) head.position.set(p[0], p[1] + 0.16, p[2]);
      screwMats[i].opacity = t;
    });

    // Rods settle in last, after the screws have visibly landed.
    const rodStart = hardwareBase + 0.09;
    const rodEnd = PHASES.hardware[1];
    [0, 1].forEach((side) => {
      const t = phaseT(progress, rodStart, rodEnd);
      rodMats[side].opacity = t;
      const mesh = rodRefs.current[side];
      if (mesh) mesh.scale.y = lerp(0.05, 1, t);
    });
  });

  return (
    <group>
      <pointLight
        position={[focusGapCenter[0] + 0.6, focusGapCenter[1] + 0.5, focusGapCenter[2] + 1.6]}
        intensity={9}
        color="#f3f7f8"
        distance={6}
        decay={2}
      />

      <group ref={cageRef}>
        <RoundedBox args={[0.42, 0.22, 0.5]} radius={0.045} smoothness={3} material={cageMat} />
        {/* faux perforations — small recessed discs suggesting bone-graft windows */}
        <mesh position={[0, 0.115, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={perfMat}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        </mesh>
        <mesh position={[0, 0.115, -0.12]} rotation={[Math.PI / 2, 0, 0]} material={perfMat}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        </mesh>
      </group>

      {SCREW_OFFSETS.map((offset, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              screwRefs.current[i] = el;
            }}
            material={screwMats[i]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.04, 0.018, 0.58, 8]} />
          </mesh>
          <mesh
            ref={(el) => {
              screwHeadRefs.current[i] = el;
            }}
            material={screwMats[i]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.062, 0.062, 0.08, 8]} />
          </mesh>
        </group>
      ))}

      {[0, 1].map((side) => (
        <mesh
          key={side}
          ref={(el) => {
            rodRefs.current[side] = el;
          }}
          material={rodMats[side]}
          position={[focusGapCenter[0] + (side === 0 ? 0.55 : -0.55), focusGapCenter[1], focusGapCenter[2] - 0.1]}
        >
          <cylinderGeometry args={[0.032, 0.032, 0.5, 10]} />
        </mesh>
      ))}
    </group>
  );
}
