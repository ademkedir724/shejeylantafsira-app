import { setAudioModeAsync } from 'expo-audio';

/**
 * Call once at app startup to enable background audio and silent-mode playback.
 */
export async function initLockScreen(): Promise<void> {
    await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
    });
}

export function updateNowPlaying(_surahName: string, _pageNumber: number): void {
    // Future: update lock screen metadata
}

export function registerMediaSessionHandlers(
    _onNext: () => void,
    _onPrevious: () => void,
): void {
    // Future: register media session handlers
}
