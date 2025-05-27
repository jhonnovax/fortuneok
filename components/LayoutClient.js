"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
// All the client wrappers are here (they can't be in server components)
// 1. SessionProvider: Allow the useSession from next-auth (find out if user is auth or not)
// 2. Toaster: Show Success/Error messages anywhere from the app with toast()
const ClientLayout = ({ children }) => {
  const pathname = usePathname();

  // Add scroll restoration
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <SessionProvider>
      <PreferencesProvider>
        <ThemeProvider>

          {/* Content inside app/page.js files  */}
          {children}

          {/* Show Success/Error messages anywhere from the app with toast() */}
          <Toaster
            toastOptions={{
              duration: 3000,
            }}
          />
          
        </ThemeProvider>
      </PreferencesProvider>
    </SessionProvider>
  );
};

export default ClientLayout;
