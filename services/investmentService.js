import { getLocalDateFromUTCString } from "@/services/dateService";


function convertFromBaseCurrency(baseCurrency = 'USD', amount = 0, rates = {}) {
  const amountInBaseCurrency = amount / (rates[baseCurrency.toLowerCase()] || 1);

  return amountInBaseCurrency;
}

export const getTotalAssetsValue = (assets) => {
  const totalValue = assets.reduce((total, asset) => {
    const assetValue = asset.currentValuation?.amount || 0;
    return total + assetValue;
  }, 0);

  return totalValue;
};

export const getAssetPercentage = (asset, totalAssetsValue) => {
  const assetValue = asset.currentValuation?.amount || 0;
  return (assetValue / totalAssetsValue) * 100;
};

export function filterInvestments(data) {
  let filteredData = [...data];

  return filteredData;
}

export const INVESTMENT_CATEGORIES = [
  { value: 'real_estate', label: '🏠 Real Estate' },
  { value: 'cars', label: '🚗 Cars' },
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

export const parseCurrentValuationOfInvestment = (investment, stocksData) => {
  const currentValuation = { ...investment.currentValuation };
  let symbolDetails = {};

  if (investment.symbol) {
    symbolDetails = stocksData[investment.symbol] || {};
    currentValuation.currency = symbolDetails.currency || 'USD';
    currentValuation.amount = (investment.shares || 0) * (symbolDetails.price || 1);
  }

  return {
    ...investment,
    currentValuation
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

export function getAssetCategoryGroup(assetCategory) {

  switch (assetCategory) {

    case 'bonds':
      return '📈 Bonds';

    case 'cars':
      return '🚗 Cars';

    case 'certificates_of_deposit':
    case 'checking_account':
    case 'savings_account':
    case 'p2p_loans':
      return '💵 Cash';

    case 'cryptocurrencies':
      return '📈 Cryptos';

    case 'etf_funds':
      return '📈 ETFs';

    case 'real_estate':
      return '🏠 Real Estate';

    case 'stocks':
    case 'option':
    case 'futures':
      return '📈 Stocks';

    default:
      return '🔷 Others';
  }

}