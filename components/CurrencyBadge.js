import currencies from '@/public/currencies.json';
import Flag from './Flag';

export default function CurrencyBadge({ currencyCode, percentage }) {

  const currencyDetails = currencies.find(currency => currency.code === currencyCode);
  const { flag: countryCode, label: currencyLabel } = currencyDetails || {};

  return (
    <span className="badge badge-sm badge-ghost mr-1 py-1 flex-shrink-0 flex items-center gap-1" title={currencyLabel}>
      <Flag countryCode={countryCode} size="sm" /> {currencyCode} {percentage ? `${percentage}` : ''}
    </span>
  );

}