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

/**
 * Parses a game name string like "中文 (English)" and returns the appropriate part based on locale.
 * @param name The game name string.
 * @param locale The current locale code (e.g., 'en', 'zh-CN').
 * @returns The localized name.
 */
export function getLocalizedGameName(name: string, locale: string): string {
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const chinesePart = match[1].trim();
    const englishPart = match[2].trim();
    return locale === 'en' ? englishPart : chinesePart;
  }
  return name; // Return original name if no match
}
