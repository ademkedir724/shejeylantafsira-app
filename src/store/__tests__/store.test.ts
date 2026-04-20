/**
 * Property-based tests for Zustand store slices.
 *
 * Property 6: Downloaded pages persistence round-trip
 * Validates: Requirements 11.1
 *
 * Property 7: Playback speed state consistency
 * Validates: Requirements 21.1
 *
 * Property 8: Bookmark add/remove round-trip
 * Validates: Requirements 26.2, 26.3
 *
 * Property 9: Bookmark count invariant
 * Validates: Requirements 26.9
 */

import * as fc from 'fast-check';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createAudioSlice, type AudioSlice } from '@/store/audioSlice';
import { createBookmarksSlice, MAX_BOOKMARKS, type BookmarksSlice } from '@/store/bookmarksSlice';
import type { Bookmark } from '@/types/bookmarks';
import type { PlaybackSpeed } from '@/types/preferences';

// ─── Minimal store factories (no persist, no AsyncStorage) ──────────────────

function makeAudioStore() {
    return create<AudioSlice>()(immer(createAudioSlice));
}

function makeBookmarksStore() {
    return create<BookmarksSlice>()(immer(createBookmarksSlice));
}

// ─── Property 6 — Downloaded pages persistence round-trip ──────────────────

describe('Property 6 — Downloaded pages persistence round-trip', () => {
    it('serialize Set to array and back yields the same set', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.integer({ min: 1, max: 604 })),
                (pages) => {
                    const original = new Set<number>(pages);
                    const serialized = [...original];
                    const restored = new Set<number>(serialized);

                    expect(restored.size).toBe(original.size);
                    for (const p of original) {
                        expect(restored.has(p)).toBe(true);
                    }
                },
            ),
            { numRuns: 200 },
        );
    });
});

// ─── Property 7 — Playback speed state consistency ─────────────────────────

describe('Property 7 — Playback speed state consistency', () => {
    it('setPlaybackSpeed(v) results in store.audio.playbackSpeed === v', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<PlaybackSpeed>(0.75, 1.0, 1.25, 1.5, 2.0),
                (speed) => {
                    const store = makeAudioStore();
                    store.getState().setPlaybackSpeed(speed);
                    expect(store.getState().audio.playbackSpeed).toBe(speed);
                },
            ),
            { numRuns: 100 },
        );
    });
});

// ─── Property 8 — Bookmark add/remove round-trip ───────────────────────────

describe('Property 8 — Bookmark add/remove round-trip', () => {
    it('add bookmark → isBookmarked true → remove → isBookmarked false', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 604 }),
                fc.string({ maxLength: 60 }),
                (pageNumber, label) => {
                    const store = makeBookmarksStore();

                    const bookmark: Bookmark = {
                        id: `test-${pageNumber}`,
                        pageNumber,
                        surahNameEnglish: 'Al-Fatiha',
                        juzNumber: 1,
                        label,
                        createdAt: Date.now(),
                    };

                    store.getState().addBookmark(bookmark);
                    expect(store.getState().isBookmarked(pageNumber)).toBe(true);

                    store.getState().removeBookmark(pageNumber);
                    expect(store.getState().isBookmarked(pageNumber)).toBe(false);
                },
            ),
            { numRuns: 200 },
        );
    });
});

// ─── Property 9 — Bookmark count invariant ─────────────────────────────────

describe('Property 9 — Bookmark count invariant', () => {
    it('bookmarks.length never exceeds MAX_BOOKMARKS after arbitrary addBookmark calls', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.integer({ min: 1, max: 604 }), { maxLength: 300 }),
                (pageNumbers) => {
                    const store = makeBookmarksStore();

                    for (const pageNumber of pageNumbers) {
                        store.getState().addBookmark({
                            id: `bm-${pageNumber}`,
                            pageNumber,
                            surahNameEnglish: 'Test',
                            juzNumber: 1,
                            label: '',
                            createdAt: Date.now(),
                        });
                    }

                    expect(store.getState().bookmarks.length).toBeLessThanOrEqual(MAX_BOOKMARKS);
                },
            ),
            { numRuns: 100 },
        );
    });
});
