import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getSEOTags, renderSchemaTags } from "@/libs/seo";
import config from "@/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import ScrollTop from "@/components/ScrollTop";

export const metadata = getSEOTags({
  title: `${config.appName} | ${config.appShortDescription}`,
  keywords: "investment tracker, portfolio tracker, personal finance app, wealth management, asset allocation, financial dashboard",
  canonicalUrlRelative: "/",
});

export default async function Home() {

  const session = await getServerSession(authOptions);

  // If user already logged in, redirect to auth callback url
  if (session) {
    redirect(config.auth.callbackUrl);
  }

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main role="main">
        <Hero />
        <Problem />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
      <ScrollTop />
      {renderSchemaTags()}
    </>
  );
}