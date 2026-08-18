/**
 * currency.js
 * Shared formatting helpers for Indian Rupees (INR).
 * All prices in the system are stored and computed in INR.
 */

/**
 * Format a number as Indian Rupees with the ₹ symbol.
 * Uses the en-IN locale for proper Indian comma grouping (e.g. ₹1,54,000).
 *
 * @param {number} n - The amount in INR
 * @param {boolean} [decimals=true] - Whether to show paise (.00)
 * @returns {string}
 */
export const formatINR = (n, decimals = true) => {
  const amount = n || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
};

/**
 * Compact version — no decimals, for card display.
 * e.g. ₹99,999 instead of ₹99,999.00
 *
 * @param {number} n
 * @returns {string}
 */
export const formatINRCompact = (n) => formatINR(n, false);
