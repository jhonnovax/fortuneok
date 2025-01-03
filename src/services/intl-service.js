export const formatCurrency = (value, decimals = 0, currency = 'USD') => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		maximumFractionDigits: decimals
	}).format(value);
};

export const formatDate = (dateStr) => {
	const date = new Date(dateStr);
	const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
	
	return `${year}/${month}/${day}`;
}