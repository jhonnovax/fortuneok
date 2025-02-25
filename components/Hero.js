import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import ButtonLead from "@/components/ButtonLead";
import Link from "next/link";
import config from "@/config";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col items-center justify-center gap-8 lg:gap-10 px-8 py-8 lg:py-20">
      <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
        Grow and Simplify your investments
      </h1>
      <p className="text-lg opacity-80 leading-relaxed">
        {config.appDescription}
      </p>
      <div className="mx-auto max-w-sm text-left">
        {/* <button className="btn btn-primary btn-wide">
          Get {config.appName}
        </button> */}
        <Link href="/#pricing" className="btn btn-primary btn-block">
          Start Growing Your Money
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-7 h-7"
          >
            <path
              fillRule="evenodd"
              d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
      <div className="w-full flex justify-center">
        <video className="w-full max-w-3xl rounded-lg shadow-lg" controls>
          <source src="/teaser-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* <TestimonialsAvatars priority={true} /> */}
    </section>
  );
};

export default Hero;
