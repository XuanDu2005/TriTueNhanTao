import { createContext, useContext, useState, useCallback } from 'react';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

const translations = { en, vi };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale');
    return saved || 'en';
  });

  const changeLocale = useCallback((newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  }, []);

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') return key;

    return value.replace(/\{(\w+)\}/g, (_, param) => {
      return params[param] !== undefined ? params[param] : `{${param}}`;
    });
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
