import currencies from '@/public/currencies.json';

export default function CurrencyBadge({ currencyCode }) {
  const currencyDetails = currencies.find(currency => currency.code === currencyCode);
  const { flag: currencyFlag, label: currencyLabel } = currencyDetails;

  return (
    <span className="badge badge-sm badge-ghost ml-1 py-1" title={currencyLabel}>
      {currencyFlag} {currencyCode}
    </span>
  );
}