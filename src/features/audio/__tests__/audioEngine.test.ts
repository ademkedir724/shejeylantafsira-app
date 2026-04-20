/**
 * Property-based tests for audio source resolution.
 *
 * Property 3: Audio source resolution is exhaustive and correct
 * Validates: Requirements 9.1, 9.2, 9.3, 9.6
 */

import * as fc from 'fast-check';

// Mock expo-file-system before importing audioEngine
jest.mock('expo-file-system', () => ({
    documentDirectory: 'file:///data/user/0/com.app/files/',
}));

import { SAMPLE_PAGES } from '@/constants/config';
import { resolveAudioSource } from '@/features/audio/audioEngine';

/**
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.6**
 */
describe('Property 3 — Audio source resolution is exhaustive and correct', () => {
    it('returns exactly one of bundled/local/remote/null per priority rules', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 604 }),
                fc.uniqueArray(fc.integer({ min: 1, max: 604 }), { maxLength: 604 }),
                fc.webUrl(),
                (pageNumber, downloadedArray, baseUrl) => {
                    const downloadedPages = new Set(downloadedArray);
                    const result = resolveAudioSource(pageNumber, downloadedPages, baseUrl);

                    const isSample = (SAMPLE_PAGES as readonly number[]).includes(pageNumber);

                    if (isSample) {
                        // Priority 1: bundled
                        expect(result).not.toBeNull();
                        expect(result!.type).toBe('bundled');
                    } else if (downloadedPages.has(pageNumber)) {
                        // Priority 2: local — uri must end with audio/lq/{pageNumber}.mp3
                        expect(result).not.toBeNull();
                        expect(result!.type).toBe('local');
                        const suffix = `audio/lq/${pageNumber}.mp3`;
                        expect(String(result!.uri)).toContain(suffix);
                    } else if (baseUrl.length > 0) {
                        // Priority 3: remote — type must be 'remote' and uri must contain the page path
                        expect(result).not.toBeNull();
                        expect(result!.type).toBe('remote');
                        expect(String(result!.uri)).toContain(`audio/lq/${pageNumber}.mp3`);
                    } else {
                        // Priority 4: null
                        expect(result).toBeNull();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});
