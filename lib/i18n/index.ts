import { en, TranslationKey } from './translations/en';
import { ar } from './translations/ar';

export type SupportedLanguage = 'en' | 'ar';

export const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en,
  ar,
};

export function translate(
  lang: SupportedLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text = translations[lang]?.[key] || translations.en[key] || String(key);
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }
  return text;
}

export { en, ar };
export type { TranslationKey };
