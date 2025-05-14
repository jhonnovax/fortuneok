// Calculate portfolio summary from investments
export const calculatePortfolioSummary = (investments) => {
  const totalValue = investments.reduce((total, investment) => {
    const investmentValue = investment.purchaseInformation?.purchasePrice || 0;
    return total + investmentValue;
  }, 0);

  return totalValue;
};