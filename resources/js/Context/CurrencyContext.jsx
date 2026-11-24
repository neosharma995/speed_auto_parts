import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CURRENCY_CATALOG, formatWithSymbol, getCurrencyMeta } from '@/utils/currency';

const CurrencyContext = createContext(null);

const STORAGE_KEY = 'sap_selected_currency';

function normalizeSettings(rawSettings = {}) {
    const code = String(rawSettings?.currency_code || 'AED').toUpperCase();
    const meta = getCurrencyMeta(code);
    let symbol = String(rawSettings?.currency_symbol || meta.symbol || code);
    if (code === 'AED' && symbol === 'AED') {
        symbol = 'د.إ';
    }
    const locale = String(rawSettings?.currency_locale || meta.locale || 'en-AE');
    const rateNum = Number(rawSettings?.currency_rate ?? 1);
    const rate = Number.isFinite(rateNum) && rateNum > 0 ? rateNum : 1;

    const rawRates = rawSettings?.currency_rates && typeof rawSettings.currency_rates === 'object'
        ? rawSettings.currency_rates
        : {};

    const supportedCodes = ['AED', 'USD', 'EUR'];
    const filteredRawRates = {};
    supportedCodes.forEach((c) => {
        const num = Number(rawRates[c]);
        if (Number.isFinite(num) && num > 0) {
            filteredRawRates[c] = num;
        }
    });

    const rates = {
        AED: 1,
        USD: 0.2723,
        EUR: 0.251,
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
        const activeSymbol = activeCode === config.code ? config.symbol : activeMeta.symbol;
        const activeLocale = activeCode === config.code ? config.locale : activeMeta.locale;
        const storefrontMultiplier = Number(config.rates[activeCode] || 1);

        // Convert stored DB base price -> default currency price (used in Admin/Supplier dashboards & checkout)
        const convertToDefault = (baseAmount) => Number(baseAmount || 0) * config.rate;

        // Convert stored DB base price -> currently selected storefront display currency
        const convertForDisplay = (baseAmount) => convertToDefault(baseAmount) * storefrontMultiplier;

        // Format price for Admin / Supplier Dashboard (always uses Admin's configured Default Currency)
        const formatAdminPrice = (baseAmount, options = {}) =>
            formatWithSymbol(convertToDefault(baseAmount), defaultCurrency.symbol, defaultCurrency.locale, options);

        // Format price for Public Storefront (uses Default Currency * visitor's selected currency rate)
        const formatPrice = (baseAmount, options = {}) =>
            formatWithSymbol(convertForDisplay(baseAmount), activeSymbol, activeLocale, options);

        // Available currencies for storefront switcher (always puts default currency first)
        const rateKeys = Object.keys(config.rates);
        const orderedCodes = [config.code, ...rateKeys.filter((k) => k !== config.code)];
        const availableCurrencies = orderedCodes.map((code) => {
            const meta = getCurrencyMeta(code);
            return {
                code,
                symbol: code === config.code ? config.symbol : meta.symbol,
                name: `${code} (${code === config.code ? config.symbol : meta.symbol})`,
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
            defaultCurrency: { code: 'AED', symbol: 'د.إ', locale: 'en-AE', rate: 1 },
            activeCurrency: { code: 'AED', symbol: 'د.إ', locale: 'en-AE', rate: 1 },
            availableCurrencies: [
                { code: 'AED', symbol: 'د.إ', name: 'AED (د.إ)', rate: 1 },
                { code: 'USD', symbol: '$', name: 'USD ($)', rate: 0.2723 },
                { code: 'EUR', symbol: '€', name: 'EUR (€)', rate: 0.251 },
            ],
            currencyCatalog: CURRENCY_CATALOG,
            setSelectedCurrency: () => { },
            convertToDefault: (v) => Number(v || 0),
            convertForDisplay: (v) => Number(v || 0),
            formatAdminPrice: (v, opts) => formatWithSymbol(v, 'د.إ', 'en-AE', opts),
            formatPrice: (v, opts) => formatWithSymbol(v, 'د.إ', 'en-AE', opts),
        };
    }
    return ctx;
}
