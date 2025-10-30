"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
    </>
  );
};

export default LayoutClientPublic;
