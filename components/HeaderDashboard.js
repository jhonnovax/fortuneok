"use client";

import Image from "next/image";
import logo from "@/app/icon.png";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import config from "@/config";

// Dynamic imports for auth components to reduce initial bundle size
const ButtonAccount = dynamic(() => import("@/components/ButtonAccount"), {
  ssr: false,
  loading: () => <div className="skeleton h-8 w-32 md:w-52"></div>
});

const ButtonSignin = dynamic(() => import("@/components/ButtonSignin"), {
  ssr: false,
  loading: () => <div className="skeleton h-8 w-32 md:w-52"></div>
});

export default function HeaderDashboard({ onAddAsset }) {

    const { data: session, status } = useSession();
    const ctaButton = session 
        ? <ButtonAccount onAddAsset={onAddAsset} /> 
        : <ButtonSignin text="Log in" extraStyle="btn-primary" />

    return (
      <nav className="fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-base-content/10 z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">

          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Image
              src={logo}
              alt={session ? `${config.appName} dashboard` : `${config.appName} homepage`}
              className="w-8"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-lg">FortuneOK</span>
          </Link>

          <div className="flex items-center gap-2">
            {status === "loading" 
              ? (<div className="skeleton h-8 w-32 md:w-52"></div>) 
              : ctaButton
            }
          </div>
          
        </div>
      </nav>
    )
}