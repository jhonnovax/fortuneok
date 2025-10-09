const getNumberSuffix = (value, currency) => {
  let valueFormatted = value;
  let valueSuffix = '';
  let valueSuffixText = '';

  if (value >= 1_000_000_000_000) {
    valueFormatted = value / 1_000_000_000_000;
    valueSuffix = 'T';
    valueSuffixText =  valueFormatted > 1 ? 'trillions' : 'trillion';
  } else if (value >= 1_000_000_000) {
    valueFormatted = value / 1_000_000_000;
    valueSuffix = 'B';
    valueSuffixText =  valueFormatted > 1 ? 'billions' : 'billion';
  } else if (value >= 1_000_000) {
    valueFormatted = value / 1_000_000;
    valueSuffix = 'M';
    valueSuffixText =  valueFormatted > 1 ? 'millions' : 'million';
  } else {
    valueSuffixText = currency;
  }

  return { valueFormatted, valueSuffix, valueSuffixText };
}

export function maskValue(value) {
  const valueString = value.toString().split('.')[0];
  const maskedValue = '●'.repeat(valueString.length > 3 ? 3 : valueString.length);

  return `$${maskedValue}`;
}

export function abbreviateSummaryTotalValue(value, currency = 'USD', forScreenReader = false) {
  const { valueFormatted, valueSuffix, valueSuffixText } = getNumberSuffix(value, currency);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: valueSuffix === '' ? 0 : 2
  }).format(valueFormatted) + (forScreenReader ? ` ${valueSuffixText}` : valueSuffix);
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