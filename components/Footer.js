import Link from "next/link";
import { handlePayment, PLAN_BASIC } from "@/services/paymentService";

// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.resend.supportEmail, the link won't be displayed.

const Footer = () => {
  return (
    <footer className="bg-base-200 border-t border-base-content/10 max-w-7xl mx-auto pt-8">

      <div className="mx-auto text-center">
        <p className="flex flex-col gap-2 md:gap-4 md:flex-row justify-center items-center text-sm text-base-content/80">
          <Link href="/privacy-policy" className="link link-hover">
            🔒 Privacy policy
          </Link>
          <Link href="/tos" className="link link-hover">
            📜 Terms of services
          </Link>
          <Link href="#" className="link link-hover order-first md:order-none" onClick={() => handlePayment(PLAN_BASIC)}>
            ❤️ Create my portfolio
          </Link>
        </p>

        <p className="mt-3 text-sm text-base-content/80">
          Copyright © {new Date().getFullYear()} - All rights reserved
        </p>

      </div>
      
    </footer>
  );

};

export default Footer;