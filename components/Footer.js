"use client";

import Link from "next/link";
import ButtonSupport from "@/components/ButtonSupport";

// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.resend.supportEmail, the link won't be displayed.

const Footer = () => {
  return (
    <footer className="bg-base-200 md:text-lg" role="contentinfo">
      <div className="max-w-7xl mx-auto px-8 py-16 md:py-24 text-center">

        <nav aria-label="Footer links" role="navigation" className="flex flex-col gap-2 md:gap-4 md:flex-row justify-center items-center text-base-content/80">
          <Link href="/privacy-policy" className="link link-hover">
            🔒 Privacy policy
          </Link>
          <Link href="/tos" className="link link-hover">
            📜 Terms of services
          </Link>
          <ButtonSupport />
        </nav>

        <p className="mt-3 text-base-content/80">
          Copyright © {new Date().getFullYear()} - All rights reserved
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;