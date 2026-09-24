"use client";

import { useLenis } from "@/lib/useLenis";
import GlobalScene from "@/components/three/GlobalScene";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import SpineExperience from "@/components/sections/SpineExperience";

export default function Home() {
  useLenis();

  return (
    <>
      <GlobalScene />

      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <SpineExperience />

          <section className="relative min-h-[60vh] flex items-center justify-center px-6 text-center">
            <div className="max-w-lg">
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">
                [CLIENT DATA REQUIRED]
              </p>
              <p className="mt-4 text-text-secondary text-sm leading-relaxed">
                Ürün ekosistemi, teknoloji ve iletişim bölümleri bir sonraki
                geliştirme aşamasında eklenecektir.
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
