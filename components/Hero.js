import TestimonialsAvatars from "./TestimonialsAvatars";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";

const Hero = () => {
  return (
    <section aria-labelledby="hero-title" className="max-w-7xl mx-auto bg-base-100 px-8 py-8 md:py-16 text-center relative">

      <h1 id="hero-title" className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-6 md:mb-8">
        Track Your Investments with {config.appName}
      </h1>

      <p className="sr-only">
        FortuneOK is an investment tracking tool designed to help you monitor and optimize your financial portfolio in real time.
      </p>

      <p className="text-lg max-w-2xl mx-auto mb-8">
        Discover when your investments are profitable and make smarter financial decisions.
      </p>

      <div className="mx-auto max-w-sm">
        <Link href="/api/auth/signin" className="btn btn-primary btn-block">Start 14 days free trial</Link>
      </div>

      <div className="w-full flex justify-center relative mt-12 md:mt-6">

        <aside className="absolute -top-3 md:-top-4 right-4 flex -translate-y-full animate-pulse items-center gap-2">
          <svg className="fill-base-secondary mt-2 w-8 -rotate-[24deg] opacity-60" viewBox="0 0 219 41" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_3_248)">
              <path d="M21.489 29.4305C36.9333 31.3498 51.3198 33.0559 65.7063 34.9753C66.7641 35.1885 67.6104 36.4681 69.9376 38.3875C63.1675 39.2406 57.8783 40.3069 52.5892 40.5201C38.6259 40.9467 24.8741 40.9467 10.9107 40.9467C9.21821 40.9467 7.5257 41.1599 5.83317 40.7334C0.332466 39.6671 -1.57164 36.0416 1.39028 31.1365C2.87124 28.7906 4.56377 26.658 6.46786 24.7386C13.6611 17.4876 21.0659 10.4499 28.4707 3.41224C29.7401 2.13265 31.6442 1.49285 34.183 0C34.6061 10.8765 23.8162 13.8622 21.489 22.3927C23.3931 21.9662 25.0856 21.7529 26.5666 21.3264C83.6894 5.54486 140.601 7.25099 197.3 22.606C203.224 24.0988 208.936 26.4447 214.649 28.5773C217.61 29.6437 220.149 31.9896 218.457 35.6151C216.976 39.2406 214.014 39.2406 210.629 37.7477C172.759 20.6866 132.561 18.7672 91.9404 19.407C70.7838 19.6203 50.0504 21.9662 29.5285 26.8713C26.9897 27.5111 24.4509 28.3641 21.489 29.4305Z">
              </path>
            </g>
            <defs>
              <clipPath id="clip0_3_248">
                <rect width="219" height="41"></rect>
              </clipPath>
            </defs>
          </svg>
          <Link href="/demo" className="text-base-secondary text-sm">Try our interactive demo</Link>
        </aside>

        <Image
          src="/demo.png"
          alt="FortuneOK dashboard demo showing portfolio performance charts and asset allocation"
          className="object-contain w-full h-full"
          priority
          width={700}
          height={400}
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>

      <TestimonialsAvatars priority={true} />
    </section>
  );
};

export default Hero;