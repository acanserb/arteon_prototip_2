"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  MeshPhysicalMaterial,
  Group,
  LatheGeometry,
  ConeGeometry,
  Vector2,
  Vector3,
  Quaternion,
  PointLight,
} from "three";
import { staticVertebrae, focusVertebrae, sacrumVertebra, focusGapCenter } from "@/lib/spineData";
import { renderedProgress } from "@/lib/motionProgress";
import { phaseT, lerp, rotateOffsetZ } from "@/lib/math";
import { PHASES } from "@/lib/cameraKeyframes";

const dummy = new Object3D();

const BONE_COLOR = "#DCE4E5";

const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Z = new Vector3(0, 0, 1);
// Fixed local tilt for the spinous process (points roughly -Z, angled down).
// Composed as qZ(rotationZ) * qSpinousTilt rather than a single Euler
// rotation.set(x, 0, z) — Euler XYZ order entangles the two axes and, for a
// long thin cone, visibly warps it into the curve plane instead of leaving
// it pointing backward.
const qSpinousTilt = new Quaternion().setFromAxisAngle(AXIS_X, -1.85);

/**
 * A rounded, lens-shaped profile revolved around Y — reads as a smooth
 * vertebral body silhouette instead of a faceted cylinder slab. Radius maxes
 * out at 0.5 so a mesh scaled by [w, h, d] ends up w-by-h-by-d in world
 * units (diameter == w, not 2*w) — keeps per-vertebra size directly
 * comparable to the ~0.354 unit spacing between vertebra centers along the
 * curve, instead of silently doubling it and fusing neighbors together.
 */
const BODY_PROFILE = [
  new Vector2(0, -0.5),
  new Vector2(0.26, -0.42),
  new Vector2(0.44, -0.22),
  new Vector2(0.5, 0),
  new Vector2(0.44, 0.22),
  new Vector2(0.26, 0.42),
  new Vector2(0, 0.5),
];

function useSpineGeometries() {
  return useMemo(() => {
    const body = new LatheGeometry(BODY_PROFILE, 20);
    const spinous = new ConeGeometry(0.15, 0.62, 7, 1);
    const transverse = new ConeGeometry(0.1, 0.46, 6, 1);
    const sacrum = new ConeGeometry(1, 1, 9, 1);
    return { body, spinous, transverse, sacrum };
  }, []);
}

function boneMaterialProps() {
  return {
    color: BONE_COLOR,
    roughness: 0.44,
    metalness: 0.02,
    clearcoat: 0.08,
    clearcoatRoughness: 0.52,
  };
}

