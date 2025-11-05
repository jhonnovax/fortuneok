"use client";

import { useState } from "react";
import config from "@/config";
import Link from "next/link";
import ButtonCheckout from "./ButtonCheckout";
// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = ({ className = "", showHeader = true, isFreeTrialAvailable = true }) => {
  const [planSelected, setPlanSelected] = useState(config.stripe.plans[0]);

  function getPriceDecimals(value) {
    const rounded = Math.round(value * 100) / 100;
    const decimals = String(rounded).split('.')[1]?.padEnd(2, '0') || '00';

    return decimals;
  }

  return (
    <section className={`bg-base-200 overflow-hidden ${className}`} id="pricing">
      <div className={`${showHeader ? "py-16 md:py-24" : "py-0"} px-8 max-w-5xl mx-auto flex flex-col gap-12`}>
        
        {showHeader && (
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight text-center">
            Stay Organized and Grow Confidently
          </h2>
        )}

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-6">

          <div className="rounded-[1.3rem] border border-base-content/5 bg-neutral/5 p-1.5 dark:bg-neutral/50 max-w-xl">
            <div className="relative w-full max-w-lg">

              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-4 sm:p-8 rounded-xl">
                <div className="flex justify-between items-center gap-4 sr-only">
                  <div>
                    <p className="text-lg lg:text-xl font-bold">{planSelected.name}</p>
                    {planSelected.description && (
                      <p className="text-base-content/80 mt-2">
                        {planSelected.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="-m-1 grid grid-cols-2 rounded-xl bg-neutral/5 p-1 shadow-inner dark:bg-neutral/50 relative">
                  
                  {/* Plan selection */}
                  <aside className="absolute -top-6 md:-top-2 right-0 flex -translate-y-full animate-pulse items-center gap-2 text-green-700 dark:text-primary">
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
                    <Link href="/dashboard" className="text-green-700 dark:text-primary text-sm">2 months free</Link>
                  </aside>
                  
                  {config.stripe.plans.map((plan) => (
                    <a key={plan.priceId} role="relative tab" className={`flex select-none items-center justify-center gap-2 truncate rounded-lg py-2 font-medium ${plan.priceId === planSelected.priceId ? "bg-base-100 shadow" : "cursor-pointer"}`} onClick={() => setPlanSelected(plan)}>
                      {plan.name} 
                    </a>
                  ))}
                </div>

                {/* Plan price */}
                <div className="flex gap-2">
                  <p className={`text-5xl tracking-tight font-extrabold`}>
                    ${planSelected.name === "Monthly" ? planSelected.price : Math.round(planSelected.price / 12)}
                    {planSelected.name === "Yearly" && <span className="ml-0.5 align-top text-xl font-bold">.{getPriceDecimals((planSelected.price) / 12)}</span>}
                  </p>
                  <div className="mb-[4px] flex flex-col justify-end ">
                    <p className="text-sm font-semibold">
                      <span className="mr-1">/month</span>
                      {planSelected.name === "Yearly" && <span className="font-semibold">billed as ${planSelected.price} per year</span>}
                    </p>
                  </div>
                </div>
                
                {/* Plan features */}
                <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                  {planSelected.features.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-2 ${feature.isFeatured ? "text-green-700 dark:text-primary" : ""}`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-[18px] h-[18px] opacity-80 shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <span>{feature.name} </span>
                    </li>
                  ))}
                </ul>

                {/* If the user is logged in, show the button to start the subscription */}
                <div className="space-y-2">
                  {
                    isFreeTrialAvailable 
                      ? <Link href="/api/auth/signin" className="btn btn-primary btn-block">Start 14 days free trial</Link>
                      : <ButtonCheckout priceId={planSelected.priceId} mode="subscription" />
                  }
                  <p className="text-base-secondary mt-1 text-center text-sm">
                    No credit card required.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;