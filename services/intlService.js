export function maskValue(length) {
  return '$●●●●●●●';
}

export function formatCurrency(value, decimals = 0, currency = 'USD') {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatFullCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDateToString(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  return `${year}/${month}/${day}`;
}

export function formatPercentage(percentageValue, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: decimals
  }).format(percentageValue / 100);
}

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: decimals
  }).format(value);
}