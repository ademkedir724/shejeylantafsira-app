import ar from './ar';
import en from './en';
import om from './om';

export type TranslationKey = keyof typeof en;
export type Locale = 'om' | 'en' | 'ar';

const translations: Record<Locale, typeof en> = { om, en, ar };

/**
 * Look up a translation string by key and locale.
 * Falls back to English if the key is missing in the target locale.
 * Falls back to the key itself if not found in English either.
 */
export function t(key: TranslationKey, locale: Locale): string {
    return (translations[locale] as Record<string, string>)[key]
        ?? (translations['en'] as Record<string, string>)[key]
        ?? key;
}
