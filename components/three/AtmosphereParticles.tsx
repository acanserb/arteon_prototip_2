"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneProgress, pointer } from "@/lib/scrollProgress";
import { smoothstep, lerp, clamp } from "@/lib/math";

/** Soft round sprite so points read as tiny glows instead of hard squares. */
function useDotTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

// Nested inside SceneRoot's transformed group, so these coordinates are in
// the same hero-offset/yawed local space as the spine itself — no separate
// right-bias needed, they just naturally cluster where the spine sits.
const SPINE_CENTER: [number, number, number] = [0, 0.5, 0];
const SPINE_EXTENT: [number, number, number] = [2.1, 4.3, 2.1];
// A thinner, lower-density halo reaching toward the viewport center so the
// field doesn't look like a hard-edged box around the spine.
const HALO_CENTER: [number, number, number] = [-1.6, 0.3, 0.4];
const HALO_EXTENT: [number, number, number] = [1.6, 3.6, 1.8];

interface Tier {
  count: number;
  size: number;
  sizeJitter: number;
  baseOpacity: number;
  color: string;
  driftAmp: number;
  driftSpeed: number;
  /** How strongly this tier reacts to scroll/cursor parallax (0..1, front-most = 1). */
  parallax: number;
  haloFraction: number;
  /** Fraction of this tier's particles that drift at all — the rest sit still. */
  movingFraction: number;
}

const TIERS: Tier[] = [
  // faint, tiny, numerous — the bulk of the field; about half sit still
  { count: 68, size: 0.022, sizeJitter: 0.016, baseOpacity: 0.1, color: "#19c5f4", driftAmp: 0.1, driftSpeed: 0.05, parallax: 0.32, haloFraction: 0.28, movingFraction: 0.5 },
  // medium — gives the field some visible texture
  { count: 28, size: 0.048, sizeJitter: 0.018, baseOpacity: 0.2, color: "#3fd0ff", driftAmp: 0.13, driftSpeed: 0.045, parallax: 0.6, haloFraction: 0.2, movingFraction: 0.65 },
  // bright anchors — a handful of clearly-visible technical marker points
  { count: 10, size: 0.085, sizeJitter: 0.02, baseOpacity: 0.5, color: "#a6ecff", driftAmp: 0.07, driftSpeed: 0.06, parallax: 0.9, haloFraction: 0.1, movingFraction: 0.8 },
];

function randomInBox(
  center: [number, number, number],
  extent: [number, number, number]
): [number, number, number] {
  return [
    center[0] + (Math.random() * 2 - 1) * extent[0],
    center[1] + (Math.random() * 2 - 1) * extent[1],
    center[2] + (Math.random() * 2 - 1) * extent[2],
  ];
}

function buildTierData(tier: Tier) {
  const positions = new Float32Array(tier.count * 3);
  const base: [number, number, number][] = [];
  const seeds = new Float32Array(tier.count);
  const sizes = new Float32Array(tier.count);
  const depths = new Float32Array(tier.count);
  const moving = new Float32Array(tier.count);

  for (let i = 0; i < tier.count; i++) {
    const useHalo = Math.random() < tier.haloFraction;
    const [x, y, z] = useHalo ? randomInBox(HALO_CENTER, HALO_EXTENT) : randomInBox(SPINE_CENTER, SPINE_EXTENT);
    base.push([x, y, z]);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    seeds[i] = Math.random() * Math.PI * 2;
    sizes[i] = tier.size + (Math.random() * 2 - 1) * tier.sizeJitter;
    // -1 (far behind the spine) .. 1 (drifting in front of it) — drives both
    // a small permanent depth offset and how strongly parallax affects it.
    depths[i] = Math.random() * 2 - 1;
    moving[i] = Math.random() < tier.movingFraction ? 1 : 0;
  }

  return { positions, base, seeds, sizes, depths, moving };
}

