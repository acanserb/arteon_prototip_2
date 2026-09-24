"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Observer from "gsap/Observer";
import {
  getCurrentScene,
  goToScene,
  navState,
  setSceneImmediate,
  LAST_SCENE,
} from "@/lib/motionProgress";
import { lenisRef } from "@/lib/lenisControl";

/**
 * Text belongs to scene STATE now, not a numeric progress range — a block
 * is either fully visible (its scene is active) or fully hidden. CSS
 * (`transition-opacity`) handles the actual fade; nothing here depends on
 * scroll distance or speed.
 */
const TEXT_BLOCKS: Array<{
  id: string;
  scenes: number[];
  align: "left" | "center";
  topClass?: string;
  delayMs?: number;
  content: React.ReactNode;
}> = [
  {
    id: "scene1-intro",
    scenes: [1],
    align: "left",
    content: (
      <p className="font-heading text-2xl md:text-3xl leading-snug">
        İnsan anatomisi.
        <br />
        Hassas mühendislik.
      </p>
    ),
  },
  {
    id: "scene2-lumbar-eyebrow",
    scenes: [2],
    align: "left",
    topClass: "top-[32%]",
    content: (
      <span className="text-xs uppercase tracking-[0.28em] text-accent font-medium">
        Anatomik Odak
      </span>
    ),
  },
  {
    id: "scene2-lumbar-labels",
    scenes: [2],
    align: "left",
    topClass: "top-[37%]",
    content: (
      <div className="flex flex-col gap-2 font-mono text-xs tracking-[0.2em] text-accent">
        <span>L3</span>
        <span>L4</span>
        <span>L5</span>
        <span className="text-text-secondary">DISC</span>
        <span className="text-text-secondary">PEDICLE</span>
      </div>
    ),
  },
  {
    id: "scene3-narrative",
    scenes: [3],
    align: "left",
    content: (
      <p className="font-heading text-2xl md:text-3xl leading-snug max-w-md">
        Cerrahi çözüm anatomiyi anlamakla başlar.
      </p>
    ),
  },
  {
    id: "scene5-implant-annotation",
    scenes: [5],
    align: "center",
    content: (
      <span className="font-mono text-[11px] tracking-[0.32em] text-accent border border-accent/30 px-4 py-2">
        INTERBODY IMPLANT
      </span>
    ),
  },
  {
    id: "scene7-final-1",
    scenes: [7],
    align: "left",
    topClass: "top-[34%]",
    content: (
      <p className="font-heading text-3xl md:text-5xl leading-none text-text-primary">
        Hassasiyet.
      </p>
    ),
  },
  {
    id: "scene7-final-2",
    scenes: [7],
    align: "left",
    topClass: "top-[41%]",
    delayMs: 150,
    content: (
      <p className="font-heading text-3xl md:text-5xl leading-none text-text-primary">
        Stabilite.
      </p>
    ),
  },
  {
    id: "scene7-final-3",
    scenes: [7],
    align: "left",
    topClass: "top-[48%]",
    delayMs: 300,
    content: (
      <p className="font-heading text-3xl md:text-5xl leading-none text-accent">
        Teknoloji.
      </p>
    ),
  },
];

// Minimum wheel/touch/pointer delta before a gesture counts as intentional.
// Filters accidental noise only — kept low so a single ordinary wheel notch
// registers immediately; it must never require sustained/repeated scrolling
// before the first transition fires.
const WHEEL_TOLERANCE = 20;

export default function SpineExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Observer);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Driven off gsap's own ticker (which Lenis is already hooked into) so
    // there's a single frame clock, not a second independent rAF loop.
    const updateAnnotations = () => {
      const scene = getCurrentScene();
      for (const block of TEXT_BLOCKS) {
        const el = textRefs.current[block.id];
        if (el) el.style.opacity = block.scenes.includes(scene) ? "1" : "0";
      }
    };
    gsap.ticker.add(updateAnnotations);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        setSceneImmediate(3);
        return;
      }

      const section = sectionRef.current;
      if (!section) return;

      // Wheel/touch/pointer intent, intercepted only while the immersive
      // sequence owns input (enabled/disabled below) — created once,
      // toggled, never recreated, so listeners aren't churned per scene.
      // onDown/onUp fire directly off each qualifying wheel/touch delta —
      // no onStop, no accumulated-delta buffer, no debounce/setTimeout
      // anywhere in this path, so a gesture is recognized the moment it
      // crosses `tolerance`, not after scrolling stops.
      const observer = Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        tolerance: WHEEL_TOLERANCE,
        preventDefault: true,
        onDown: () => handleGesture(1),
        onUp: () => handleGesture(-1),
      });
      observer.disable();

      let trigger: ScrollTrigger | undefined;

      function activate() {
        lenisRef.current?.stop();
        observer.enable();
      }

      function deactivate() {
        observer.disable();
        lenisRef.current?.start();
      }

      function exitDown() {
        deactivate();
        const target = (trigger?.end ?? 0) + 2;
        lenisRef.current?.scrollTo(target, { duration: 0.9 });
      }

      function exitUp() {
        deactivate();
        const target = Math.max(0, (trigger?.start ?? 0) - 2);
        lenisRef.current?.scrollTo(target, { duration: 0.9 });
      }

      function handleGesture(direction: 1 | -1) {
        // Mid-transition or still in the short post-transition input
        // cooldown: swallow the gesture entirely. This — not any delay
        // before starting — is what makes wheel inertia unable to queue
        // multiple scene changes from one physical gesture.
        if (navState.isAnimating || !navState.canNavigate) return;

        const current = getCurrentScene();
        if (direction === 1) {
          if (current >= LAST_SCENE) {
            exitDown();
            return;
          }
          goToScene(current + 1);
        } else {
          if (current <= 0) {
            exitUp();
            return;
          }
          goToScene(current - 1);
        }
      }

      // ScrollTrigger here ONLY detects the section entering/leaving the
      // viewport and pins it for one viewport-height of scroll distance —
      // it never scrubs or accumulates storytelling progress. `pinSpacing`
      // reserves exactly that one viewport height in the document, not the
      // old 9000px scroll buffer.
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => "+=" + window.innerHeight,
        pin: true,
        anticipatePin: 1,
        onEnter: () => {
          setSceneImmediate(0);
          activate();
        },
        onEnterBack: () => {
          setSceneImmediate(LAST_SCENE);
          activate();
        },
        onLeave: () => deactivate(),
        onLeaveBack: () => deactivate(),
      });

      return () => {
        observer.kill();
        trigger?.kill();
        lenisRef.current?.start();
      };
    }, sectionRef);

    return () => {
      gsap.ticker.remove(updateAnnotations);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="spine-experience"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <div className="relative h-full w-full max-w-content mx-auto px-6 md:px-16">
        {TEXT_BLOCKS.map((block) => (
          <div
            key={block.id}
            ref={(el) => {
              textRefs.current[block.id] = el;
            }}
            style={{
              opacity: 0,
              transitionDelay: block.delayMs ? `${block.delayMs}ms` : undefined,
            }}
            className={`pointer-events-none absolute transition-opacity duration-500 ${
              block.align === "center"
                ? "left-1/2 top-[68%] -translate-x-1/2"
                : `left-6 md:left-16 ${block.topClass ?? "top-[38%]"}`
            }`}
          >
            {block.content}
          </div>
        ))}
      </div>
    </section>
  );
}
