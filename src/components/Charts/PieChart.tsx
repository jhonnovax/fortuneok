import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

/* interface PieChartState {
  series: number[];
} */

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "pie"
  },
  labels: ["VOO", "VUG", "Nova Unit", "Saving Account"],
  legend: {
    show: false,
    position: "bottom",
  },
  dataLabels: {
    enabled: true,
    /* formatter: function(value, { seriesIndex, w }) {
      return w.config.labels[seriesIndex] + ":  " + value
    }, */
    dropShadow: {
      enabled: false
    },
    style: {
      colors: ["#fff", "#fff", "#fff", "#fff"]
    }
  }
};

const PieChart: React.FC = () => {
  const series = [65, 34, 12, 56];

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="flex mb-3 justify-center gap-4">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Portfolio
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
