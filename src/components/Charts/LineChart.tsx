"use client";

import { ApexOptions } from "apexcharts";
import React from "react";
import dynamic from "next/dynamic";
import { Investment } from "@/types/Investment";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const options: ApexOptions = {
  legend: {
    show: false,
    position: "top",
    horizontalAlign: "left",
  },
  colors: ["#5d8245"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    height: 335,
    type: "area",
    dropShadow: {
      enabled: true,
      color: "#623CEA14",
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },

    zoom: {
      enabled: false,
    },
  },
  stroke: {
    width: [2, 2],
    curve: "smooth",
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    type: 'datetime'
  },
  yaxis: {
    title: {
      style: {
        fontSize: "0px",
      },
    },
    labels: {
      formatter: function (value) {
        return `$${new Intl.NumberFormat().format(Math.round(value))}`;
      },
    }
  },
  fill: {
    type: 'gradient'
  },
 /*  forecastDataPoints: {
    count: 2,
    fillOpacity: 0.5,
    strokeWidth: undefined,
    dashArray: 4,
  } */
};

interface LineChartProps {
  investmentData: Investment[];
}
const LineChart: React.FC<LineChartProps> = ({ investmentData }) => {
  const seriesData = investmentData.map((investment: Investment, index, array) => {
    return {
      x: new Date(investment.date),
      y: array.slice(0, index + 1).reduce((sum, item: Investment) => {
        return sum + (item.price * (item.stocks || 1));
      }, 0)
    }
  });
  const series = [
    {
      name: "Balance",
      data: seriesData
    }
  ];

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="flex flex-wrap items-start justify-center gap-3 sm:flex-nowrap">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Performance
        </h2>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
};

export default LineChart;
