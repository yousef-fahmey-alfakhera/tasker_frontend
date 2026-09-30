import { en, TranslationKey } from './translations/en';
import { ar } from './translations/ar';
import { ur } from './translations/ur';

export type SupportedLanguage = 'en' | 'ar' | 'ur';

export const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en,
  ar,
  ur,
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

export { en, ar, ur };
export type { TranslationKey };