export default function AtmosphereParticles() {
  const dotTexture = useDotTexture();
  const groupRef = useRef<THREE.Group>(null);
  const pointsRefs = useRef<Array<THREE.Points | null>>([]);
  const dampedPointer = useRef({ x: 0, y: 0 });
  const prevProgress = useRef(0);
  const scrollVelocity = useRef(0);

  const tierData = useMemo(() => TIERS.map(buildTierData), []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const progress = sceneProgress.value;

    // Fades to a lower baseline once the pinned experience takes over the
    // framing — never fully gone, so later chapters keep some atmosphere
    // instead of going visually empty (only the hero gets full density).
    const visibility = lerp(1, 0.3, smoothstep(0.06, 0.2, progress));

    if (groupRef.current) {
      groupRef.current.visible = visibility > 0.01;
    }

    dampedPointer.current.x += (pointer.x - dampedPointer.current.x) * Math.min(1, delta * 1.2);
    dampedPointer.current.y += (pointer.y - dampedPointer.current.y) * Math.min(1, delta * 1.2);

    // Rough, smoothed scroll-speed estimate (progress units / second) driven
    // off the raw scrub, not the damped chapter progress — this is meant to
    // read as "the field reacts a touch to how fast you're moving," which
    // only makes sense against actual input speed.
    if (delta > 0) {
      const instVelocity = (progress - prevProgress.current) / delta;
      scrollVelocity.current += (instVelocity - scrollVelocity.current) * Math.min(1, delta * 6);
    }
    prevProgress.current = progress;
    const velocityNudge = clamp(scrollVelocity.current * 0.6, -1, 1);

    TIERS.forEach((tier, tierIndex) => {
      const data = tierData[tierIndex];
      const points = pointsRefs.current[tierIndex];
      if (!points) return;

      const pos = points.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < tier.count; i++) {
        const [bx, by, bz] = data.base[i];
        const seed = data.seeds[i];
        const depth = data.depths[i];
        const moves = data.moving[i];
        const parallaxAmount = tier.parallax * (0.4 + 0.6 * (depth + 1) * 0.5);

        // gentle time drift, unique per particle via its seed — static
        // particles simply have this zeroed out below
        const driftX = Math.sin(t * tier.driftSpeed + seed) * tier.driftAmp * moves;
        const driftY = Math.cos(t * tier.driftSpeed * 0.85 + seed * 1.3) * tier.driftAmp * 0.8 * moves;
        const driftZ = Math.sin(t * tier.driftSpeed * 0.7 + seed * 1.7) * tier.driftAmp * moves;

        // soft scroll parallax — reads mainly as the field settling as the
        // pinned experience takes over, layered by depth
        const scrollShiftY = -progress * 1.4 * parallaxAmount;
        const scrollShiftX = progress * 0.6 * parallaxAmount;

        // brief directional nudge that tracks scroll speed and relaxes back
        // out on its own as the velocity estimate decays — never a spring,
        // just following an already-smoothed signal
        const velocityShiftY = velocityNudge * 0.06 * parallaxAmount;

        // extremely subtle cursor-driven depth parallax
        const cursorShiftX = dampedPointer.current.x * 0.18 * parallaxAmount;
        const cursorShiftY = dampedPointer.current.y * -0.12 * parallaxAmount;

        pos.setXYZ(
          i,
          bx + driftX + scrollShiftX + cursorShiftX,
          by + driftY + scrollShiftY + velocityShiftY + cursorShiftY,
          bz + driftZ + depth * 0.5
        );
      }
      pos.needsUpdate = true;

      const mat = points.material as THREE.PointsMaterial;
      if (tierIndex === TIERS.length - 1) {
        // bright tier gets a slow, barely-there pulse
        const pulse = 0.85 + Math.sin(t * 0.45) * 0.15;
        mat.opacity = tier.baseOpacity * pulse * visibility;
      } else {
        mat.opacity = tier.baseOpacity * visibility;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {TIERS.map((tier, i) => (
        <points
          key={i}
          ref={(el) => {
            pointsRefs.current[i] = el;
          }}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[tierData[i].positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            map={dotTexture}
            size={tier.size}
            color={tier.color}
            transparent
            opacity={tier.baseOpacity}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  );
}
