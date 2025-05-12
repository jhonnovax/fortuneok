import Image from "next/image";
import logo from "@/app/icon.png";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { handlePayment, PLAN_BASIC } from "@/services/paymentService";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonSignin from "@/components/ButtonSignin";
export default function TopNavbar() {

    const { data: session } = useSession();
    const ctaButton = session 
        ? <ButtonAccount /> 
        /* : <button className="btn btn-primary btn-sm" onClick={() => handlePayment(PLAN_BASIC)}>Get Started</button>;   */
        : <ButtonSignin extraStyle="btn-primary btn-sm" />

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
          </div>
        </div>
      </nav>
    )
}