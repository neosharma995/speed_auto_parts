export const CURRENCY_CATALOG = [
    { code: 'AED', name: 'UAE Dirham', symbol: '\u20C3', locale: 'en-AE', defaultRate: 1.0 },
    { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', defaultRate: 0.2723 },
    { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', defaultRate: 0.251 },
];

export function getCurrencyMeta(code) {
    const upper = String(code || 'AED').toUpperCase();
    return (
        CURRENCY_CATALOG.find((c) => c.code === upper) || {
            code: upper,
            name: upper,
            symbol: upper,
            locale: 'en-US',
            defaultRate: 1.0,
        }
    );
}

/**
 * Format a numeric amount using a currency symbol & locale.
 * Multi-character currency symbols like "AED" get a separating space ("AED 1,250");
 * single-character symbols like "$", "€", "£", "₹" attach directly ("$1,250").
 */
export function formatWithSymbol(amount, symbol = '\u20C3', locale = 'en-AE', options = {}) {
    const num = Number(amount || 0);
    const safeNum = Number.isFinite(num) ? num : 0;
    const isNegative = safeNum < 0;
    const absNum = Math.abs(safeNum);

    const hasFraction = Math.abs(absNum - Math.round(absNum)) > 0.001;
    const minFrac = options.minimumFractionDigits ?? (hasFraction ? 2 : 0);
    const maxFrac = options.maximumFractionDigits ?? 2;

    let formatted;
    try {
        formatted = absNum.toLocaleString(locale || 'en-AE', {
            minimumFractionDigits: minFrac,
            maximumFractionDigits: maxFrac,
        });
    } catch {
        formatted = absNum.toLocaleString('en-US', {
            minimumFractionDigits: minFrac,
            maximumFractionDigits: maxFrac,
        });
    }

    const sym = String(symbol || 'AED').trim();
    const spacer = sym.length > 1 ? ' ' : '';
    return `${isNegative ? '-' : ''}${sym}${spacer}${formatted}`;
}
