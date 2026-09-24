/**
 * Semantic map for /public/models/spine.glb — "Columna espinal humana /
 * Human spine" by Ualde (https://skfb.ly/6AKE8), CC-BY 4.0
 * (http://creativecommons.org/licenses/by/4.0/). Credit belongs in the
 * production footer/credits section.
 *
 * The GLB ships as a flat bag of 66 Sketchfab-exported meshes with generic
 * names ("Object_2" … "Object_67") and identity node transforms — all
 * geometry is baked in world space. There is no vertebra-level naming or
 * hierarchy in the source file, so this map was derived once by inspecting
 * the file directly (per-mesh bounding boxes, sorted along the spine axis,
 * grouped by material) rather than guessed. See the inspection scripts run
 * against this file for the method if the model is ever replaced/updated —
 * material "lambert2SG" is the 25 vertebral bodies (one per level, C1
 * through Sacrum), "lambert5SG"/"lambert4SG"/"lambert3SG" are the
 * intervertebral discs and small posterior elements attached to each body.
 */

export type VertebraLevel =
  | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7"
  | "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8" | "T9" | "T10" | "T11" | "T12"
  | "L1" | "L2" | "L3" | "L4" | "L5"
  | "Sacrum";

export const VERTEBRA_LEVELS: VertebraLevel[] = [
  "C1", "C2", "C3", "C4", "C5", "C6", "C7",
  "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12",
  "L1", "L2", "L3", "L4", "L5",
  "Sacrum",
];

/** The single vertebral-body mesh (material "lambert2SG") for each level. */
export const VERTEBRA_BODY_MESH: Record<VertebraLevel, string> = {
  C1: "Object_2", C2: "Object_15", C3: "Object_21", C4: "Object_25", C5: "Object_22",
  C6: "Object_24", C7: "Object_23",
  T1: "Object_4", T2: "Object_5", T3: "Object_6", T4: "Object_7", T5: "Object_8",
  T6: "Object_9", T7: "Object_10", T8: "Object_11", T9: "Object_12", T10: "Object_3",
  T11: "Object_14", T12: "Object_13",
  L1: "Object_19", L2: "Object_16", L3: "Object_17", L4: "Object_18", L5: "Object_20",
  Sacrum: "Object_26",
};

/**
 * Every mesh in the file (body + disc + small posterior elements) assigned
 * to its nearest vertebral level by proximity along the spine axis — so an
 * explode/highlight animation on one level can move its whole anatomical
 * cluster together instead of leaving a disc or process behind.
 */
export const LEVEL_MESH_GROUPS: Record<VertebraLevel, string[]> = {
  C1: ["Object_2"],
  C2: ["Object_15", "Object_47"],
  C3: ["Object_21", "Object_43", "Object_66"],
  C4: ["Object_25", "Object_40", "Object_63"],
  C5: ["Object_22", "Object_27", "Object_44", "Object_67"],
  C6: ["Object_24", "Object_42", "Object_65"],
  C7: ["Object_23", "Object_41", "Object_64"],
  T1: ["Object_4", "Object_34", "Object_57"],
  T2: ["Object_5", "Object_56"],
  T3: ["Object_6", "Object_33", "Object_55"],
  T4: ["Object_7", "Object_54"],
  T5: ["Object_8", "Object_32", "Object_53"],
  T6: ["Object_9", "Object_31", "Object_52"],
  T7: ["Object_10", "Object_51"],
  T8: ["Object_11", "Object_45", "Object_50"],
  T9: ["Object_12", "Object_28", "Object_30", "Object_48"],
  T10: ["Object_3", "Object_49"],
  T11: ["Object_14", "Object_29", "Object_46"],
  T12: ["Object_13"],
  L1: ["Object_19", "Object_35", "Object_58"],
  L2: ["Object_16", "Object_36", "Object_59"],
  L3: ["Object_17", "Object_37", "Object_60"],
  L4: ["Object_18", "Object_38", "Object_61"],
  L5: ["Object_20", "Object_39", "Object_62"],
  Sacrum: ["Object_26"],
};

/**
 * Materials in the source file that represent intervertebral discs, i.e.
 * that should get the cooler cartilage tone rather than the bone material.
 * "lambert5SG" (23 meshes) matches the ~24 disc-space gaps between the 25
 * vertebral bodies. "lambert4SG" (17 meshes) and "lambert3SG" (1 mesh) sit
 * right against each body instead — posterior elements/processes, not
 * discs — so they stay on the bone material and get differentiated by
 * light/AO instead, per the art-direction pass (they're anatomically part
 * of the bone, not a separate tissue).
 */
export const DISC_MATERIAL_NAMES = new Set(["lambert5SG"]);

/**
 * The GLB's root node ("Sketchfab_model") carries a -90° X rotation (the
 * standard Sketchfab Z-up → glTF Y-up correction) which GLTFLoader applies
 * automatically as part of the scene graph — do not re-apply it. What
 * follows is purely OUR normalizing scale/offset on top of that already-
 * correct scene, chosen so the model's C1 lands at y=4.5 and it's centered
 * on X/Z — matching where the previous procedural spine sat, so the already
 * -tuned camera keyframes keep working without modification. Derived by
 * loading the file, taking each vertebral body's bounding-box centroid,
 * rotating by the root's -90° X, and solving for scale/offset against
 * TARGET_HEIGHT = 8.6 world units.
 */
export const GLB_SCALE = 0.13519;
export const GLB_OFFSET: [number, number, number] = [-3.288, 4.385, 1.29];
