export function maskValue(value) {
  const valueString = value.toString().split('.')[0];
  const valueLength = valueString.length > 5 ? 5 : valueString.length;
  const maskedValue = '●'.repeat(valueLength);

  return `$${maskedValue}`;
}

export function formatCurrency(value, decimals = 0, currency = 'USD') {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatFullCurrency(value, decimals = 0, currency = 'USD') {
  if (value === null || value === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatDateToString(date, monthFormat = 'long') {
  const formatted = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: monthFormat, // or "long", "numeric"
    day: "numeric"
  }).format(date);

  return formatted;
}

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatPercentage(percentageValue, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: decimals
  }).format(percentageValue / 100);
}