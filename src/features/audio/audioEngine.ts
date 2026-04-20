import * as FileSystem from 'expo-file-system';
import { SAMPLE_PAGES, buildLqUrl } from '../../constants/config';
import type { AudioSource } from '../../types/audio';

// Bundled assets map — require() calls must be static
const BUNDLED_ASSETS: Record<number, number> = {
    1: require('../../../assets/audio/samples/1.mp3'),
    2: require('../../../assets/audio/samples/2.mp3'),
    3: require('../../../assets/audio/samples/3.mp3'),
};

/**
 * Pure function — no side effects.
 *
 * Priority 1: bundled sample (pages 1, 2, 3)
 * Priority 2: locally downloaded LQ file
 * Priority 3: remote stream (when baseUrl is non-empty)
 * Priority 4: null (no source available)
 */
export function resolveAudioSource(
    pageNumber: number,
    downloadedPages: Set<number>,
    baseUrl: string,
): AudioSource | null {
    // Priority 1 — bundled
    if ((SAMPLE_PAGES as readonly number[]).includes(pageNumber)) {
        return {
            type: 'bundled',
            uri: BUNDLED_ASSETS[pageNumber],
            isSample: true,
        };
    }

    // Priority 2 — local
    if (downloadedPages.has(pageNumber)) {
        return {
            type: 'local',
            uri: `${FileSystem.documentDirectory}audio/lq/${pageNumber}.mp3`,
            isSample: false,
        };
    }

    // Priority 3 — remote
    if (baseUrl.length > 0) {
        return {
            type: 'remote',
            uri: buildLqUrl(pageNumber),
            isSample: false,
        };
    }

    // Priority 4 — no source
    return null;
}
