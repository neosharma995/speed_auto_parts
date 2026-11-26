import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CURRENCY_CATALOG, formatWithSymbol, getCurrencyMeta } from '@/utils/currency';

const CurrencyContext = createContext(null);

const STORAGE_KEY = 'sap_selected_currency';

const BASE_USD_RATES = {
    AED: 3.6725,
    USD: 1.0,
    EUR: 0.9218,
};

function getDefaultRatesForBase(baseCode) {
    const base = BASE_USD_RATES[baseCode] || 1;
    const out = {};
    Object.entries(BASE_USD_RATES).forEach(([c, usdRate]) => {
        out[c] = c === baseCode ? 1 : Number((usdRate / base).toFixed(4));
    });
    return out;
}

function normalizeSettings(rawSettings = {}) {
    const code = String(rawSettings?.currency_code || 'AED').toUpperCase();
    const meta = getCurrencyMeta(code);
    const symbol = code;
    const locale = String(rawSettings?.currency_locale || meta.locale || 'en-AE');
    const rateNum = Number(rawSettings?.currency_rate ?? 1);
    const rate = Number.isFinite(rateNum) && rateNum > 0 ? rateNum : 1;

    let rawRates = {};
    if (typeof rawSettings?.currency_rates === 'string') {
        try {
            const parsed = JSON.parse(rawSettings.currency_rates);
            if (parsed && typeof parsed === 'object') {
                rawRates = parsed;
            }
        } catch {
            rawRates = {};
        }
    } else if (rawSettings?.currency_rates && typeof rawSettings.currency_rates === 'object') {
        rawRates = rawSettings.currency_rates;
    }

    const supportedCodes = ['AED', 'USD', 'EUR'];
    const filteredRawRates = {};
    supportedCodes.forEach((c) => {
        const num = Number(rawRates[c]);
        if (Number.isFinite(num) && num > 0) {
            filteredRawRates[c] = num;
        }
    });

    const rates = {
        ...getDefaultRatesForBase(code),
        ...filteredRawRates,
        [code]: 1,
    };

    return { code, symbol, locale, rate, rates };
}

export function CurrencyProvider({ initialSettings = {}, children }) {
    const [config, setConfig] = useState(() => normalizeSettings(initialSettings));
    const [selectedCode, setSelectedCode] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = window.localStorage.getItem(STORAGE_KEY);
                if (saved) return saved.toUpperCase();
            } catch {
                // ignore storage errors
            }
        }
        return normalizeSettings(initialSettings).code;
    });

    // Keep live-synced with Inertia page props whenever Admin updates Settings
    useEffect(() => {
        const handlePage = (event) => {
            const nextSettings = event?.detail?.page?.props?.settings;
            if (nextSettings) {
                const nextCfg = normalizeSettings(nextSettings);
                setConfig((prev) => {
                    if (prev.code !== nextCfg.code) {
                        setSelectedCode(nextCfg.code);
                        if (typeof window !== 'undefined') {
                            try {
                                window.localStorage.setItem(STORAGE_KEY, nextCfg.code);
                            } catch {
                                // ignore
                            }
                        }
                    }
                    return nextCfg;
                });
            }
        };

        const offNavigate = router.on('navigate', handlePage);
        const offSuccess = router.on('success', handlePage);
        return () => {
            if (typeof offNavigate === 'function') offNavigate();
            if (typeof offSuccess === 'function') offSuccess();
        };
    }, []);

    const setSelectedCurrency = (code) => {
        const upper = String(code || config.code).toUpperCase();
        setSelectedCode(upper);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(STORAGE_KEY, upper);
            } catch {
                // ignore
            }
        }
    };

    const value = useMemo(() => {
        const defaultCurrency = {
            code: config.code,
            symbol: config.symbol,
            locale: config.locale,
            rate: config.rate,
        };

        const activeCode = config.rates[selectedCode] ? selectedCode : config.code;
        const activeMeta = getCurrencyMeta(activeCode);
        const activeSymbol = activeCode;
        const activeLocale = activeCode === config.code ? config.locale : activeMeta.locale;
        const storefrontMultiplier = Number(config.rates[activeCode] || 1);

        // Convert stored DB base price -> default currency price (used in Admin/Supplier dashboards & checkout)
        const convertToDefault = (baseAmount) => Number(baseAmount || 0) * config.rate;

        // Convert stored DB base price -> currently selected storefront display currency
        const convertForDisplay = (baseAmount) => convertToDefault(baseAmount) * storefrontMultiplier;

        // Format price for Admin / Supplier Dashboard (always uses Admin's configured Default Currency shortform)
        const formatAdminPrice = (baseAmount, options = {}) =>
            formatWithSymbol(convertToDefault(baseAmount), defaultCurrency.code, defaultCurrency.locale, options);

        // Format price for Public Storefront (uses Default Currency * visitor's selected currency rate, always ISO shortform)
        const formatPrice = (baseAmount, options = {}) =>
            formatWithSymbol(convertForDisplay(baseAmount), activeCode, activeLocale, options);

        // Available currencies for storefront switcher (always puts default currency first)
        const rateKeys = Object.keys(config.rates);
        const orderedCodes = [config.code, ...rateKeys.filter((k) => k !== config.code)];
        const availableCurrencies = orderedCodes.map((code) => {
            const meta = getCurrencyMeta(code);
            return {
                code,
                symbol: code,
                name: meta.name || code,
                rate: Number(config.rates[code] || 1),
            };
        });

        return {
            defaultCurrency,
            activeCurrency: {
                code: activeCode,
                symbol: activeSymbol,
                locale: activeLocale,
                rate: storefrontMultiplier,
            },
            availableCurrencies,
            currencyCatalog: CURRENCY_CATALOG,
            setSelectedCurrency,
            convertToDefault,
            convertForDisplay,
            formatAdminPrice,
            formatPrice,
        };
    }, [config, selectedCode]);

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        return {
            defaultCurrency: { code: 'AED', symbol: 'AED', locale: 'en-AE', rate: 1 },
            activeCurrency: { code: 'AED', symbol: 'AED', locale: 'en-AE', rate: 1 },
            availableCurrencies: [
                { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rate: 1 },
                { code: 'USD', symbol: 'USD', name: 'US Dollar', rate: 0.2723 },
                { code: 'EUR', symbol: 'EUR', name: 'Euro', rate: 0.251 },
            ],
            currencyCatalog: CURRENCY_CATALOG,
            setSelectedCurrency: () => { },
            convertToDefault: (v) => Number(v || 0),
            convertForDisplay: (v) => Number(v || 0),
            formatAdminPrice: (v, opts) => formatWithSymbol(v, 'AED', 'en-AE', opts),
            formatPrice: (v, opts) => formatWithSymbol(v, 'AED', 'en-AE', opts),
        };
    }
    return ctx;
}
