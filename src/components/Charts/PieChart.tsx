import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { Investment } from "@/types/Investment";
import { formatCurrency } from "@/services/intl-service";

interface PieChartProps {
  investmentData: Investment[];
}

const PieChart: React.FC<PieChartProps> = ({ investmentData }) => {
  const series = investmentData.map((investment: Investment) => investment.total);
  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut"
    },
    labels: investmentData.map((investment: Investment) => investment.name),
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (w: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const total = w.globals.seriesTotals.reduce((a: any, b: any) => {
                  return a + b;
                }, 0);
                return `${formatCurrency(Math.round(total))}`;
              }
            }
          }
        }
      }
    },
    theme: {
      palette: "palette1"
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
          <ReactApexChart options={options} series={series} type="donut" />
        </div>
      </div>
    </div>
  );
};

export default PieChart;
