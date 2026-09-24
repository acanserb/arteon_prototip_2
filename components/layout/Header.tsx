"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Ürünler", href: "#urunler" },
  { label: "Teknolojiler", href: "#teknolojiler" },
  { label: "Çözümler", href: "#cozumler" },
  { label: "Hakkımızda", href: "#hakkimizda" },
  { label: "İletişim", href: "#iletisim" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-bg-primary/70 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-content mx-auto flex items-center justify-between px-6 md:px-16 h-20">
        <a href="#" className="font-heading text-lg tracking-[0.02em]">
          ARTEON
          <span className="text-accent">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative text-sm text-text-secondary/60 hover:text-text-primary transition-colors duration-300 group"
            >
              {item.label}
              <span className="absolute left-0 -bottom-1 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <a
          href="#urunler"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium border border-white/20 px-5 py-2.5 hover:border-accent/60 hover:text-accent transition-colors duration-300"
        >
          Ürünleri Keşfet
        </a>
      </div>
    </header>
  );
}
