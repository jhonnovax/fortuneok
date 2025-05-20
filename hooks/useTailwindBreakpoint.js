import { useState, useEffect } from "react";
import { getBreakpoint } from "@/services/breakpointService";

export function useTailwindBreakpoint() {

  const [breakpoint, setBreakpoint] = useState(() => typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "xs");
  const [breakpointInPixels, setBreakpointInPixels] = useState(() => typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
      setBreakpointInPixels(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { breakpoint, breakpointInPixels };

}
