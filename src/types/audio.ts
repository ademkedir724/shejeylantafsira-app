import type { PlaybackSpeed } from './preferences';

export type AudioSourceType = 'bundled' | 'local' | 'remote';

export interface AudioSource {
    type: AudioSourceType;
    uri: string | number;         // number for require() bundled assets
    isSample: boolean;
}

export interface AudioState {
    pageNumber: number | null;
    isPlaying: boolean;
    isLoading: boolean;
    positionMs: number;
    durationMs: number;
    playbackSpeed: PlaybackSpeed;
    isRepeat: boolean;
    sleepTimerMs: number | null;  // null = no timer
    source: AudioSource | null;
    error: string | null;
}
