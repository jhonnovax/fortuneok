import { useState, useEffect } from "react";
import { getBreakpoint, BREAKPOINTS } from "@/services/breakpointService";

export function useTailwindBreakpoint() {

  const [breakpoint, setBreakpoint] = useState(() =>
    typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "xs"
  );

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { breakpoint, breakpointInPixels: BREAKPOINTS[breakpoint.toUpperCase()] };

}
