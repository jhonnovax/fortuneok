import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { Investment } from "@/types/Investment";

interface PieChartProps {
  investmentData: Investment[];
}

const PieChart: React.FC<PieChartProps> = ({ investmentData }) => {
  const series = investmentData.map((investment: Investment) => investment.price * (investment.stocks || 1));
  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "pie"
    },
    labels: investmentData.map((investment: Investment) => investment.name),
    legend: {
      show: false,
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false
      }
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="flex mb-3 justify-center gap-4">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Allocation
        </h2>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="pie" />
        </div>
      </div>
    </div>
  );
};

export default PieChart;
