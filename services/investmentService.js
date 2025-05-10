import { getLocalDateFromUTCString } from "@/services/dateService";


function convertFromBaseCurrency(baseCurrency = 'USD', amount = 0, rates = {}) {
  const amountInBaseCurrency = amount / (rates[baseCurrency.toLowerCase()] || 1);

  return amountInBaseCurrency;
}
export function filterInvestments(data) {
  let filteredData = [...data];

  return filteredData;
}

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
    amount = convertFromBaseCurrency(investment.currency, investment.purchaseInformation.purchasePrice, conversionRates);
  }

  return {
    ...investment,
    date,
    amount
  };
}