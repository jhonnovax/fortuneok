import Image from "next/image";
import logo from "@/app/icon.png";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonSignin from "@/components/ButtonSignin";

export default function TopNavbar({ onAddAsset }) {

    const { data: session, status } = useSession();
    const ctaButton = session 
        ? <ButtonAccount onAddAsset={onAddAsset} /> 
        : <ButtonSignin extraStyle="btn-primary" />

    return (
      <nav className="fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-base-content/10 z-50">
        <div className="h-full pl-4 md:pl-8 pr-4 md:pr-8 lg:pr-4 flex items-center justify-between">

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
            {status === "loading" 
              ? (<div className="skeleton h-8 w-32 md:w-52"></div>) 
              : ctaButton
            }
          </div>
          
        </div>
      </nav>
    )
}