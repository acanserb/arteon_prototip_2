"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { lenisRef } from "./lenisControl";

let registered = false;

export function useLenis() {
  useEffect(() => {
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0.4 : 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);
    lenisRef.current = lenis;

    // Stable reference so cleanup actually removes this listener — passing
    // a fresh arrow function to gsap.ticker.remove() (as this used to) never
    // matches the one add() registered, silently leaking the ticker callback
    // across StrictMode's mount/unmount/mount and any HMR reload.
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      lenisRef.current = null;
    };
  }, []);
}
