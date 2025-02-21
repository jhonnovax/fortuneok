import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import Script from 'next/script';

export const metadata = getSEOTags({
  title: "FortuneOK | Grow and Simplify your investments",
  canonicalUrlRelative: "/tos",
});

export default function Home() {
  return (
    <>
      <Script 
        defer
        data-website-id="67b4e06b026712ec6b42da7e"
        data-domain="fortuneok.com"
        src="/js/script.js"
      />
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        {/* <FeaturesAccordion /> */}
        <Pricing />
        <FAQ />
        {/* <CTA /> */}
      </main>
      <Footer />
    </>
  );
}