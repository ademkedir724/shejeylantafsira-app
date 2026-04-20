/**
 * Property-based tests for Zustand store slices.
 * Property 7 — Playback speed state consistency (Req 21.1)
 * Property 8 — Bookmark add/remove round-trip (Req 26.2, 26.3)
 * Property 9 — Bookmark count invariant (Req 26.9)
 */

import * as fc from 'fast-check';
import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Bookmark } from '../../types/bookmarks';
import type { PlaybackSpeed } from '../../types/preferences';
import { createAudioSlice, type AudioSlice } from '../audioSlice';
import { MAX_BOOKMARKS, createBookmarksSlice, type BookmarksSlice } from '../bookmarksSlice';

enableMapSet();

// ─── Store factories (no persist, no AsyncStorage) ───────────────────────────

function makeAudioStore() {
    return create<AudioSlice>()(immer(createAudioSlice));
}

function makeBookmarksStore() {
    return create<BookmarksSlice>()(immer(createBookmarksSlice));
}

// ─── Property 7: Playback speed state consistency (Req 21.1) ────────────────

describe('Property 7 — Playback speed state consistency', () => {
    it('setPlaybackSpeed always stores the exact value passed', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<PlaybackSpeed>(0.75, 1.0, 1.25, 1.5, 2.0),
                (speed) => {
                    const store = makeAudioStore();
                    store.getState().setPlaybackSpeed(speed);
                    expect(store.getState().audio.playbackSpeed).toBe(speed);
                },
            ),
        );
    });

    it('last setPlaybackSpeed call wins when called multiple times', () => {
        fc.assert(
            fc.property(
                fc.array(fc.constantFrom<PlaybackSpeed>(0.75, 1.0, 1.25, 1.5, 2.0), {
                    minLength: 2,
                    maxLength: 10,
                }),
                (speeds) => {
                    const store = makeAudioStore();
                    for (const s of speeds) {
                        store.getState().setPlaybackSpeed(s);
                    }
                    expect(store.getState().audio.playbackSpeed).toBe(speeds[speeds.length - 1]);
                },
            ),
        );
    });
});

// ─── Property 8: Bookmark add/remove round-trip (Req 26.2, 26.3) ────────────

describe('Property 8 — Bookmark add/remove round-trip', () => {
    it('add then remove leaves isBookmarked false', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 604 }),
                fc.string({ maxLength: 60 }),
                (pageNumber, label) => {
                    const store = makeBookmarksStore();

                    const bookmark: Bookmark = {
                        id: `bm-${pageNumber}`,
                        pageNumber,
                        label,
                        surahName: 'Al-Fatiha',
                        juzNumber: 1,
                        createdAt: new Date().toISOString(),
                    };

                    store.getState().addBookmark(bookmark);
                    expect(store.getState().isBookmarked(pageNumber)).toBe(true);

                    store.getState().removeBookmark(pageNumber);
                    expect(store.getState().isBookmarked(pageNumber)).toBe(false);
                },
            ),
        );
    });

    it('isBookmarked returns false for pages never bookmarked', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 604 }), (pageNumber) => {
                const store = makeBookmarksStore();
                expect(store.getState().isBookmarked(pageNumber)).toBe(false);
            }),
        );
    });
});

// ─── Property 9: Bookmark count invariant (Req 26.9) ────────────────────────

describe('Property 9 — Bookmark count invariant', () => {
    it('bookmarks.length never exceeds MAX_BOOKMARKS regardless of how many addBookmark calls are made', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.integer({ min: 1, max: 604 }), {
                    minLength: 1,
                    maxLength: 250, // intentionally over the 200 cap
                }),
                (pages) => {
                    const store = makeBookmarksStore();

                    for (const p of pages) {
                        store.getState().addBookmark({
                            id: `bm-${p}`,
                            pageNumber: p,
                            label: `Page ${p}`,
                            surahName: 'Test',
                            juzNumber: 1,
                            createdAt: new Date().toISOString(),
                        });
                    }

                    expect(store.getState().bookmarks.length).toBeLessThanOrEqual(MAX_BOOKMARKS);
                },
            ),
        );
    });
});
