"use client";

import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";
import Callout from "@/components/ui/Callout";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-start overflow-hidden pt-[24vh]">
      {/* faint technical graphics — arcs/dots dissolving into the atmosphere, never a foreground graphic */}
      <svg
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-[55%] lg:block"
        style={{ opacity: 0.04 }}
        viewBox="0 0 700 1000"
        fill="none"
      >
        <circle cx="560" cy="260" r="220" stroke="#19c5f4" strokeWidth="1" />
        <circle cx="560" cy="640" r="310" stroke="#19c5f4" strokeWidth="1" />
        <path d="M120 80 L120 40 L160 40" stroke="#19c5f4" strokeWidth="1" />
        <path d="M580 920 L620 920 L620 960" stroke="#19c5f4" strokeWidth="1" />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={200 + ((i * 37) % 480)} cy={60 + i * 68} r="1.4" fill="#19c5f4" />
        ))}
      </svg>

      <div className="max-w-content mx-auto w-full pl-[4.5vw] pr-6 md:pr-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
          <SectionLabel>Daha Sağlıklı Hareketli Yarınlar İçin</SectionLabel>

          <h1
            className="mt-6 text-[3.1rem] sm:text-[3.8rem] xl:text-[4.7rem] 2xl:text-[4.9rem] font-heading text-text-primary"
            style={{ fontWeight: 660, lineHeight: 0.94, letterSpacing: "-0.035em" }}
          >
            OMURGA
            <br />
            CERRAHİSİNDE
            <br />
            YENİ NESİL
            <br />
            <span className="text-accent">TEKNOLOJİLER</span>
          </h1>

          <p className="mt-7 max-w-[480px] text-text-secondary text-base leading-relaxed font-body">
            Arteon Sağlık Sistemleri, omurga cerrahisine yönelik ileri
            teknoloji implant sistemleri ve cerrahi çözümler geliştirir —
            anatomik hassasiyet ile mühendislik disiplinini bir araya
            getirerek.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="primary" href="#urunler">
              Çözümleri Keşfet
            </Button>
            <Button variant="secondary" href="#spine-experience">
              Teknolojiyi İzle
            </Button>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-6" aria-hidden />
      </div>

      {/* a single restrained technical callout — the reference stays calm, the spine is the focal point */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <Callout label="Teknoloji" direction="left" className="absolute left-[57%] top-[54%]" />
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-text-secondary">
        <span className="text-[10px] uppercase tracking-[0.34em]">Keşfet</span>
        <span className="relative block h-9 w-px bg-white/15">
          <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-accent" />
        </span>
      </div>
    </section>
  );
}
