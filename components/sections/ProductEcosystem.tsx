import SectionLabel from "@/components/ui/SectionLabel";

interface Group {
  label: string;
  items: string[];
}

// Real Arteon product categories, grouped by clinical approach for
// presentation only — this grouping is ours, the category names are theirs.
const GROUPS: Group[] = [
  {
    label: "Stabilizasyon",
    items: ["Lomber Stabilizasyon", "Çubuklar", "Minimal İnvaziv Sistem"],
  },
  {
    label: "Interbody / Rekonstrüksiyon",
    items: ["Kafesler", "Korpektomi"],
  },
  {
    label: "Servikal / Hareketli Sistemler",
    items: ["Servikal Sistemler", "Hareketli Sistemler", "Faset İmplantı"],
  },
];

export default function ProductEcosystem() {
  return (
    <section id="urunler" className="relative bg-bg-secondary py-28 md:py-36">
      <div className="max-w-content mx-auto px-6 md:px-16">
        <div className="max-w-2xl">
          <SectionLabel>Ürün Ekosistemi</SectionLabel>
          <h2
            className="mt-5 font-heading text-4xl md:text-6xl text-text-primary"
            style={{ lineHeight: 0.98, letterSpacing: "-0.025em" }}
          >
            OMURGA
            <br />
            SİSTEMLERİ
          </h2>
          <p className="mt-6 text-text-secondary text-base md:text-lg leading-relaxed">
            Farklı cerrahi yaklaşımlar için geliştirilen bütüncül ürün
            ekosistemi.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
          {GROUPS.map((group) => (
            <div key={group.label} className="bg-bg-secondary p-8 md:p-10">
              <span className="text-xs uppercase tracking-[0.24em] text-accent font-medium">
                {group.label}
              </span>
              <ul className="mt-6 flex flex-col gap-4">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="text-text-primary text-lg font-heading border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
