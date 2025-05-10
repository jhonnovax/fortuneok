/**
 * Format Service
 * Utility functions for formatting values in a consistent way across the application
 */

/**
 * Format currency values with K, M, B abbreviations
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, decimals = 1) {
  if (value === null || value === undefined) return '$0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`;
  } else if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  } else if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

/**
 * Format percentage values
 * @param {number} value - The percentage to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M, B abbreviations (without currency symbol)
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined) return '0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  } else if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  } else if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  } else {
    return value.toFixed(0);
  }
}

/**
 * Format currency with full precision (no abbreviations)
 * @param {number} value - The number to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export function formatFullCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Mask a value for privacy
 * @returns {string} Masked value
 */
export function maskValue() {
  return '$ • • • •  ';
} 