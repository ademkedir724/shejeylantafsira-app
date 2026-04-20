/**
 * Property-based tests for download manager.
 * Property 4 — Download path correctness (Req 10.4)
 * Property 5 — Download concurrency invariant (Req 10.9)
 * Property 6 — Downloaded pages persistence round-trip (Req 11.1)
 */

import * as fc from 'fast-check';
import { MAX_CONCURRENT_DOWNLOADS } from '../../../constants/config';
import { getLocalPath, processQueue } from '../downloadManager';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
    documentDirectory: 'file:///data/',
    makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
    createDownloadResumable: jest.fn(),
    getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
}));

// ─── Property 4: Download path correctness (Req 10.4) ───────────────────────

describe('Property 4 — Download path correctness', () => {
    it('getLocalPath returns {documentDirectory}audio/lq/{n}.mp3 for every valid page', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 604 }), (n) => {
                const path = getLocalPath(n);
                expect(path).toBe(`file:///data/audio/lq/${n}.mp3`);
                expect(path).toContain('audio/lq/');
                expect(path.endsWith('.mp3')).toBe(true);
                expect(path).toContain(String(n));
            }),
        );
    });
});

// ─── Property 5: Download concurrency invariant (Req 10.9) ──────────────────

describe('Property 5 — Download concurrency invariant', () => {
    it('processQueue never starts more than MAX_CONCURRENT_DOWNLOADS simultaneous downloads', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.integer({ min: 1, max: 604 }), {
                    minLength: 1,
                    maxLength: 20,
                }),
                (pages) => {
                    const startedDownloads: number[] = [];

                    const dispatch = {
                        updateProgress: (pageNumber: number) => {
                            startedDownloads.push(pageNumber);
                        },
                        markDownloaded: jest.fn(),
                        markMissing: jest.fn(),
                        cancelDownload: jest.fn(),
                    };

                    const queue = pages.map((p) => ({
                        pageNumber: p,
                        status: 'queued' as const,
                        progress: 0,
                        error: null,
                    }));

                    processQueue(
                        queue,
                        new Set<number>(),
                        false, // not paused
                        true,  // isWifi
                        false, // wifiOnlyDownload
                        MAX_CONCURRENT_DOWNLOADS,
                        dispatch,
                    );

                    // processQueue should start at most MAX_CONCURRENT_DOWNLOADS
                    expect(startedDownloads.length).toBeLessThanOrEqual(MAX_CONCURRENT_DOWNLOADS);
                },
            ),
        );
    });

    it('processQueue starts nothing when queue is paused', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.integer({ min: 1, max: 604 }), { minLength: 1, maxLength: 10 }),
                (pages) => {
                    const started: number[] = [];
                    const dispatch = {
                        updateProgress: (p: number) => started.push(p),
                        markDownloaded: jest.fn(),
                        markMissing: jest.fn(),
                        cancelDownload: jest.fn(),
                    };

                    const queue = pages.map((p) => ({
                        pageNumber: p,
                        status: 'queued' as const,
                        progress: 0,
                        error: null,
                    }));

                    processQueue(queue, new Set(), true, true, false, MAX_CONCURRENT_DOWNLOADS, dispatch);
                    expect(started).toHaveLength(0);
                },
            ),
        );
    });
});

// ─── Property 6: Downloaded pages persistence round-trip (Req 11.1) ─────────

describe('Property 6 — Downloaded pages persistence round-trip', () => {
    it('Set<number> survives JSON serialization round-trip (Array → JSON → Set)', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.integer({ min: 1, max: 604 })),
                (pages) => {
                    const original = new Set(pages);

                    // Simulate Zustand persist partialize: Set → Array
                    const serialized = JSON.stringify([...original]);

                    // Simulate rehydration: JSON → Array → Set
                    const restored = new Set<number>(JSON.parse(serialized));

                    expect(restored.size).toBe(original.size);
                    for (const p of original) {
                        expect(restored.has(p)).toBe(true);
                    }
                },
            ),
        );
    });
});
