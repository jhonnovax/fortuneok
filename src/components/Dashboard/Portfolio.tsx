"use client";
import dynamic from "next/dynamic";
import React from "react";
import LineChart from "../Charts/LineChart";
import InvestmentsSummary from "../Tables/InvestmentsSummary";
import { Investment } from "@/types/Investment";

const PieChart = dynamic(() => import("@/components/Charts/PieChart"), {
  ssr: false,
});

interface PortfolioProps {
  investmentData: Investment[];
}

const Portfolio: React.FC<PortfolioProps> = ({ investmentData }) => {
  return (
    <>
      <h1 className="sr-only">Manage your Investment Portfolio</h1>
      <div className="grid grid-cols-12 gap-4 2xl:gap-7.5">
        <div className="col-span-12">
          <div className="flex w-full justify-center">
            <div className="inline-flex items-center rounded-md bg-gray p-1.5 dark:bg-meta-4">
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                1 Month
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                3 Months
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark hidden md:block">
                6 Months
              </button>
              <button className="rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                1 Year
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark hidden md:block">
                5 Years
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                All
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12">
          <LineChart investmentData={investmentData} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <PieChart investmentData={investmentData} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <InvestmentsSummary investmentData={investmentData} />
        </div>
      </div>
    </>
  );
};

export default Portfolio;
