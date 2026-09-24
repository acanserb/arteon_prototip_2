import Button from "@/components/ui/Button";

export default function ContactCTA() {
  return (
    <section id="iletisim" className="relative bg-bg-secondary py-28 md:py-40">
      <div className="max-w-content mx-auto px-6 md:px-16 text-center">
        <h2
          className="font-heading text-3xl md:text-5xl text-text-primary max-w-2xl mx-auto"
          style={{ lineHeight: 1.08, letterSpacing: "-0.02em" }}
        >
          Bir sonraki cerrahi çözüm
          <br />
          birlikte şekillenir.
        </h2>
        <p className="mt-6 text-text-secondary text-base md:text-lg max-w-lg mx-auto leading-relaxed">
          Arteon ürünleri, teknik dokümantasyon ve iş birliği olanakları
          hakkında bilgi alın.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" href="#urunler">
            Ürünleri İncele
          </Button>
          <Button variant="secondary">İletişime Geç</Button>
        </div>
      </div>

      <div className="mt-24 max-w-content mx-auto px-6 md:px-16">
        <div className="divider-line" />
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary/60">
          <span>ARTEON SAĞLIK SİSTEMLERİ</span>
          <span>© {new Date().getFullYear()} Tüm hakları saklıdır.</span>
        </div>
      </div>
    </section>
  );
}
