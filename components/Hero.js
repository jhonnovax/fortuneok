import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import ButtonLead from "@/components/ButtonLead";
import config from "@/config";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-12 items-center justify-center text-center lg:text-left lg:items-start]">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          Grow and Simplify your investments
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          {config.appDescription}
        </p>
        <div className="w-full flex justify-center">
          <video className="w-full max-w-3xl rounded-lg shadow-lg" controls>
            <source src="/teaser-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        {/* <button className="btn btn-primary btn-wide">
          Get {config.appName}
        </button> */}
        {/* <ButtonLead /> */}

        {/* <TestimonialsAvatars priority={true} /> */}
      </div>
    </section>
  );
};

export default Hero;
