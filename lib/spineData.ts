import { CatmullRomCurve3, Vector3 } from "three";

export type Region = "cervical" | "thoracic" | "lumbar" | "sacrum";

export interface VertebraDef {
  id: string;
  region: Region;
  index: number;
  position: [number, number, number];
  rotationZ: number;
  size: [number, number, number];
}

/**
 * Rough sagittal-profile control points (side view) approximating natural
 * cervical lordosis / thoracic kyphosis / lumbar lordosis curvature. Not
 * anatomically exact — this is placeholder geometry standing in for a real
 * .glb until one is supplied (see project brief, section 19).
 */
const CONTROL_POINTS = [
  new Vector3(0.06, 4.55, 0),
  new Vector3(-0.06, 4.1, 0),
  new Vector3(-0.2, 3.5, 0),
  new Vector3(-0.1, 3.05, 0),
  new Vector3(0.22, 2.15, 0),
  new Vector3(0.42, 1.3, 0),
  new Vector3(0.22, 0.4, 0),
  new Vector3(-0.14, -0.15, 0),
  new Vector3(-0.44, -1.0, 0),
  new Vector3(-0.52, -1.85, 0),
  new Vector3(-0.28, -2.5, 0),
  new Vector3(0.02, -2.95, 0),
  new Vector3(0.34, -3.4, 0),
];

const curve = new CatmullRomCurve3(CONTROL_POINTS, false, "catmullrom", 0.4);

const REGIONS: { region: Region; count: number }[] = [
  { region: "cervical", count: 7 },
  { region: "thoracic", count: 12 },
  { region: "lumbar", count: 5 },
  { region: "sacrum", count: 1 },
];

const TOTAL = REGIONS.reduce((sum, r) => sum + r.count, 0);

/** Width / height / depth of the vertebral body, before elegance tapering. */
function sizeForRegion(region: Region, localIndex: number, count: number): [number, number, number] {
  switch (region) {
    case "cervical": {
      const t = localIndex / (count - 1);
      const w = 0.27 + t * 0.05;
      return [w, 0.19, 0.24 + t * 0.03];
    }
    case "thoracic": {
      const t = localIndex / (count - 1);
      const w = 0.33 + t * 0.19;
      return [w, 0.22, 0.3 + t * 0.14];
    }
    case "lumbar": {
      const t = localIndex / (count - 1);
      const w = 0.48 + t * 0.12;
      return [w, 0.3, 0.42 + t * 0.09];
    }
    case "sacrum":
      return [0.5, 0.4, 0.38];
  }
}

function buildVertebrae(): VertebraDef[] {
  const list: VertebraDef[] = [];
  let flatIndex = 0;

  for (const { region, count } of REGIONS) {
    for (let localIndex = 0; localIndex < count; localIndex++) {
      const u = flatIndex / (TOTAL - 1);
      const uNext = Math.min(1, u + 0.008);
      const p = curve.getPointAt(u);
      const pNext = curve.getPointAt(uNext);
      const tangent = new Vector3().subVectors(pNext, p).normalize();
      const rotationZ = Math.atan2(tangent.x, tangent.y) * -1;

      const label =
        region === "cervical"
          ? `C${localIndex + 1}`
          : region === "thoracic"
          ? `T${localIndex + 1}`
          : region === "lumbar"
          ? `L${localIndex + 1}`
          : "Sacrum";

      list.push({
        id: label,
        region,
        index: flatIndex,
        position: [p.x, p.y, p.z],
        rotationZ,
        size: sizeForRegion(region, localIndex, count),
      });

      flatIndex++;
    }
  }

  return list;
}

export const VERTEBRAE = buildVertebrae();

export const FOCUS_IDS = ["L4", "L5"];

export const focusVertebrae = VERTEBRAE.filter((v) => FOCUS_IDS.includes(v.id));
export const staticVertebrae = VERTEBRAE.filter(
  (v) => !FOCUS_IDS.includes(v.id) && v.region !== "sacrum"
);
export const sacrumVertebra = VERTEBRAE.find((v) => v.region === "sacrum")!;

/** Procedural-only fallback targets — used if the ProceduralSpine ever renders on its own. */
export const proceduralLumbarCenter = (() => {
  const l = VERTEBRAE.filter((v) => v.region === "lumbar");
  const avg = l.reduce(
    (acc, v) => [acc[0] + v.position[0], acc[1] + v.position[1], acc[2] + v.position[2]],
    [0, 0, 0]
  );
  return [avg[0] / l.length, avg[1] / l.length, avg[2] / l.length] as [number, number, number];
})();

export const proceduralFocusGapCenter = (() => {
  const [a, b] = focusVertebrae;
  return [
    (a.position[0] + b.position[0]) / 2,
    (a.position[1] + b.position[1]) / 2,
    (a.position[2] + b.position[2]) / 2,
  ] as [number, number, number];
})();

/**
 * Camera targets for lib/cameraKeyframes.ts. These are the REAL spine.glb's
 * anatomical landmarks (L1-L5 / L4-L5 / T9-T11), precomputed once from the
 * model's own geometry after applying its root rotation + our normalizing
 * scale/offset (see lib/spineGlbMap.ts) — not from the procedural curve
 * above. Close enough to the procedural spine's own placement to still work
 * as a reasonable camera target if the fallback ever renders instead.
 */
export const lumbarCenter: [number, number, number] = [-0.029, -2.038, 0.064];
export const focusGapCenter: [number, number, number] = [-0.026, -2.704, 0.134];

/**
 * Mid-thoracic / upper-lumbar landmark used as the hero camera's resting
 * look-at target — T9-T11 midpoint on the real model, per the reference
 * composition.
 */
export const heroTarget: [number, number, number] = [0.005, -0.035, -0.273];
