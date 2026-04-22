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

export function updateNowPlaying(surahName: string, pageNumber: number): void {
    void surahName;
    void pageNumber;
}

export function registerMediaSessionHandlers(
    onNext: () => void,
    onPrevious: () => void,
): void {
    void onNext;
    void onPrevious;
}
