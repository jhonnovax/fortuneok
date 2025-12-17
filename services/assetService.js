import { getLocalDateFromUTCString } from "@/services/dateService";

// Hierarchical structure for asset categories
export const ASSET_CATEGORIES_STRUCTURE = {
  bonds: {
    icon: '📈',
    label: 'Bonds',
    value: 'bonds',
    subcategories: []
  },
  cars: {
    icon: '🚗',
    label: 'Cars',
    value: 'cars',
    subcategories: []
  },
  cash: {
    icon: '💵',
    label: 'Cash',
    value: 'cash_parent',
    subcategories: [
      { label: 'Cash', value: 'cash' },
      { label: 'Certificates of deposit', value: 'certificates_of_deposit' },
      { label: 'Checking account', value: 'checking_account' },
      { label: 'Savings account', value: 'savings_account' },
      { label: 'P2P loans', value: 'p2p_loans' }
    ]
  },
  cryptocurrencies: {
    icon: '📉',
    label: 'Cryptocurrencies',
    value: 'cryptocurrencies',
    subcategories: []
  },
  etf_funds: {
    icon: '📈',
    label: 'ETF / Funds',
    value: 'etf_funds',
    subcategories: []
  },
  precious_metals: {
    icon: '👑',
    label: 'Precious metals',
    value: 'precious_metals',
    subcategories: []
  },
  real_estate: {
    icon: '🏠',
    label: 'Real Estate',
    value: 'real_estate',
    subcategories: []
  },
  stocks: {
    icon: '📈',
    label: 'Stocks',
    value: 'stocks_parent',
    subcategories: [
      { label: 'Stocks', value: 'stocks' },
      { label: 'Option', value: 'option' },
      { label: 'Futures', value: 'futures' }
    ]
  },
  other: {
    icon: '🔷',
    label: 'Other custom assets',
    value: 'other',
    subcategories: []
  }
};

// Flatten structure for backward compatibility
export const ASSET_CATEGORIES = (() => {
  const flat = [];
  Object.entries(ASSET_CATEGORIES_STRUCTURE).forEach(([groupKey, group]) => {
    // Add parent category if it has subcategories, otherwise add as regular category
    if (group.subcategories.length > 0) {
      flat.push({
        group: groupKey,
        label: group.label,
        value: group.value,
        icon: group.icon
      });
    }
    
    // Add all subcategories
    group.subcategories.forEach(subcategory => {
      flat.push({
        group: groupKey,
        label: subcategory.label,
        value: subcategory.value,
        icon: group.icon
      });
    });
    
    // If no subcategories, add the group itself as a selectable category
    if (group.subcategories.length === 0) {
      flat.push({
        group: groupKey,
        label: group.label,
        value: group.value,
        icon: group.icon
      });
    }
  });
  return flat;
})();

export const TRADING_CATEGORIES = [
  'stocks', 
  'bonds', 
  'cryptocurrencies', 
  'etf_funds', 
  'option', 
  'futures'
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
        currencies: asset.currencies,
        valuationInPreferredCurrency: asset.valuationInPreferredCurrency
      });
    } else {
      categories = categories.map(category => {
        if (category.category === assetCategoryGroup) {
          const categoryCurrencies = [...category.currencies, ...asset.currencies].reduce((categoryCurrencies, currentCurrency) => {
            const categoryCurrencyExists = categoryCurrencies.find(c => c.currency === currentCurrency.currency);

            if (categoryCurrencyExists) {
              return categoryCurrencies.map(categoryCurrency => {
                if (categoryCurrency.currency === currentCurrency.currency) {
                  return { 
                    ...categoryCurrency, 
                    valuationInPreferredCurrency: (categoryCurrency.valuationInPreferredCurrency + currentCurrency.valuationInPreferredCurrency)
                  };
                }

                return categoryCurrency;
              });
            }

            return [...categoryCurrencies, currentCurrency];
          }, []);

          return { 
            ...category, 
            assets: [...category.assets, asset],
            currencies: categoryCurrencies.sort((a, b) => b.valuationInPreferredCurrency - a.valuationInPreferredCurrency),
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
  const category = ASSET_CATEGORIES.find(cat => cat.value === assetCategory);
  return category?.label || assetCategory;
}

export function getAssetCategoryIcon(categoryOrGroup) {
  // First, check if it's a group name (direct key in ASSET_CATEGORIES_STRUCTURE)
  if (ASSET_CATEGORIES_STRUCTURE[categoryOrGroup]) {
    return ASSET_CATEGORIES_STRUCTURE[categoryOrGroup].icon || '';
  }
  
  // Otherwise, find which group this category value belongs to and return its icon
  for (const group of Object.values(ASSET_CATEGORIES_STRUCTURE)) {
    // Check if it's the parent category value
    if (group.value === categoryOrGroup) {
      return group.icon || '';
    }
    // Check if it's a subcategory value
    if (group.subcategories.some(sub => sub.value === categoryOrGroup)) {
      return group.icon || '';
    }
  }
  return '';
}

export function getAssetCategoryGroupName(assetCategory) {
  // Find which group this category belongs to
  for (const [groupKey, group] of Object.entries(ASSET_CATEGORIES_STRUCTURE)) {
    // Check if it's the parent category
    if (group.value === assetCategory) {
      return groupKey;
    }
    // Check if it's a subcategory
    if (group.subcategories.some(sub => sub.value === assetCategory)) {
      return groupKey;
    }
  }
  return 'other';
}

export function validateAssetData(assetData) {
  const assetErrors  = {};

  const isTradingCategory = TRADING_CATEGORIES.includes(assetData.category);
    
  // Required field validation
  if (!assetData.date) assetErrors.date = 'Date is required';
  if (!assetData.category) assetErrors.category = 'Category is required';
  if (isTradingCategory && !assetData.brokerName) assetErrors.brokerName = 'Broker name is required';
  if (!isTradingCategory && !assetData.description) assetErrors.description = 'Description is required';
  if (isTradingCategory && !assetData.symbol) assetErrors.symbol = 'Symbol is required';
  if (isTradingCategory && !assetData.shares) assetErrors.shares = 'Shares is required';
  if (!isTradingCategory && !assetData.currentValuation?.currency) assetErrors.currentValuationCurrency = 'Currency is required';
  if (!isTradingCategory && !assetData.currentValuation?.amount) assetErrors.currentValuation = 'Amount is required';
  
  if (isTradingCategory && isNaN(Number(assetData.shares))) {
    assetErrors.shares = 'Enter a valid number';
  }
  
  if (!isTradingCategory && isNaN(Number(assetData.currentValuation.amount))) {
    assetErrors.currentValuation = 'Enter a valid number';
  }

  return assetErrors;
}