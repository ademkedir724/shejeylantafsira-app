import { Audio, type AVPlaybackStatus } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { R2_BASE_URL } from '../constants/config';
import { resolveAudioSource } from '../features/audio/audioEngine';
import useStore from '../store';

export function useAudioEngine() {
    const soundRef = useRef<Audio.Sound | null>(null);

    const downloadedPages = useStore((s) => s.downloadedPages);
    const playbackSpeed = useStore((s) => s.audio.playbackSpeed);

    const setAudioPage = useStore((s) => s.setAudioPage);
    const setPlaying = useStore((s) => s.setPlaying);
    const setPosition = useStore((s) => s.setPosition);
    const setDuration = useStore((s) => s.setDuration);
    const setAudioError = useStore((s) => s.setAudioError);

    // Configure audio mode for silent-mode iOS playback on mount (Req 8.10)
    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        }).catch(() => {
            // Non-fatal — audio will still work without silent mode
        });

        return () => {
            // Release sound on unmount
            soundRef.current?.unloadAsync().catch(() => { });
            soundRef.current = null;
        };
    }, []);

    const onPlaybackStatusUpdate = useCallback(
        (status: AVPlaybackStatus) => {
            if (!status.isLoaded) {
                if (status.error) {
                    setAudioError(status.error);
                }
                return;
            }

            setPosition(status.positionMillis);

            if (status.durationMillis != null) {
                setDuration(status.durationMillis);
            }

            setPlaying(status.isPlaying);
        },
        [setAudioError, setPosition, setDuration, setPlaying],
    );

    const loadPage = useCallback(
        async (pageNumber: number) => {
            try {
                // Unload previous sound
                if (soundRef.current) {
                    await soundRef.current.unloadAsync();
                    soundRef.current = null;
                }

                setAudioPage(pageNumber);

                const source = resolveAudioSource(pageNumber, downloadedPages, R2_BASE_URL);

                if (!source) {
                    setAudioError('No audio source available for this page');
                    return;
                }

                const assetSource =
                    source.type === 'bundled'
                        ? (source.uri as number)
                        : { uri: source.uri as string };

                const { sound } = await Audio.Sound.createAsync(
                    assetSource,
                    {
                        shouldPlay: false,
                        rate: playbackSpeed,
                        progressUpdateIntervalMillis: 500,
                    },
                    onPlaybackStatusUpdate,
                );

                soundRef.current = sound;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load audio';
                setAudioError(message);
            }
        },
        [downloadedPages, playbackSpeed, setAudioPage, setAudioError, onPlaybackStatusUpdate],
    );

    const play = useCallback(async () => {
        try {
            await soundRef.current?.playAsync();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Playback error';
            setAudioError(message);
        }
    }, [setAudioError]);

    const pause = useCallback(async () => {
        try {
            await soundRef.current?.pauseAsync();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Pause error';
            setAudioError(message);
        }
    }, [setAudioError]);

    const seekTo = useCallback(
        async (ms: number) => {
            try {
                await soundRef.current?.setPositionAsync(ms);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Seek error';
                setAudioError(message);
            }
        },
        [setAudioError],
    );

    const setSpeed = useCallback(
        async (speed: number) => {
            try {
                await soundRef.current?.setRateAsync(speed, true);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Speed change error';
                setAudioError(message);
            }
        },
        [setAudioError],
    );

    const release = useCallback(async () => {
        try {
            await soundRef.current?.unloadAsync();
            soundRef.current = null;
        } catch {
            // Ignore errors on release
        }
    }, []);

    return { loadPage, play, pause, seekTo, setSpeed, release };
}
