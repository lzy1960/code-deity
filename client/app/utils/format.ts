import Decimal from 'break_infinity.js'

/**
 * Formats a Decimal or number for display.
 * - Uses locale-specific string with commas for numbers < 1,000,000.
 * - Uses scientific notation for numbers >= 1,000,000.
 * @param value The number to format.
 * @returns A formatted string.
 */
export function formatNumber(value?: Decimal | number): string {
  const decimalValue = value instanceof Decimal ? value : new Decimal(value)

  if (decimalValue.lt(1e6)) {
    // For numbers less than 1 million, format with commas.
    // We can safely convert to a standard number in this range.
    return decimalValue.toNumber().toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  // For numbers 1 million and greater, use scientific notation (e.g., 1.23e6).
  return decimalValue.toExponential(2).replace('e+', 'e')
}
