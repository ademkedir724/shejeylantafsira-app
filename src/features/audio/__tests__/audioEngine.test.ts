/**
 * Property-based tests for audio engine.
 * Property 3 — Audio source resolution exhaustive (Req 9.1, 9.2, 9.3, 9.6)
 */

import * as fc from 'fast-check';
import { SAMPLE_PAGES } from '../../../constants/config';
import { resolveAudioSource } from '../audioEngine';

// Mock expo-file-system so documentDirectory is predictable
jest.mock('expo-file-system', () => ({
    documentDirectory: 'file:///data/',
}));

// Mock bundled audio assets (require() calls in audioEngine.ts)
jest.mock('../../../assets/audio/samples/1.mp3', () => 1, { virtual: true });
jest.mock('../../../assets/audio/samples/2.mp3', () => 2, { virtual: true });
jest.mock('../../../assets/audio/samples/3.mp3', () => 3, { virtual: true });

describe('Property 3 — Audio source resolution is exhaustive and correct', () => {
    it('returns exactly one source type per the priority rules for all inputs', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 604 }),
                fc.uniqueArray(fc.integer({ min: 1, max: 604 }), { maxLength: 50 }),
                fc.oneof(fc.constant(''), fc.constant('https://r2.example.com')),
                (pageNumber, downloadedArray, baseUrl) => {
                    const downloadedPages = new Set(downloadedArray);
                    const result = resolveAudioSource(pageNumber, downloadedPages, baseUrl);

                    const isSample = (SAMPLE_PAGES as readonly number[]).includes(pageNumber);
                    const isDownloaded = downloadedPages.has(pageNumber);
                    const hasRemote = baseUrl.length > 0;

                    if (isSample) {
                        // Priority 1: bundled
                        expect(result).not.toBeNull();
                        expect(result!.type).toBe('bundled');
                        expect(result!.isSample).toBe(true);
                    } else if (isDownloaded) {
                        // Priority 2: local
                        expect(result).not.toBeNull();
                        expect(result!.type).toBe('local');
                        expect(result!.uri).toContain(`${pageNumber}.mp3`);
                        expect(result!.isSample).toBe(false);
                    } else if (hasRemote) {
                        // Priority 3: remote
                        expect(result).not.toBeNull();
                        expect(result!.type).toBe('remote');
                        expect(result!.isSample).toBe(false);
                    } else {
                        // Priority 4: null
                        expect(result).toBeNull();
                    }
                },
            ),
            { numRuns: 200 },
        );
    });

    it('bundled pages always return bundled type regardless of downloadedPages or baseUrl', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...SAMPLE_PAGES),
                fc.uniqueArray(fc.integer({ min: 1, max: 604 })),
                fc.string(),
                (pageNumber, downloadedArray, baseUrl) => {
                    const result = resolveAudioSource(pageNumber, new Set(downloadedArray), baseUrl);
                    expect(result).not.toBeNull();
                    expect(result!.type).toBe('bundled');
                },
            ),
        );
    });
});
