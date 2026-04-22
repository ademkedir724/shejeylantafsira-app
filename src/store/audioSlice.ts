import type { StateCreator } from 'zustand';
import type { AudioSource, AudioState } from '../types/audio';
import type { PlaybackSpeed } from '../types/preferences';

export interface AudioSlice {
    audio: AudioState;
    setAudioPage: (pageNumber: number) => void;
    setAudioSource: (source: AudioSource | null) => void;
    setPlaying: (isPlaying: boolean) => void;
    setPosition: (positionMs: number) => void;
    setDuration: (durationMs: number) => void;
    setPlaybackSpeed: (speed: PlaybackSpeed) => void;
    toggleRepeat: () => void;
    setSleepTimer: (ms: number | null) => void;
    setAudioError: (error: string | null) => void;
    resetAudio: () => void;
}

const initialAudioState: AudioState = {
    pageNumber: null,
    isPlaying: false,
    isLoading: false,
    positionMs: 0,
    durationMs: 0,
    playbackSpeed: 1.0,
    isRepeat: false,
    sleepTimerMs: null,
    source: null,
    error: null,
};

export const createAudioSlice: StateCreator<
    AudioSlice,
    [['zustand/immer', never]],
    [],
    AudioSlice
> = (set) => ({
    audio: initialAudioState,

    setAudioPage: (pageNumber) =>
        set((state) => {
            state.audio.pageNumber = pageNumber;
            state.audio.isPlaying = false;
            state.audio.isLoading = true;
            state.audio.positionMs = 0;
            state.audio.durationMs = 0;
            state.audio.source = null;
            state.audio.error = null;
        }),

    setAudioSource: (source) =>
        set((state) => {
            state.audio.source = source;
        }),

    setPlaying: (isPlaying) =>
        set((state) => {
            state.audio.isPlaying = isPlaying;
        }),

    setPosition: (positionMs) =>
        set((state) => {
            state.audio.positionMs = positionMs;
        }),

    setDuration: (durationMs) =>
        set((state) => {
            state.audio.durationMs = durationMs;
            state.audio.isLoading = false;
        }),

    setPlaybackSpeed: (speed) =>
        set((state) => {
            state.audio.playbackSpeed = speed;
        }),

    toggleRepeat: () =>
        set((state) => {
            state.audio.isRepeat = !state.audio.isRepeat;
        }),

    setSleepTimer: (ms) =>
        set((state) => {
            state.audio.sleepTimerMs = ms;
        }),

    setAudioError: (error) =>
        set((state) => {
            state.audio.error = error;
            state.audio.isLoading = false;
            state.audio.isPlaying = false;
        }),

    resetAudio: () =>
        set((state) => {
            state.audio = { ...initialAudioState };
        }),
});
