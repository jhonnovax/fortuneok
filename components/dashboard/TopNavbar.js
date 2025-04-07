import Image from "next/image";
import logo from "@/app/icon.png";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { handlePayment, PLAN_BASIC } from "@/services/paymentService";
import ButtonAccount from "@/components/ButtonAccount";

export default function TopNavbar({ onToggleSidebar }) {

    const { data: session } = useSession();
    const ctaButton = session 
        ? <ButtonAccount /> 
        : <button className="btn btn-primary btn-sm" onClick={() => handlePayment(PLAN_BASIC)}>Get Started</button>;  

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-base-content/10 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="FortuneOK logo"
              className="w-8"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-lg">FortuneOK</span>
          </Link>
          <div className="flex items-center gap-2">
            {ctaButton}
            <button
              onClick={onToggleSidebar}
              className="btn btn-ghost btn-circle lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    )
}