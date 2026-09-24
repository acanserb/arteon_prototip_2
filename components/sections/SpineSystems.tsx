import SectionLabel from "@/components/ui/SectionLabel";

const MATERIALS = ["Titanyum", "PEEK", "Poliaksiyel Vida Tasarımı"];

export default function SpineSystems() {
  return (
    <section id="omurga-sistemleri" className="relative bg-bg-primary py-28 md:py-36">
      <div className="max-w-content mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel>Mühendislik</SectionLabel>
            <h2
              className="mt-5 font-heading text-3xl md:text-[2.6rem] text-text-primary"
              style={{ lineHeight: 1.08, letterSpacing: "-0.02em" }}
            >
              Cerrahi yaklaşımın her aşaması için uyumlu sistemler.
            </h2>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center">
            <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-xl">
              Arteon&apos;un omurga ürün portföyü; stabilizasyon, interbody
              çözümleri ve farklı cerrahi yaklaşımları destekleyen implant
              sistemlerinden oluşur. Ürün ailesi, pedikül vidaları, çubuklar,
              kafes sistemleri ve ilgili fiksasyon bileşenlerini kapsar.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {MATERIALS.map((m) => (
                <span
                  key={m}
                  className="text-xs uppercase tracking-[0.18em] text-text-secondary border border-white/10 rounded-full px-4 py-2"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
