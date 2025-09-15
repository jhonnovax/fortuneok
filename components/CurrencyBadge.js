import currencies from '@/public/currencies.json';

export default function CurrencyBadge({ currencyCode, percentage }) {

  const currencyDetails = currencies.find(currency => currency.code === currencyCode);
  const { flag: currencyFlag, label: currencyLabel } = currencyDetails || {};

  return (
    <span className="badge badge-sm badge-ghost mr-1 py-1 flex-shrink-0" title={currencyLabel}>
      {currencyFlag} {currencyCode} {percentage ? `${percentage}` : ''}
    </span>
  );

}