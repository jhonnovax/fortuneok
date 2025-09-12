import { formatPercentage, formatFullCurrency, maskValue } from '@/services/intlService';
import CurrencyBadge from './CurrencyBadge';
import currencies from '@/public/currencies.json';
import { useMemo } from 'react';

export default function TotalAssetsByCurrency({ baseCurrency, className, filteredAssetData, totalAssetsValue, showValues }) {

  const assetsValuesByCurrency = useMemo(() => {
    const isCategory = filteredAssetData.some(asset => asset.assets?.length > 1);
    const assetsInCategories = isCategory ? filteredAssetData.flatMap(asset => asset.assets) : filteredAssetData;

    return Object.groupBy(assetsInCategories, asset => asset.currentValuation?.currency);
  }, [filteredAssetData]);

  const totalAssetsbyCurrency = useMemo(() => {
    const totalAssetsbyCurrency = Object.keys(assetsValuesByCurrency).map(currency => {
      const totalValue = assetsValuesByCurrency[currency].reduce((acc, asset) => acc + asset.valuationInPreferredCurrency, 0);

      return {
        currency,
        percentage: totalValue / totalAssetsValue,
        totalValue
      }
    });
    const totalAssetsbyCurrencyOrdered = totalAssetsbyCurrency.sort((a, b) => b.totalValue - a.totalValue);

    return totalAssetsbyCurrencyOrdered;
  }, [assetsValuesByCurrency, totalAssetsValue]);

  return (
    <div className={`flex items-center justify-center flex-wrap gap-2 ${className}`}>
      {totalAssetsbyCurrency.map(value => (
        <div className="inline-block" key={value.currency}>
          <div className="p-1 border border-base-content/10 rounded-lg shadow-sm bg-base-100 text-xs md:text-sm md:text-base">
            <div className="flex items-center">
              <span className="font-bold mr-1">{formatPercentage(value.percentage * 100, 2)}</span> in <CurrencyBadge currencyCode={value.currency} />
            </div>
            <div className="text-center">
              {currencies.find(currency => currency.code === baseCurrency)?.flag}{baseCurrency} {showValues ? formatFullCurrency(value.totalValue) : maskValue(value.totalValue)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

}