'use client';

import { useState } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import RightSidebar from "./RightSidebar";
import MobileSidebar from "./MobileSidebar";
import SidebarToggle from "./SidebarToggle";
import AssetsList from "./AssetsList";
import Image from "next/image";
import logo from "@/app/icon.png";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* Navbar */}
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
            <ButtonAccount />
            <SidebarToggle onClick={() => setIsSidebarOpen(true)} />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex pt-16 min-h-screen">
        <main className="flex-1 lg:mr-[420px] p-6">
          {children}
        </main>

        {/* Desktop sidebar */}
        <RightSidebar>
          <AssetsList />
        </RightSidebar>

        {/* Mobile sidebar */}
        <MobileSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
          <AssetsList />
        </MobileSidebar>
      </div>
    </div>
  );
} 