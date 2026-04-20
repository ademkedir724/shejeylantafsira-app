/**
 * mushafLayout.ts
 *
 * Provides per-page line layout data extracted from the Dar al-Maarifah
 * Tajweed Mushaf .docx files.
 *
 * Each page is an array of lines. Each line is a string of QPC font
 * codepoints (private-use-area characters) that render as Mushaf glyphs
 * when the correct per-page font (p{pageNumber}.ttf) is applied.
 *
 * Font naming convention (King Fahd Complex / QUL system):
 *   Page 1  → p1.ttf   (bundled as default)
 *   Page N  → p{N}.ttf (downloaded on demand from R2)
 *
 * Font URL: {R2_BASE_URL}/fonts/p{pageNumber}.ttf
 */

import type { PageLayout } from '@/types/quran';

// Lazy-loaded to avoid blocking startup (~362 KB JSON)
let _layouts: Record<string, string[]> | null = null;

function getLayouts(): Record<string, string[]> {
    if (!_layouts) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        _layouts = require('./data/mushafLayouts.json') as Record<string, string[]>;
    }
    return _layouts;
}

/**
 * Returns the line-by-line layout for a given page (1–604).
 * Each string in the array is one line of QPC-encoded text.
 */
export function getPageLayout(pageNumber: number): PageLayout {
    const layouts = getLayouts();
    const lines = layouts[String(pageNumber)] ?? [];
    return {
        pageNumber,
        lines,
        fontName: `QPC_P${pageNumber}`,
    };
}

/**
 * Returns the font asset name for a given page.
 * Page 1 is bundled; all others are downloaded on demand.
 */
export function getPageFontName(pageNumber: number): string {
    return `QPC_P${pageNumber}`;
}

/**
 * Returns true if the page font is bundled in the app (only page 1).
 */
export function isPageFontBundled(pageNumber: number): boolean {
    return pageNumber === 1;
}

/**
 * Returns the remote URL for downloading a page font.
 * Requires EXPO_PUBLIC_R2_BASE_URL to be set.
 */
export function getPageFontUrl(pageNumber: number, baseUrl: string): string {
    return `${baseUrl}/fonts/p${pageNumber}.ttf`;
}
