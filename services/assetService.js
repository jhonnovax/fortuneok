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

export function filterAssets(data) {
  let filteredData = [...data];

  return filteredData;
}

export const ASSET_CATEGORIES = [
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

export function sortAssetList(data, sortBy) {
  const sortedData = data.toSorted((a, b) => {
    if (sortBy.type === 'asc') {
      return a[sortBy.field] > b[sortBy.field] ? 1 : -1;
    }

    return a[sortBy.field] < b[sortBy.field] ? 1 : -1;
  });

  return sortedData;
}

export const parseCurrentValuationOfAsset = (asset, stocksData) => {
  const currentValuation = { ...asset.currentValuation };
  let symbolDetails = {};

  if (asset.symbol) {
    symbolDetails = stocksData[asset.symbol] || {};
    currentValuation.currency = symbolDetails.currency || 'USD';
    currentValuation.amount = (asset.shares || 0) * (symbolDetails.price || 1);
  }

  return {
    ...asset,
    currentValuation
  }
}

export function parseDataFromAPI(asset, selectedIds, conversionRates) {
  const date = getLocalDateFromUTCString(asset.date);
  let amount = 0;

  if (asset.shares) {
    amount = convertFromBaseCurrency('usd', asset.amount, conversionRates);
  } else {
    amount = convertFromBaseCurrency(asset.currency, asset.purchaseInformation?.purchasePrice, conversionRates);
  }

  return {
    ...asset,
    date,
    amount
  };
}

export function getAssetCategoryDescription(assetCategory) {
  return ASSET_CATEGORIES.find(category => category.value === assetCategory)?.label || assetCategory;
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