"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ScrollTop from "@/components/ScrollTop";

const LayoutClientPublic = ({ children }) => {
  const pathname = usePathname();

  // Add scroll restoration
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <>
      {/* Content inside app/page.js files  */}
      {children}

      {/* Scroll to top button */}
      <ScrollTop />
    </>
  );
};

export default LayoutClientPublic;
