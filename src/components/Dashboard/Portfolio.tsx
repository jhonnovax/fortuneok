"use client";
import dynamic from "next/dynamic";
import React from "react";
import LineChart from "../Charts/LineChart";
import InvestmentsSummary from "../Tables/InvestmentsSummary";

const PieChart = dynamic(() => import("@/components/Charts/PieChart"), {
  ssr: false,
});

const Portfolio: React.FC = () => {
  return (
    <>
      <div className="mt-4 grid grid-cols-12 gap-4 2xl:mt-7 2xl:gap-7.5">
        <div className="col-span-12">
          <div className="flex w-full justify-center">
            <div className="inline-flex items-center rounded-md bg-gray p-1.5 dark:bg-meta-4">
              <button className="rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                Day
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                Week
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                Month
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                3 Months
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                6 Months
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                1 Year
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                5 Years
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                ALL
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <PieChart />
        </div>
        
        <div className="col-span-12 2xl:col-span-6">
          <LineChart />
        </div>

        <div className="col-span-12">
          <InvestmentsSummary />
        </div>
      </div>
    </>
  );
};

export default Portfolio;
