"use client";

import { useLenis } from "@/lib/useLenis";
import GlobalScene from "@/components/three/GlobalScene";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import SpineExperience from "@/components/sections/SpineExperience";
import SpineSystems from "@/components/sections/SpineSystems";
import ProductEcosystem from "@/components/sections/ProductEcosystem";
import WhyArteon from "@/components/sections/WhyArteon";
import Quality from "@/components/sections/Quality";
import CompanyBackground from "@/components/sections/CompanyBackground";
import ContactCTA from "@/components/sections/ContactCTA";

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
          <SpineSystems />
          <ProductEcosystem />
          <WhyArteon />
          <Quality />
          <CompanyBackground />
          <ContactCTA />
        </main>
      </div>
    </>
  );
}
