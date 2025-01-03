export const formatCurrency = (value, decimals = 0, currency = 'USD') => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		maximumFractionDigits: decimals
	}).format(value);
};