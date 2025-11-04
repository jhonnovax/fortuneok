import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import Pricing from "@/components/Pricing";
import HeaderDashboard from "@/components/HeaderDashboard";
import Link from "next/link";

export const metadata = getSEOTags({
  title: `Billing | ${config.appName}`,
  robots: {
    index: false,
    follow: false,
  },
});

export default function BillingPage() {
  
  return (
    <>
      {/* Header */}
      <HeaderDashboard />

      {/* Main content */}
      <main className="flex-1 pt-16 mx-auto max-w-3xl">
        <section className="space-y-2 mb-5 py-4">
          <Link href="/dashboard" className="btn btn-tertiary btn-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l1.22 1.22a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd"></path>
            </svg>
            Back
          </Link>
          <h1 className="font-bold text-3xl lg:text-5xl">Billing</h1>
        </section>
        <Pricing className="bg-transparent" showHeader={false} />
      </main>
    </>
  );
}
