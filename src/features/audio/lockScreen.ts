import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

/**
 * Call once at app startup (from app/_layout.tsx) to enable background audio
 * and silent-mode playback on iOS.
 */
export async function initLockScreen(): Promise<void> {
    await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
    });
}

/**
 * Update the OS "Now Playing" metadata shown on the lock screen.
 *
 * NOTE: expo-av does not expose a full media session / NowPlayingInfo API.
 * Full lock screen metadata (title, artist, artwork) requires either
 * react-native-track-player or a custom native module. This is a no-op stub
 * that documents the intended interface for a future native integration.
 */
export function updateNowPlaying(surahName: string, pageNumber: number): void {
    // Stub — full implementation requires a native module or expo-av's
    // built-in track player integration (e.g. react-native-track-player).
    // Intended metadata:
    //   title:  `${surahName} — Page ${pageNumber}`
    //   artist: 'Sheikh Jeylan'
    void surahName;
    void pageNumber;
}

/**
 * Register OS media session next/previous handlers (lock screen transport controls).
 *
 * NOTE: expo-av does not expose media session action handlers directly.
 * Full implementation requires a native module. This stub logs the handlers
 * so the wiring is in place for a future native integration.
 */
export function registerMediaSessionHandlers(
    onNext: () => void,
    onPrevious: () => void,
): void {
    // Stub — full implementation requires a native module.
    // When integrated, onNext should dispatch setCurrentPage(currentPage + 1)
    // and onPrevious should dispatch setCurrentPage(currentPage - 1).
    void onNext;
    void onPrevious;
}
