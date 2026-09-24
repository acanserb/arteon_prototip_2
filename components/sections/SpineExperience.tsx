"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { sceneProgress } from "@/lib/scrollProgress";
import { renderedProgress, driveToScroll, setSceneImmediate } from "@/lib/motionProgress";
import { smoothstep } from "@/lib/math";

function computeOpacity(
  progress: number,
  [inStart, inEnd, outStart, outEnd]: [number, number, number, number]
) {
  const fadeIn = smoothstep(inStart, inEnd, progress);
  const fadeOut = smoothstep(outStart, outEnd, progress);
  return Math.max(0, fadeIn - fadeOut);
}

const TEXT_BLOCKS: Array<{
  id: string;
  range: [number, number, number, number];
  align: "left" | "center";
  content: React.ReactNode;
}> = [
  {
    id: "phase0",
    range: [0.02, 0.06, 0.11, 0.15],
    align: "left",
    content: (
      <>
        <p className="font-heading text-2xl md:text-3xl leading-snug">
          İnsan anatomisi.
          <br />
          Hassas mühendislik.
        </p>
      </>
    ),
  },
  {
    id: "phase1-labels",
    range: [0.17, 0.21, 0.27, 0.3],
    align: "left",
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
    id: "phase2",
    range: [0.32, 0.36, 0.42, 0.45],
    align: "left",
    content: (
      <p className="font-heading text-2xl md:text-3xl leading-snug max-w-md">
        Cerrahi çözüm anatomiyi anlamakla başlar.
      </p>
    ),
  },
  {
    id: "phase4-annotation",
    range: [0.61, 0.65, 0.7, 0.73],
    align: "center",
    content: (
      <span className="font-mono text-[11px] tracking-[0.32em] text-accent border border-accent/30 px-4 py-2">
        INTERBODY IMPLANT
      </span>
    ),
  },
  {
    id: "phase6",
    range: [0.86, 0.9, 0.97, 1.0],
    align: "left",
    content: (
      <p className="font-heading text-2xl md:text-3xl leading-snug">
        Hassasiyet. Stabilite. Teknoloji.
      </p>
    ),
  },
];

export default function SpineExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Annotations read the same damped/chapter-held value the 3D scene uses
    // (lib/motionProgress's renderedProgress) instead of the raw scrub —
    // driven off gsap's own ticker (which Lenis is already hooked into) so
    // there's a single frame clock, not a second independent rAF loop. This
    // also means reduced-motion users — who never get a ScrollTrigger below,
    // just a fixed sceneProgress — still see the right annotation for
    // wherever that settles, instead of everything staying invisible.
    const updateAnnotations = () => {
      const p = renderedProgress.value;
      for (const block of TEXT_BLOCKS) {
        const el = textRefs.current[block.id];
        if (el) el.style.opacity = String(computeOpacity(p, block.range));
      }
    };
    gsap.ticker.add(updateAnnotations);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        sceneProgress.value = 0.45;
        setSceneImmediate(2);
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=5000",
        scrub: 0.3,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Raw scrub value: feeds the continuous, independent particle
          // parallax (AtmosphereParticles reads this directly) and is the
          // signal scene-threshold detection watches — it no longer drives
          // any visual transform directly. See lib/motionProgress.ts.
          sceneProgress.value = self.progress;
          driveToScroll(self.progress);
        },
      });

      return () => trigger.kill();
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
            style={{ opacity: 0 }}
            className={`pointer-events-none absolute transition-opacity duration-100 ${
              block.align === "center"
                ? "left-1/2 top-[68%] -translate-x-1/2"
                : "left-6 md:left-16 top-[38%]"
            }`}
          >
            {block.content}
          </div>
        ))}
      </div>
    </section>
  );
}
