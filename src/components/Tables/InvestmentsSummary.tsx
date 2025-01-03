import { Investment } from "@/types/Investment";
import { formatCurrency, formatDate } from "@/services/intl-service";

interface InvestmentsSummaryProps {
  investmentData: Investment[];
}

const InvestmentsSummary = ({ investmentData }: InvestmentsSummaryProps) => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h2 className="text-xl font-semibold text-black dark:text-white text-center">
          Summary
        </h2>
      </div>

      {investmentData.map((investment, key) => (
        <div
          className={`grid grid-cols-6 ${key > 0 ? "border-t" : ""} border-stroke px-4 py-4.5 dark:border-strokedark md:px-6 2xl:px-7.5`}
          key={key}
        >
          <div className="col-span-4 flex items-center">
            <div className="flex gap-4 items-center">
              <label className="inline-flex items-center mb-5 cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                <div className="shrink-0 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  <div>
                    <div className="text-sm text-black dark:text-white">
                      {investment.name} {investment.stocks && ` (${investment.stocks} stocks)`}
                    </div>
                    <div className="text-sm text-bodydark2 dark:text-white">
                      {investment.company}
                    </div>
                    <div className="text-xs text-bodydark2 dark:text-white">
                      {formatDate(investment.date)}
                    </div>
                  </div>
                </span>
              </label>
            </div>
          </div>

          <div className="col-span-2 text-right">
            <p className="text-sm text-black dark:text-white">
              {formatCurrency(investment.price * (investment.stocks || 1))}
            </p>
            <p className="flex items-center justify-end text-sm text-green">
              <span className="mr-1">
                <svg
                  className="fill-green"
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                    fill=""
                  />
                </svg>
              </span>
              <span>
                {formatCurrency((investment.price * (investment.stocks || 1)) * (investment.annualInterestRate / 100))}
              </span>
              <span className="ml-1">
                ({investment.annualInterestRate}%)
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvestmentsSummary;
