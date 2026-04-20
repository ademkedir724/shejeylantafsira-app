/**
 * Property-based tests for Qur'an metadata.
 *
 * Property 1: Metadata completeness and validity
 * Validates: Requirements 2.2, 2.3
 *
 * Property 2: Juz partition covers all pages
 * Validates: Requirements 2.4
 */

import { getPageMetadata, getPagesByJuz } from '@/features/quran/metadata';
import * as fc from 'fast-check';

/**
 * Property 1 — Metadata completeness and validity
 * Validates: Requirements 2.2, 2.3
 */
describe('Property 1 — Metadata completeness and validity', () => {
    it('getPageMetadata(n) returns valid fields for every page number', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 604 }), (n) => {
                const meta = getPageMetadata(n);

                // pageNumber equals n
                expect(meta.pageNumber).toBe(n);

                // juz is between 1 and 30
                expect(meta.juzNumber).toBeGreaterThanOrEqual(1);
                expect(meta.juzNumber).toBeLessThanOrEqual(30);

                // surahNumber is between 1 and 114
                expect(meta.surahNumber).toBeGreaterThanOrEqual(1);
                expect(meta.surahNumber).toBeLessThanOrEqual(114);

                // surahNameArabic is a non-empty string
                expect(typeof meta.surahNameArabic).toBe('string');
                expect(meta.surahNameArabic.length).toBeGreaterThan(0);

                // surahNameEnglish is a non-empty string
                expect(typeof meta.surahNameEnglish).toBe('string');
                expect(meta.surahNameEnglish.length).toBeGreaterThan(0);

                // startAyah >= 1
                expect(meta.startAyah).toBeGreaterThanOrEqual(1);

                // endAyah >= startAyah
                expect(meta.endAyah).toBeGreaterThanOrEqual(meta.startAyah);

                // isFirstPageOfSurah is boolean
                expect(typeof meta.isFirstPageOfSurah).toBe('boolean');

                // hasBasmala is boolean
                expect(typeof meta.hasBasmala).toBe('boolean');
            }),
            { numRuns: 100 },
        );
    });
});

/**
 * Property 2 — Juz partition covers all pages
 * Validates: Requirements 2.4
 */
describe('Property 2 — Juz partition covers all pages', () => {
    it('every page returned by getPagesByJuz(j) has juzNumber === j', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 30 }), (j) => {
                const pages = getPagesByJuz(j);
                for (const p of pages) {
                    expect(p.juzNumber).toBe(j);
                }
            }),
            { numRuns: 100 },
        );
    });

    it('union of all 30 juz pages = exactly 604 distinct pages', () => {
        const allPageNumbers = new Set<number>();
        for (let j = 1; j <= 30; j++) {
            for (const p of getPagesByJuz(j)) {
                allPageNumbers.add(p.pageNumber);
            }
        }
        expect(allPageNumbers.size).toBe(604);
    });
});
