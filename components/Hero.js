import TestimonialsAvatars from "./TestimonialsAvatars";
import Link from "next/link";
import config from "@/config";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 px-8 py-16 lg:py-24 text-center">
      <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-6 md:mb-8">
        {config.appShortDescription}
      </h1>

      <div className="text-lg leading-relaxed mb-6 md:mb-8">
        <p>{config.appDescription}</p>
        <div className="mx-auto max-w-sm text-left pt-4">
          {/* <button className="btn btn-primary btn-wide">
            Get {config.appName}
          </button> */}
          <Link href="/#pricing" className="btn btn-primary btn-block">
            Start Now
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
      </div>

      <div className="w-full flex justify-center">
        <Image 
          src="/demo.png" 
          alt="FortuneOK Demo" 
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 700px"
          priority
          width={1000}
          height={1000}
        />
      </div>

      <TestimonialsAvatars priority={true} />
    </section>
  );
};

export default Hero;