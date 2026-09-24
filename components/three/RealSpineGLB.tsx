"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh, MeshPhysicalMaterial, Object3D, PointLight } from "three";
import { renderedProgress } from "@/lib/motionProgress";
import { phaseT, lerp } from "@/lib/math";
import { PHASES } from "@/lib/cameraKeyframes";
import { focusGapCenter } from "@/lib/spineData";
import { LEVEL_MESH_GROUPS, DISC_MATERIAL_NAMES, GLB_SCALE, GLB_OFFSET } from "@/lib/spineGlbMap";

const GLB_PATH = "/models/spine.glb";

const BONE_COLOR = "#AFBABD";
const DISC_COLOR = "#6E7F86";

function boneMaterial() {
  return new MeshPhysicalMaterial({
    color: BONE_COLOR,
    roughness: 0.53,
    metalness: 0,
    clearcoat: 0.04,
    clearcoatRoughness: 0.55,
  });
}

// Cooler, darker, slightly desaturated-blue — reads as cartilage next to the
// pale bone without turning bright blue itself; mainly helps separate
// individual vertebrae for readability.
function discMaterial() {
  return new MeshPhysicalMaterial({
    color: DISC_COLOR,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.02,
    clearcoatRoughness: 0.65,
  });
}

// Explode offsets are applied as each mesh's own LOCAL position, which sits
// under the GLB_SCALE wrapper group — so a world-unit separation needs to
// be expressed in the model's pre-scale local units. A real lumbar vertebral
// body is itself ~0.6 world units tall at this normalization, so the old
// procedural spine's 0.4-unit explode (tuned for its own smaller bodies)
// left almost no clearance here — bumped up so the implant gap actually
// opens up.
const EXPLODE_WORLD_UNITS = 0.75;
const EXPLODE_LOCAL = EXPLODE_WORLD_UNITS / GLB_SCALE;

export default function RealSpineGLB() {
  const { scene } = useGLTF(GLB_PATH);

  const wrapperRef = useRef<Group>(null);
  const focusLightRef = useRef<PointLight>(null);
  const upperMeshesRef = useRef<Object3D[]>([]);
  const lowerMeshesRef = useRef<Object3D[]>([]);
  const upperBasePos = useRef<[number, number, number][]>([]);
  const lowerBasePos = useRef<[number, number, number][]>([]);

  const boneMat = useMemo(() => boneMaterial(), []);
  const discMat = useMemo(() => discMaterial(), []);

  useEffect(() => {
    const upperNames = new Set(LEVEL_MESH_GROUPS.L4);
    const lowerNames = new Set(LEVEL_MESH_GROUPS.L5);
    const upper: Object3D[] = [];
    const lower: Object3D[] = [];

    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;

      const isDisc = typeof child.material?.name === "string" && DISC_MATERIAL_NAMES.has(child.material.name);
      child.material = isDisc ? discMat : boneMat;
      child.castShadow = false;
      child.receiveShadow = false;

      if (upperNames.has(child.name)) upper.push(child);
      if (lowerNames.has(child.name)) lower.push(child);
    });

    upperMeshesRef.current = upper;
    lowerMeshesRef.current = lower;
    upperBasePos.current = upper.map((o) => [o.position.x, o.position.y, o.position.z]);
    lowerBasePos.current = lower.map((o) => [o.position.x, o.position.y, o.position.z]);
  }, [scene, boneMat, discMat]);

  useFrame(() => {
    const progress = renderedProgress.value;

    const explodeIn = phaseT(progress, PHASES.explode[0], PHASES.explode[1]);
    const explodeOut = phaseT(progress, PHASES.reassemble[0], PHASES.reassemble[1]);
    const explodeAmount = explodeIn * (1 - explodeOut);
    const delta = explodeAmount * EXPLODE_LOCAL;

    // These meshes sit under the GLB's baked root rotation (-90deg about X,
    // the Sketchfab Z-up correction), which maps local (x,y,z) -> world
    // (x,z,-y). So moving "up" in world Y means nudging LOCAL Z, and a
    // world-Z (forward) nudge means nudging LOCAL Y negatively — not the
    // other way around.
    const nudge = delta * 0.35;
    upperMeshesRef.current.forEach((mesh, i) => {
      const base = upperBasePos.current[i];
      if (!base) return;
      mesh.position.set(base[0], base[1] - nudge, base[2] + delta);
    });
    lowerMeshesRef.current.forEach((mesh, i) => {
      const base = lowerBasePos.current[i];
      if (!base) return;
      mesh.position.set(base[0], base[1] - nudge, base[2] - delta);
    });

    const focusIn = phaseT(progress, PHASES.lumbarFocus[0], PHASES.explode[1]);
    const focusOut = phaseT(progress, PHASES.reassemble[0], PHASES.reassemble[1]);
    if (focusLightRef.current) {
      focusLightRef.current.intensity = lerp(0, 9, focusIn * (1 - focusOut));
    }
  });

  return (
    <group ref={wrapperRef} scale={GLB_SCALE} position={GLB_OFFSET}>
      <primitive object={scene} />
      <pointLight
        ref={focusLightRef}
        position={[
          (focusGapCenter[0] + 0.4 - GLB_OFFSET[0]) / GLB_SCALE,
          (focusGapCenter[1] + 0.3 - GLB_OFFSET[1]) / GLB_SCALE,
          (focusGapCenter[2] + 1.8 - GLB_OFFSET[2]) / GLB_SCALE,
        ]}
        intensity={0}
        color="#eef6f8"
        distance={GLB_SCALE > 0 ? 5 / GLB_SCALE : 5}
        decay={2}
      />
    </group>
  );
}

useGLTF.preload(GLB_PATH);