/** Attaches a spinous + pair of transverse process meshes to a vertebra group. */
function VertebraProcesses({
  geometries,
  factor,
}: {
  geometries: { spinous: ConeGeometry; transverse: ConeGeometry };
  factor: number;
}) {
  return (
    <>
      <mesh
        geometry={geometries.spinous}
        position={[0, -0.06 * factor, -0.78 * factor]}
        rotation={[-1.85, 0, 0]}
        scale={factor}
      >
        <meshPhysicalMaterial {...boneMaterialProps()} />
      </mesh>
      <mesh
        geometry={geometries.transverse}
        position={[-0.82 * factor, 0.02 * factor, -0.06 * factor]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={factor}
      >
        <meshPhysicalMaterial {...boneMaterialProps()} />
      </mesh>
      <mesh
        geometry={geometries.transverse}
        position={[0.82 * factor, 0.02 * factor, -0.06 * factor]}
        rotation={[0, 0, Math.PI / 2]}
        scale={factor}
      >
        <meshPhysicalMaterial {...boneMaterialProps()} />
      </mesh>
    </>
  );
}

export default function ProceduralSpine() {
  const geometries = useSpineGeometries();

  const bodyRef = useRef<InstancedMesh>(null);
  const spinousRef = useRef<InstancedMesh>(null);
  const transverseRef = useRef<InstancedMesh>(null);
  const sacrumRef = useRef<Group>(null);
  const upperRef = useRef<Group>(null);
  const lowerRef = useRef<Group>(null);
  const focusLightRef = useRef<PointLight>(null);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const spinous = spinousRef.current;
    const transverse = transverseRef.current;
    if (!body || !spinous || !transverse) return;

    staticVertebrae.forEach((v, i) => {
      dummy.position.set(...v.position);
      dummy.rotation.set(0, 0, v.rotationZ);
      dummy.scale.set(v.size[0], v.size[1], v.size[2]);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);

      const factor = v.size[0];

      const spinousOffset = rotateOffsetZ([0, -0.06 * factor, -0.78 * factor], v.rotationZ);
      dummy.position.set(
        v.position[0] + spinousOffset[0],
        v.position[1] + spinousOffset[1],
        v.position[2] + spinousOffset[2]
      );
      dummy.quaternion.setFromAxisAngle(AXIS_Z, v.rotationZ).multiply(qSpinousTilt);
      dummy.scale.setScalar(factor);
      dummy.updateMatrix();
      spinous.setMatrixAt(i, dummy.matrix);

      const leftOffset = rotateOffsetZ([-0.82 * factor, 0.02 * factor, -0.06 * factor], v.rotationZ);
      dummy.position.set(
        v.position[0] + leftOffset[0],
        v.position[1] + leftOffset[1],
        v.position[2] + leftOffset[2]
      );
      dummy.rotation.set(0, 0, v.rotationZ - Math.PI / 2);
      dummy.scale.setScalar(factor);
      dummy.updateMatrix();
      transverse.setMatrixAt(i * 2, dummy.matrix);

      const rightOffset = rotateOffsetZ([0.82 * factor, 0.02 * factor, -0.06 * factor], v.rotationZ);
      dummy.position.set(
        v.position[0] + rightOffset[0],
        v.position[1] + rightOffset[1],
        v.position[2] + rightOffset[2]
      );
      dummy.rotation.set(0, 0, v.rotationZ + Math.PI / 2);
      dummy.scale.setScalar(factor);
      dummy.updateMatrix();
      transverse.setMatrixAt(i * 2 + 1, dummy.matrix);
    });

    body.instanceMatrix.needsUpdate = true;
    spinous.instanceMatrix.needsUpdate = true;
    transverse.instanceMatrix.needsUpdate = true;
  }, []);

  const [upperDef, lowerDef] = focusVertebrae;
  const upperFactor = upperDef.size[0];
  const lowerFactor = lowerDef.size[0];

  useFrame(() => {
    const progress = renderedProgress.value;

    const focusIn = phaseT(progress, PHASES.focus[0], PHASES.explode[1]);
    const focusOut = phaseT(progress, PHASES.reassemble[0], PHASES.reassemble[1]);
    const focusLevel = focusIn * (1 - focusOut);

    if (focusLightRef.current) {
      focusLightRef.current.intensity = lerp(0, 9, focusLevel);
    }

    const explodeIn = phaseT(progress, PHASES.explode[0], PHASES.explode[1]);
    const explodeOut = phaseT(progress, PHASES.reassemble[0], PHASES.reassemble[1]);
    const explodeAmount = explodeIn * (1 - explodeOut);

    if (upperRef.current) {
      upperRef.current.position.set(
        upperDef.position[0],
        upperDef.position[1] + explodeAmount * 0.4,
        upperDef.position[2] + explodeAmount * 0.15
      );
    }
    if (lowerRef.current) {
      lowerRef.current.position.set(
        lowerDef.position[0],
        lowerDef.position[1] - explodeAmount * 0.4,
        lowerDef.position[2] + explodeAmount * 0.15
      );
    }
  });

  return (
    <group>
      <pointLight
        ref={focusLightRef}
        position={[focusGapCenter[0] + 0.4, focusGapCenter[1] + 0.3, focusGapCenter[2] + 1.8]}
        intensity={0}
        color="#eef6f8"
        distance={5}
        decay={2}
      />

      <instancedMesh ref={bodyRef} args={[geometries.body, undefined, staticVertebrae.length]}>
        <meshPhysicalMaterial {...boneMaterialProps()} />
      </instancedMesh>
      <instancedMesh ref={spinousRef} args={[geometries.spinous, undefined, staticVertebrae.length]}>
        <meshPhysicalMaterial {...boneMaterialProps()} />
      </instancedMesh>
      <instancedMesh ref={transverseRef} args={[geometries.transverse, undefined, staticVertebrae.length * 2]}>
        <meshPhysicalMaterial {...boneMaterialProps()} />
      </instancedMesh>

      <group ref={upperRef} rotation={[0, 0, upperDef.rotationZ]}>
        <mesh geometry={geometries.body} scale={upperDef.size}>
          <meshPhysicalMaterial {...boneMaterialProps()} />
        </mesh>
        <VertebraProcesses geometries={geometries} factor={upperFactor} />
      </group>

      <group ref={lowerRef} rotation={[0, 0, lowerDef.rotationZ]}>
        <mesh geometry={geometries.body} scale={lowerDef.size}>
          <meshPhysicalMaterial {...boneMaterialProps()} />
        </mesh>
        <VertebraProcesses geometries={geometries} factor={lowerFactor} />
      </group>

      <group ref={sacrumRef} position={sacrumVertebra.position} rotation={[0, 0, sacrumVertebra.rotationZ]}>
        <mesh geometry={geometries.sacrum} rotation={[Math.PI, 0, 0]} scale={sacrumVertebra.size}>
          <meshPhysicalMaterial {...boneMaterialProps()} />
        </mesh>
      </group>
    </group>
  );
}
