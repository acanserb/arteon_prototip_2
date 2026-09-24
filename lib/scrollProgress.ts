/**
 * Single mutable progress store shared between the GSAP ScrollTrigger
 * timeline (imperative writer) and the persistent R3F scene (reader inside
 * useFrame). Kept outside React state so scroll updates never trigger
 * component re-renders — only the WebGL frame loop reads it.
 */
export const sceneProgress = { value: 0 };

export const pointer = { x: 0, y: 0 };

if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });
}
