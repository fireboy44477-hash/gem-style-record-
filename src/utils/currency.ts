import { CurrencyCode, CurrencyRate } from '../types/gem';

export const CURRENCY_RATES: Record<CurrencyCode, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1 },
  LKR: { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', rateAgainstUSD: 305 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht (Bangkok)', rateAgainstUSD: 36.4 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rateAgainstUSD: 7.82 },
};

/**
 * Converts USD amount to selected target currency
 */
export function convertCurrency(amountUSD: number, targetCurrency: CurrencyCode): number {
  const rate = CURRENCY_RATES[targetCurrency]?.rateAgainstUSD || 1;
  return (amountUSD || 0) * rate;
}

/**
 * Format currency with appropriate decimals and symbol
 */
export function formatCurrency(
  amountUSD: number,
  targetCurrency: CurrencyCode = 'USD',
  compact: boolean = false
): string {
  const converted = convertCurrency(amountUSD, targetCurrency);
  const currencyInfo = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.USD;
  
  if (compact && Math.abs(converted) >= 1_000_000) {
    return `${currencyInfo.symbol}${(converted / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(converted) >= 10_000) {
    return `${currencyInfo.symbol}${(converted / 1_000).toFixed(1)}k`;
  }

  // Decimals: LKR, THB typically display 0 decimals for large amounts, USD 2 or 0
  const decimals = (targetCurrency === 'LKR' || targetCurrency === 'THB') ? 0 : 2;

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted);

  return `${currencyInfo.symbol}${formattedNum}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
