"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense } from "react";
import CameraRig from "./CameraRig";
import SceneRoot from "./SceneRoot";
import Lighting from "./Lighting";

const ATMOSPHERE_BACKGROUND = {
  backgroundColor: "#02090d",
  backgroundImage:
    "radial-gradient(ellipse at 82% 40%, rgba(0, 150, 210, 0.05), transparent 55%)",
};

export default function GlobalScene() {
  return (
    <div className="fixed inset-0 z-0" style={ATMOSPHERE_BACKGROUND}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 32, near: 0.1, far: 60, position: [0, 0.5, 9.2] }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <fog attach="fog" args={["#02090d", 14, 30]} />
        <Suspense fallback={null}>
          <Lighting />
          <SceneRoot />
          <CameraRig />
          <Environment resolution={128}>
            <group>
              <Lightformer
                form="rect"
                intensity={1.4}
                color="#f3f7f8"
                position={[4, 6, 4]}
                scale={[6, 6, 1]}
                target={[0, 0, 0]}
              />
              <Lightformer
                form="rect"
                intensity={0.35}
                color="#19c5f4"
                position={[-6, 0, -5]}
                scale={[5, 8, 1]}
                target={[0, 0, 0]}
              />
              <Lightformer
                form="ring"
                intensity={0.25}
                color="#4f7c8f"
                position={[0, -6, 2]}
                scale={4}
                target={[0, 0, 0]}
              />
            </group>
          </Environment>
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.35}
              luminanceThreshold={0.88}
              luminanceSmoothing={0.3}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
