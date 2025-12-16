import { formatPercentage, formatFullCurrency, maskValue } from '@/services/intlService';
import CurrencyBadge from './CurrencyBadge';
import Flag from './Flag';
import currencies from '@/public/currencies.json';
import { useMemo } from 'react';

export default function TotalAssetsByCurrency({ className, filteredAssetData, totalAssetsValue, showValues }) {

  const assetsValuesByCurrency = useMemo(() => {
    const isCategory = filteredAssetData.some(asset => asset.assets?.length > 0);
    const assetsInCategories = isCategory ? filteredAssetData.flatMap(asset => asset.assets) : filteredAssetData;

    return Object.groupBy(assetsInCategories, asset => asset.currentValuation?.currency);
  }, [filteredAssetData]);

  const totalAssetsbyCurrency = useMemo(() => {
    const totalAssetsbyCurrency = Object.keys(assetsValuesByCurrency).map(currency => {
      const totalValueInCurrency = assetsValuesByCurrency[currency].reduce((acc, asset) => acc + asset.currentValuation?.amount, 0);
      const totalValueInPreferredCurrency = assetsValuesByCurrency[currency].reduce((acc, asset) => acc + asset.valuationInPreferredCurrency, 0);

      return {
        currency,
        percentage: totalValueInPreferredCurrency / totalAssetsValue,
        totalValue: totalValueInCurrency
      }
    });
    const totalAssetsbyCurrencyOrdered = totalAssetsbyCurrency.sort((a, b) => b.percentage - a.percentage);

    return totalAssetsbyCurrencyOrdered;
  }, [assetsValuesByCurrency, totalAssetsValue]);

  return (
    <div className={`flex items-center justify-center flex-wrap gap-2 ${className}`}>
      {totalAssetsbyCurrency.map(value => (
        <div key={value.currency} className="inline-block tooltip tooltip-neutral" data-tip={`Money in ${value.currency}`}>
          <div className="p-1 border border-base-content/10 rounded-lg shadow-sm bg-base-100 text-xs md:text-sm md:text-base">
            <div className="flex items-center justify-center gap-1">
              <Flag countryCode={currencies.find(currency => currency.code === value.currency)?.flag} size="sm" /> {value.currency} {showValues ? formatFullCurrency(value.totalValue) : maskValue(value.totalValue)}
            </div>
            <div className="flex items-center justify-center">
              <CurrencyBadge percentage={formatPercentage(value.percentage * 100, 2)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

}