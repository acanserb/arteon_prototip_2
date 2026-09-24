import SectionLabel from "@/components/ui/SectionLabel";

export default function CompanyBackground() {
  return (
    <section id="hakkimizda" className="relative bg-bg-primary py-28 md:py-36">
      <div className="max-w-content mx-auto px-6 md:px-16">
        <div className="max-w-2xl">
          <SectionLabel>Arteon Sağlık Sistemleri</SectionLabel>
          <h2
            className="mt-5 font-heading text-3xl md:text-[2.6rem] text-text-primary"
            style={{ lineHeight: 1.08, letterSpacing: "-0.02em" }}
          >
            Deneyimden üretime.
            <br />
            Mühendislikten çözüme.
          </h2>
          <p className="mt-6 text-text-secondary text-base md:text-lg leading-relaxed">
            Arteon, sağlık sektöründeki uzun yıllara dayanan deneyimini 2017
            yılında medikal cihaz üretimine taşıdı. Ürün geliştirme
            süreçlerinde klinik ihtiyaçları, mühendislik yaklaşımını ve
            sürekli iyileştirme anlayışını bir araya getiriyor.
          </p>
        </div>
      </div>
    </section>
  );
}
