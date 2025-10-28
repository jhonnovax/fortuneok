import { useEffect, useState } from "react";

export default function ScrollTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 200);
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
        onClick={scrollToTop}
        className={`fixed bottom-3 right-3 md:bottom-6 md:right-6 flex items-center justify-center btn btn-circle btn-primary btn-md shadow-lg tooltip tooltip-left transition-opacity duration-300 ${
        showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        title="Scroll to top"
    >
      <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}