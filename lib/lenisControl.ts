import type Lenis from "lenis";

/**
 * Shared reference to the single Lenis instance created by useLenis, so the
 * immersive 3D scene controller (SpineExperience) can stop/start normal page
 * scrolling while it owns wheel/touch input — without creating a second
 * Lenis instance or threading props through the component tree.
 */
export const lenisRef: { current: Lenis | null } = { current: null };
