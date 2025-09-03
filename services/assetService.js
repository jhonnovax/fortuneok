import { getLocalDateFromUTCString } from "@/services/dateService";

export const ASSET_CATEGORIES = [
  { group: 'bonds', label: '📈 Bonds', value: 'bonds', icon: '📈' },
  { group: 'cars', label: '🚗 Cars', value: 'cars', icon: '🚗' },
  { group: 'cash', label: '💵 Cash', value: 'cash', icon: '💵' },
  { group: 'cash', label: '🏦 Certificates of deposit', value: 'certificates_of_deposit', icon: '🏦' },
  { group: 'cash', label: '💵 Checking account', value: 'checking_account', icon: '🏦' },
  { group: 'cash', label: '🏦 Savings account', value: 'savings_account', icon: '🏦' },
  { group: 'cash', label: '🤝 P2P loans', value: 'p2p_loans', icon: '🤝' },
  { group: 'cryptocurrencies', label: '📉 Cryptocurrencies', value: 'cryptocurrencies', icon: '📉' },
  { group: 'etf_funds', label: '📈 ETF / Funds', value: 'etf_funds', icon: '📈' },
  { group: 'precious_metals', label: '👑 Precious metals', value: 'precious_metals', icon: '👑' },
  { group: 'real_estate', label: '🏠 Real Estate', value: 'real_estate', icon: '🏠' },
  { group: 'stocks', label: '📈 Stocks', value: 'stocks', icon: '📈' },
  { group: 'stocks', label: '📈 Option', value: 'option', icon: '📈' },
  { group: 'stocks', label: '📈 Futures', value: 'futures', icon: '📈' },
  { group: 'other', label: '🔷 Other custom assets', value: 'other', icon: '🔷' }
];

export function convertFromBaseCurrency(baseCurrency = 'USD', amount = 0, rates = {}) {
  const amountInBaseCurrency = amount / (rates[baseCurrency.toLowerCase()] || 1);

  return amountInBaseCurrency;
}

export const getAssetPercentage = (asset, totalAssetsValue) => {
  const assetValue = asset.valuationInPreferredCurrency || 0;
  return (assetValue / totalAssetsValue) * 100;
};

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
    currentValuation,
    description: symbolDetails.description || asset.description
  }
}

export function parseDataFromAPI(asset, selectedIds, conversionRates) {
  const date = getLocalDateFromUTCString(asset.date);
  const assetCurrency = asset.currentValuation?.currency || 'USD';
  const assetAmount = asset.currentValuation?.amount || 0;
  const valuationInPreferredCurrency = convertFromBaseCurrency(assetCurrency, assetAmount, conversionRates);

  return {
    ...asset,
    date,
    valuationInPreferredCurrency
  };
}

export function parseAssetCategoryFromAssetList(assetData) {
  const assetCategories = assetData.reduce((categories, asset) => {
    const assetCategoryGroup = getAssetCategoryGroupName(asset.category);
    const categoryExists = categories.some(category => category.category === assetCategoryGroup);

    if (!categoryExists) {
      categories = categories.concat({
        id: Date.now().toString() + Math.floor(Math.random() * 1000000).toString(),
        assets: [asset],
        category: assetCategoryGroup,
        description: getAssetCategoryDescription(assetCategoryGroup),
        currencies: [asset.currentValuation?.currency],
        valuationInPreferredCurrency: asset.valuationInPreferredCurrency
      });
    } else {
      categories = categories.map(category => {
        if (category.category === assetCategoryGroup) {
          return { 
            ...category, 
            assets: [...category.assets, asset],
            currencies: [...new Set([...category.currencies, asset.currentValuation?.currency])].sort(),
            valuationInPreferredCurrency: category.valuationInPreferredCurrency + (asset.valuationInPreferredCurrency || 0) 
          };
        }

        return category;
      });
    }

    return categories;
  }, []);

  return assetCategories;
}

export function getAssetCategoryDescription(assetCategory) {
  return ASSET_CATEGORIES.find(category => category.value === assetCategory)?.label || assetCategory;
}

export function getAssetCategoryGroupIcon (assetCategoryGroupName) {
  switch (assetCategoryGroupName) {
    case 'bonds':
      return '📈';
    case 'cars':
      return '🚗';
    case 'cash':
      return '💵';
    case 'cryptocurrencies':
      return '📉';
    case 'etf_funds':
      return '📈';
    case 'real_estate':
      return '🏠';
    case 'stocks':
      return '📈';
    case 'other':
      return '🔷';
  }
}

export function getAssetCategoryGroupName(assetCategory) {

  switch (assetCategory) {

    case 'bonds':
      return 'bonds';

    case 'cars':
      return 'cars';

    case 'cash':
    case 'certificates_of_deposit':
    case 'checking_account':
    case 'savings_account':
    case 'p2p_loans':
      return 'cash';

    case 'cryptocurrencies':
      return 'cryptocurrencies';

    case 'etf_funds':
      return 'etf_funds';

    case 'precious_metals':
      return 'precious_metals';

    case 'real_estate':
      return 'real_estate';

    case 'stocks':
    case 'option':
    case 'futures':
      return 'stocks';

    default:
      return 'other';
  }

}