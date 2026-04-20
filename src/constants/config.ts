// Single source of truth for R2 configuration (Req 9.5)
export const R2_BASE_URL = process.env.EXPO_PUBLIC_R2_BASE_URL ?? '';

export const SAMPLE_PAGES = [1, 2, 3] as const;
export type SamplePage = (typeof SAMPLE_PAGES)[number];

export function buildLqUrl(pageNumber: number): string {
    return `${R2_BASE_URL}/audio/lq/${pageNumber}.mp3`;
}

export function buildHqUrl(pageNumber: number): string {
    return `${R2_BASE_URL}/audio/hq/${pageNumber}.mp3`;
}

export const MAX_CONCURRENT_DOWNLOADS = 3;
export const MAX_BOOKMARKS = 200;
export const LAST_READ_SAVE_DEBOUNCE_MS = 1000;
export const AUTO_ADVANCE_DELAY_MS = 1500;
export const FULL_SCREEN_CONTROLS_TIMEOUT_MS = 3000;
