import { useAudioPlayer, useAudioPlayerStatus, type AudioSource as ExpoAudioSource } from 'expo-audio';
import { useCallback, useEffect } from 'react';
import { R2_BASE_URL } from '../constants/config';
import { resolveAudioSource } from '../features/audio/audioEngine';
import useStore from '../store';

export function useAudioEngine() {
    const player = useAudioPlayer();
    const status = useAudioPlayerStatus(player);

    const downloadedPages = useStore((s) => s.downloadedPages);
    const playbackSpeed = useStore((s) => s.audio.playbackSpeed);

    const setAudioPage = useStore((s) => s.setAudioPage);
    const setAudioSource = useStore((s) => s.setAudioSource);
    const setPlaying = useStore((s) => s.setPlaying);
    const setPosition = useStore((s) => s.setPosition);
    const setDuration = useStore((s) => s.setDuration);
    const setAudioError = useStore((s) => s.setAudioError);

    // Sync player status → store (expo-audio uses seconds, store uses ms)
    useEffect(() => {
        setPlaying(status.playing);
    }, [status.playing, setPlaying]);

    useEffect(() => {
        setPosition(status.currentTime * 1000);
    }, [status.currentTime, setPosition]);

    useEffect(() => {
        if (status.duration > 0 && isFinite(status.duration)) {
            setDuration(status.duration * 1000);
        }
    }, [status.duration, setDuration]);

    // Clear loading state as soon as the player reports it's loaded,
    // even if duration hasn't been reported yet (handles bundled assets on device)
    useEffect(() => {
        if (status.isLoaded) {
            // If duration is already known, set it; otherwise just clear loading
            const dur = status.duration;
            if (dur > 0 && isFinite(dur)) {
                setDuration(dur * 1000);
            } else {
                // Clear loading without overwriting duration
                setDuration(0);
            }
        }
    }, [status.isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadPage = useCallback(
        async (pageNumber: number) => {
            try {
                player.pause();
                setAudioPage(pageNumber);

                const source = resolveAudioSource(pageNumber, downloadedPages, R2_BASE_URL);
                if (!source) {
                    setAudioError('No audio source available for this page');
                    return;
                }
                setAudioSource(source);

                // expo-audio accepts a number (require asset) or { uri: string }
                // For bundled assets the require() returns a number on native
                let audioSource: ExpoAudioSource;
                if (source.type === 'bundled') {
                    // Pass the numeric asset ID directly — expo-audio resolves it natively
                    audioSource = source.uri as number;
                } else {
                    audioSource = { uri: source.uri as string };
                }

                player.replace(audioSource);
                player.setPlaybackRate(playbackSpeed);
            } catch (err) {
                setAudioError(err instanceof Error ? err.message : 'Failed to load audio');
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [downloadedPages, playbackSpeed, player],
    );

    const play = useCallback(() => {
        try { player.play(); }
        catch (err) { setAudioError(err instanceof Error ? err.message : 'Playback error'); }
    }, [player, setAudioError]);

    const pause = useCallback(() => {
        try { player.pause(); }
        catch (err) { setAudioError(err instanceof Error ? err.message : 'Pause error'); }
    }, [player, setAudioError]);

    const seekTo = useCallback(
        (ms: number) => {
            try { player.seekTo(ms / 1000); } // expo-audio uses seconds
            catch (err) { setAudioError(err instanceof Error ? err.message : 'Seek error'); }
        },
        [player, setAudioError],
    );

    const setSpeed = useCallback(
        (speed: number) => {
            try { player.setPlaybackRate(speed); }
            catch (err) { setAudioError(err instanceof Error ? err.message : 'Speed error'); }
        },
        [player, setAudioError],
    );

    const release = useCallback(() => {
        try {
            player.pause();
            player.remove();
        } catch {
            // Ignore cleanup errors
        }
    }, [player]);

    return { loadPage, play, pause, seekTo, setSpeed, release };
}
