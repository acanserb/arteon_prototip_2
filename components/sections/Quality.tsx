import SectionLabel from "@/components/ui/SectionLabel";

const POLICY_BLOCKS = [
  {
    title: "ISO 13485",
    body: "Kalite yönetim yaklaşımı",
  },
  {
    title: "MDR 2017/745",
    body: "Mevzuat uyumluluğu odağı",
  },
  {
    title: "Sürekli İyileştirme",
    body: "Ürün ve süreç geliştirme",
  },
  {
    title: "Risk Yönetimi",
    body: "Süreç boyunca sistematik değerlendirme",
  },
];

export default function Quality() {
  return (
    <section id="kalite" className="relative bg-bg-elevated py-28 md:py-36">
      <div className="max-w-content mx-auto px-6 md:px-16">
        <div className="max-w-2xl">
          <SectionLabel>Kalite ve Uyumluluk</SectionLabel>
          <h2
            className="mt-5 font-heading text-3xl md:text-[2.6rem] text-text-primary"
            style={{ lineHeight: 1.08, letterSpacing: "-0.02em" }}
          >
            Kalite, sürecin son adımı değil.
            <br />
            Sistemin kendisi.
          </h2>
          <p className="mt-6 text-text-secondary text-base leading-relaxed">
            Arteon&apos;un kalite politikası; ISO 13485 ve MDR 2017/745 gibi
            uluslararası çerçevelere uyumluluğu, sürekli iyileştirme
            felsefesini ve sistematik risk değerlendirmesini esas alır.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {POLICY_BLOCKS.map((block) => (
            <div key={block.title} className="border-t border-white/10 pt-5">
              <h3 className="font-heading text-lg text-text-primary">{block.title}</h3>
              <p className="mt-2 text-text-secondary text-sm leading-relaxed">{block.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
