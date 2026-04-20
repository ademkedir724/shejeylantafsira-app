/**
 * Property-based tests for search functionality.
 *
 * Property 10: Surah search completeness
 * Validates: Requirements 27.3
 *
 * Property 11: Page number search correctness
 * Validates: Requirements 27.4
 */

import { getAllSurahs, searchSurahs } from '@/features/quran/metadata';
import { defaultSearchProvider } from '@/features/search/index';
import * as fc from 'fast-check';

// Pre-compute all surahs once for efficiency
const ALL_SURAHS = getAllSurahs();

describe('Property 10 — Surah search completeness', () => {
    it('substring of a surah English name always returns that surah in results', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: ALL_SURAHS.length - 1 }),
                (idx) => {
                    const surah = ALL_SURAHS[idx];
                    const name = surah.nameEnglish;
                    if (!name || name.length === 0) return;

                    // Take a non-empty substring from the middle of the name
                    const start = Math.floor(name.length / 4);
                    const end = Math.ceil((name.length * 3) / 4);
                    const substring = name.slice(start, end || 1);
                    if (!substring) return;

                    const results = searchSurahs(substring);
                    const found = results.some((s) => s.surahNumber === surah.surahNumber);
                    expect(found).toBe(true);
                },
            ),
            { numRuns: 114 },
        );
    });
});

describe('Property 11 — Page number search correctness', () => {
    it('search(String(n)) includes a result with type === "page" and pageNumber === n', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 604 }),
                (n) => {
                    const results = defaultSearchProvider.search(String(n));
                    const pageResult = results.find(
                        (r) => r.type === 'page' && r.pageNumber === n,
                    );
                    expect(pageResult).toBeDefined();
                },
            ),
            { numRuns: 200 },
        );
    });
});
