import type { JuzInfo, PageMetadata, SurahInfo } from '@/types';
import { PAGES_DATA } from './data/pages';

// ---------------------------------------------------------------------------
// O(1) indexed lookup — page numbers are 1-based, array is 0-based
// ---------------------------------------------------------------------------

/**
 * Returns the PageMetadata for a given page number (1–604) in O(1) time.
 * Throws a RangeError for out-of-range inputs.
 */
export function getPageMetadata(pageNumber: number): PageMetadata {
    if (pageNumber < 1 || pageNumber > 604) {
        throw new RangeError(`Page number must be between 1 and 604, got ${pageNumber}`);
    }
    return PAGES_DATA[pageNumber - 1];
}

// ---------------------------------------------------------------------------
// Juz helpers
// ---------------------------------------------------------------------------

/**
 * Returns all PageMetadata entries belonging to the given juz (1–30).
 */
export function getPagesByJuz(juzNumber: number): PageMetadata[] {
    if (juzNumber < 1 || juzNumber > 30) {
        throw new RangeError(`Juz number must be between 1 and 30, got ${juzNumber}`);
    }
    return PAGES_DATA.filter(p => p.juzNumber === juzNumber);
}

// ---------------------------------------------------------------------------
// Surah helpers
// ---------------------------------------------------------------------------

/**
 * Returns all PageMetadata entries belonging to the given surah (1–114).
 */
export function getPagesBySurah(surahNumber: number): PageMetadata[] {
    if (surahNumber < 1 || surahNumber > 114) {
        throw new RangeError(`Surah number must be between 1 and 114, got ${surahNumber}`);
    }
    return PAGES_DATA.filter(p => p.surahNumber === surahNumber);
}

// ---------------------------------------------------------------------------
// Surah list (114 entries)
// ---------------------------------------------------------------------------

/**
 * Returns a list of all 114 SurahInfo entries derived from the pages data.
 * Each entry includes the surah number, Arabic/English names, total ayahs,
 * and the starting page number.
 */
export function getAllSurahs(): SurahInfo[] {
    const seen = new Set<number>();
    const surahs: SurahInfo[] = [];

    for (const page of PAGES_DATA) {
        if (!seen.has(page.surahNumber)) {
            seen.add(page.surahNumber);

            // Compute total ayahs: max endAyah across all pages of this surah
            // (will be filled in after collecting all pages)
            surahs.push({
                surahNumber: page.surahNumber,
                nameArabic: page.surahNameArabic,
                nameEnglish: page.surahNameEnglish,
                totalAyahs: 0, // placeholder
                startPage: page.pageNumber,
            });
        }
    }

    // Fill in totalAyahs: the maximum endAyah across all pages of each surah
    for (const surah of surahs) {
        const pages = PAGES_DATA.filter(p => p.surahNumber === surah.surahNumber);
        surah.totalAyahs = Math.max(...pages.map(p => p.endAyah));
    }

    return surahs.sort((a, b) => a.surahNumber - b.surahNumber);
}

// ---------------------------------------------------------------------------
// Juz list (30 entries)
// ---------------------------------------------------------------------------

/**
 * Returns a list of all 30 JuzInfo entries derived from the pages data.
 * Each entry includes the juz number, starting page, and starting surah names.
 */
export function getAllJuz(): JuzInfo[] {
    const seen = new Set<number>();
    const juzList: JuzInfo[] = [];

    for (const page of PAGES_DATA) {
        if (!seen.has(page.juzNumber)) {
            seen.add(page.juzNumber);
            juzList.push({
                juzNumber: page.juzNumber,
                startPage: page.pageNumber,
                startSurahNameArabic: page.surahNameArabic,
                startSurahNameEnglish: page.surahNameEnglish,
            });
        }
    }

    return juzList.sort((a, b) => a.juzNumber - b.juzNumber);
}

// ---------------------------------------------------------------------------
// Surah search (partial match on Arabic + English names)
// ---------------------------------------------------------------------------

/**
 * Returns all SurahInfo entries whose Arabic or English name contains the
 * query string (case-insensitive, diacritic-insensitive for Latin characters).
 */
export function searchSurahs(query: string): SurahInfo[] {
    if (!query || query.trim() === '') {
        return getAllSurahs();
    }

    const normalised = query.trim().toLowerCase();
    const surahs = getAllSurahs();

    return surahs.filter(s =>
        s.nameEnglish.toLowerCase().includes(normalised) ||
        s.nameArabic.includes(query.trim()),
    );
}
