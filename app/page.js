import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `FortuneOK | ${config.appShortDescription}`,
  keywords: "investment portfolio tracker, asset management, finance app, portfolio analytics, investment management software",
  canonicalUrlRelative: "/",
});

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": config.appName,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "description": config.appDescription,
    "url": `https://${config.domainName}`,
    "image": `https://${config.domainName}/opengraph-image.png`,
    "creator": {
      "@type": "Organization",
      "name": config.appName,
    },
  };

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        <Pricing />
        <FAQ />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Footer />
    </>
  );
}