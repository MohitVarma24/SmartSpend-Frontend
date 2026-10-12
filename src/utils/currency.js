/**
 * Format monetary amount with Indian Rupee (₹) symbol and Indian numbering format
 * e.g. 150000 -> ₹1,50,000.00
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }

  const numeric = Number(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric);

  return formatted;
}

/**
 * Format currency compact (e.g. ₹1.5L or ₹25K) for charts
 */
export function formatCompactCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const numeric = Number(amount);
  if (Math.abs(numeric) >= 10000000) {
    return `₹${(numeric / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(numeric) >= 100000) {
    return `₹${(numeric / 100000).toFixed(1)}L`;
  }
  if (Math.abs(numeric) >= 1000) {
    return `₹${(numeric / 1000).toFixed(1)}K`;
  }
  return `₹${numeric.toFixed(0)}`;
}
