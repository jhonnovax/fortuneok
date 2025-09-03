import currencies from '@/public/currencies.json';

export default function CurrencyBadge({ currencyCode }) {
  const currencyFlag = currencies.find(currency => currency.code === currencyCode)?.flag;

  return (
    <span className="badge badge-sm badge-ghost ml-1 py-1">
      {currencyFlag} {currencyCode}
    </span>
  );
}