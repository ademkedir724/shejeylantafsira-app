/**
 * Property-based tests for Qur'an metadata functions.
 * Properties 1 & 2 — Requirements 2.2, 2.3, 2.4
 */

import * as fc from 'fast-check';
import {
    getAllSurahs,
    getPageMetadata,
    getPagesByJuz,
    searchSurahs,
} from '../metadata';

// ─── Property 1: Metadata completeness and validity (Req 2.2, 2.3) ──────────

describe('Property 1 — Metadata completeness and validity', () => {
    it('getPageMetadata returns valid fields for every page number 1–604', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 604 }), (n) => {
                const meta = getPageMetadata(n);

                expect(meta.pageNumber).toBe(n);
                expect(meta.juzNumber).toBeGreaterThanOrEqual(1);
                expect(meta.juzNumber).toBeLessThanOrEqual(30);
                expect(meta.surahNumber).toBeGreaterThanOrEqual(1);
                expect(meta.surahNumber).toBeLessThanOrEqual(114);
                expect(typeof meta.surahNameArabic).toBe('string');
                expect(meta.surahNameArabic.length).toBeGreaterThan(0);
                expect(typeof meta.surahNameEnglish).toBe('string');
                expect(meta.surahNameEnglish.length).toBeGreaterThan(0);
                expect(meta.startAyah).toBeGreaterThanOrEqual(1);
                expect(meta.endAyah).toBeGreaterThanOrEqual(meta.startAyah);
                expect(typeof meta.isFirstPageOfSurah).toBe('boolean');
                expect(typeof meta.hasBasmala).toBe('boolean');
            }),
            { numRuns: 604 },
        );
    });

    it('getPageMetadata throws RangeError for out-of-range inputs', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.integer({ max: 0 }),
                    fc.integer({ min: 605 }),
                ),
                (n) => {
                    expect(() => getPageMetadata(n)).toThrow(RangeError);
                },
            ),
        );
    });
});

// ─── Property 2: Juz partition covers all pages (Req 2.4) ───────────────────

describe('Property 2 — Juz partition covers all pages', () => {
    it('getPagesByJuz returns pages all belonging to the requested juz', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 30 }), (juz) => {
                const pages = getPagesByJuz(juz);
                expect(pages.length).toBeGreaterThan(0);
                for (const p of pages) {
                    expect(p.juzNumber).toBe(juz);
                }
            }),
        );
    });

    it('union of all 30 juz = exactly 604 distinct pages', () => {
        const allPages = new Set<number>();
        for (let juz = 1; juz <= 30; juz++) {
            for (const p of getPagesByJuz(juz)) {
                allPages.add(p.pageNumber);
            }
        }
        expect(allPages.size).toBe(604);
        for (let n = 1; n <= 604; n++) {
            expect(allPages.has(n)).toBe(true);
        }
    });
});

// ─── Property 10: Surah search completeness (Req 27.3) ──────────────────────

describe('Property 10 — Surah search completeness', () => {
    it('searchSurahs always finds a surah when given a substring of its English name', () => {
        const allSurahs = getAllSurahs();
        if (allSurahs.length === 0) return; // skip if no data in test env

        fc.assert(
            fc.property(fc.integer({ min: 0, max: allSurahs.length - 1 }), (idx) => {
                const surah = allSurahs[idx];
                // Take a non-empty substring of the English name
                const name = surah.nameEnglish;
                const start = Math.floor(name.length / 4);
                const end = Math.ceil((3 * name.length) / 4);
                const substring = name.slice(start, end || 1);

                const results = searchSurahs(substring);
                const found = results.some((r) => r.surahNumber === surah.surahNumber);
                expect(found).toBe(true);
            }),
        );
    });
});
