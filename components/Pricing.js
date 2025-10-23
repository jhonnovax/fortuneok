"use client";

import { useState } from "react";
import config from "@/config";
import ButtonSignin from "./ButtonSignin";
// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = () => {
  const [subscriptionType, setSubscriptionType] = useState("monthly");

  function getPriceDecimals(value) {
    const rounded = Math.round(value * 100) / 100;
    const decimals = String(rounded).split('.')[1]?.padEnd(2, '0') || '00';

    return decimals;
  }

  return (
    <section className="bg-base-200 overflow-hidden" id="pricing">
      <div className="py-16 md:py-24 px-8 max-w-5xl mx-auto">
        <div className="flex flex-col text-center w-full mb-6 md:mb-8">
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight">
            Grow and Invest Smarter today!
          </h2>
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-6">

          {config.stripe.plans.map((plan) => (
            <div key={plan.priceId} className="rounded-[1.3rem] border border-base-content/5 bg-neutral/5 p-1.5 dark:bg-neutral/50 max-w-xl">
              <div className="relative w-full max-w-lg">

                {plan.isFeatured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <span
                      className={`badge text-xs text-primary-content font-semibold border-0 bg-primary`}
                    >
                      POPULAR
                    </span>
                  </div>
                )}

                {plan.isFeatured && (
                  <div
                    className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                  ></div>
                )}

                <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-xl">
                  <div className="flex justify-between items-center gap-4 sr-only">
                    <div>
                      <p className="text-lg lg:text-xl font-bold">{plan.name}</p>
                      {plan.description && (
                        <p className="text-base-content/80 mt-2">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="-m-1 grid grid-cols-2 rounded-xl bg-neutral/5 p-1 shadow-inner dark:bg-neutral/50">
                    <a role="relative tab" className={`flex select-none items-center justify-center gap-2 truncate rounded-lg py-2 text-sm font-medium ${subscriptionType === "monthly" ? "bg-base-100 shadow" : "cursor-pointer"}`} onClick={() => setSubscriptionType("monthly")}>
                      Monthly 
                    </a>
                    <a role="relative tab" className={`flex select-none items-center justify-center gap-2 truncate rounded-lg py-2 text-sm font-medium ${subscriptionType === "yearly" ? "bg-base-100 shadow" : "cursor-pointer"}`} onClick={() => setSubscriptionType("yearly")}>
                        Yearly 
                        <span className="inline-flex rounded bg-base-100">
                          <span className="inline-flex items-center whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[0.7rem] text-xs font-medium text-primary-content ring-1 ring-inset ring-primary/15">
                            2 months free
                          </span>
                        </span>
                      </a>
                  </div>

                  <div className="flex gap-2">
                   {/*  {plan.priceAnchor && (
                      <div className="flex flex-col justify-end mb-[4px] text-lg ">
                        <p className="relative">
                          <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                          <span className="text-base-content/80">
                            ${plan.priceAnchor}
                          </span>
                        </p>
                      </div>
                    )} */}
                    <p className={`text-5xl tracking-tight font-extrabold`}>
                      ${subscriptionType === "monthly" ? plan.price : Math.round((plan.price * 10) / 12)}
                      {subscriptionType === "yearly" && <span className="ml-0.5 align-top text-xl font-bold">.{getPriceDecimals((plan.price * 10) / 12)}</span>}
                    </p>
                    <div className="flex flex-col justify-end mb-[4px]">
                      <p className="text-sm text-base-content/60 font-semibold">
                        <span className="mr-1">/month</span>
                        {subscriptionType === "yearly" && <span className="text-base-content/60 font-semibold">billed as ${plan.price * 10} per year</span>}
                      </p>
                    </div>
                  </div>

                  {plan.features && (
                    <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                      
                      {subscriptionType === "yearly" && (
                        <li className="flex items-center gap-2 text-green-600 font-bold">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-[18px] h-[18px] shrink-0"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Saved ${plan.price * 2}</span>
                        </li>
                      )}

                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
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
                  )}
                  <div className="space-y-2">
                    <ButtonSignin text="Start 14 days free trial" extraStyle="btn-primary btn-block" />
                    <p className="text-base-secondary mt-1 text-center text-sm">
                      $0.00 due today. No credit card required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;