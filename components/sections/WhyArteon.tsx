import SectionLabel from "@/components/ui/SectionLabel";

const ITEMS = [
  {
    index: "01",
    title: "Mühendislik Odaklı Geliştirme",
    body: "Ürün geliştirme süreçleri, mühendislik disiplini ile anatomik hassasiyeti bir araya getirecek şekilde yürütülür.",
  },
  {
    index: "02",
    title: "Cerrahi Geri Bildirimle Ürün Geliştirme",
    body: "Cerrahların görüş ve önerileri, ürün geliştirme çalışmalarında dikkate alınan bir girdi olarak değerlendirilir.",
  },
  {
    index: "03",
    title: "Kalite ve Mevzuat Odaklı Süreçler",
    body: "Süreçler, uluslararası tıbbi cihaz standartlarına uyumluluk gözetilerek yönetilir.",
  },
  {
    index: "04",
    title: "Geniş Omurga Sistemleri Portföyü",
    body: "Stabilizasyon, interbody ve servikal alanları kapsayan bütüncül bir ürün ailesi sunulur.",
  },
];

export default function WhyArteon() {
  return (
    <section id="cozumler" className="relative bg-bg-primary py-28 md:py-36">
      <div className="max-w-content mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel>Neden Arteon</SectionLabel>
            <h2
              className="mt-5 font-heading text-3xl md:text-[2.6rem] text-text-primary"
              style={{ lineHeight: 1.08, letterSpacing: "-0.02em" }}
            >
              Cerrahi deneyim, ürün geliştirme sürecinin içinde.
            </h2>
            <p className="mt-6 text-text-secondary text-base leading-relaxed max-w-md">
              Arteon, ürün geliştirme çalışmalarında cerrahların görüş ve
              önerilerini dikkate alan bir yaklaşım benimsiyor. Klinik ihtiyaç
              ile mühendislik geliştirme sürecinin aynı doğrultuda ilerlemesi
              hedefleniyor.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
              {ITEMS.map((item) => (
                <div key={item.index}>
                  <span className="font-mono text-sm text-accent">{item.index}</span>
                  <h3 className="mt-3 font-heading text-lg text-text-primary leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-text-secondary text-sm leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
