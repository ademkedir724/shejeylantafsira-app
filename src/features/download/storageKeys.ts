/**
 * AsyncStorage key constants for the Qur'an Tafsir app.
 * All keys are namespaced under @quran/ to avoid collisions.
 */
export const STORAGE_KEYS = {
    STORE: '@quran/store',
    DOWNLOADED_PAGES: '@quran/downloadedPages',
    BOOKMARKS: '@quran/bookmarks',
    PREFERENCES: '@quran/preferences',
    LAST_READ_PAGE: '@quran/lastReadPage',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
