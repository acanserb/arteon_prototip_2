"use client";

import { Suspense } from "react";
import RealSpineGLB from "./RealSpineGLB";
import ProceduralSpine from "./ProceduralSpine";
import GlbErrorBoundary from "./GlbErrorBoundary";

/**
 * Real anatomical spine.glb is the default. ProceduralSpine only renders as
 * an emergency fallback if the GLB fails to fetch/parse — normal use should
 * never show it.
 */
export default function SpineModel() {
  return (
    <GlbErrorBoundary fallback={<ProceduralSpine />}>
      <Suspense fallback={null}>
        <RealSpineGLB />
      </Suspense>
    </GlbErrorBoundary>
  );
}
