import { getLocalDateFromUTCString } from "@/services/dateService";


function convertFromBaseCurrency(baseCurrency = 'USD', amount = 0, rates = {}) {
  const amountInBaseCurrency = amount / (rates[baseCurrency.toLowerCase()] || 1);

  return amountInBaseCurrency;
}
export function filterInvestments(data) {
  let filteredData = [...data];

  return filteredData;
}

export const INVESTMENT_CATEGORIES = [
  { value: 'real_estate', label: '🏠 Real Estate' },
  { value: 'cash', label: '💵 Cash' },
  { value: 'certificates_of_deposit', label: '🏦 Certificates of deposit' },
  { value: 'savings_account', label: '🏦 Savings account' },
  { value: 'p2p_loans', label: '🤝 P2P loans' },
  { value: 'precious_metals', label: '👑 Precious metals' },
  { value: 'etf_funds', label: '📈 ETF / Funds' },
  { value: 'stocks', label: '📈 Stocks' },
  { value: 'bonds', label: '📈 Bonds' },
  { value: 'cryptocurrencies', label: '📈 Cryptocurrencies' },
  { value: 'option', label: '📈 Option' },
  { value: 'futures', label: '📈 Futures' },
  { value: 'other', label: '🔷 Other custom assets' }
];

export function sortInvestmentList(data, sortBy) {
  const sortedData = data.toSorted((a, b) => {
    if (sortBy.type === 'asc') {
      return a[sortBy.field] > b[sortBy.field] ? 1 : -1;
    }

    return a[sortBy.field] < b[sortBy.field] ? 1 : -1;
  });

  return sortedData;
}

export const parseUserInvestments = (investment, stocksData) => {
  let amount = 0;
  let annualInterestRate = 0;
  let stockData = {};

  if (investment.shares) {
    stockData = stocksData[investment.code] || {};
    annualInterestRate = stockData.avgAnnualReturn || 0;
    amount = investment.shares * (stockData.currentPrice || 1);
  } else {
    annualInterestRate = investment.annualInterestRate || 0;
    amount = investment.amount;
  }

  return {
    ...investment,
    amount,
    annualInterestRate
  }
}

export function parseDataFromAPI(investment, selectedIds, conversionRates) {
  const date = getLocalDateFromUTCString(investment.date);
  let amount = 0;

  if (investment.shares) {
    amount = convertFromBaseCurrency('usd', investment.amount, conversionRates);
  } else {
    amount = convertFromBaseCurrency(investment.currency, investment.purchaseInformation?.purchasePrice, conversionRates);
  }

  return {
    ...investment,
    date,
    amount
  };
}

export function getAssetCategoryDescription(assetCategory) {
  return INVESTMENT_CATEGORIES.find(category => category.value === assetCategory)?.label || assetCategory;
}