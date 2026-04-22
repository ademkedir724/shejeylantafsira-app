import type { StateCreator } from 'zustand';
import type { PlaybackSpeed, ReadingTheme, UILanguage, UserPreferences } from '../types/preferences';

export interface PreferencesSlice {
    preferences: UserPreferences;
    setTheme: (theme: ReadingTheme) => void;
    setAutoAdvance: (enabled: boolean) => void;
    setPlaybackSpeed: (speed: PlaybackSpeed) => void;
    setUILanguage: (lang: UILanguage) => void;
    setWifiOnlyDownload: (enabled: boolean) => void;
    setLastReadPage: (page: number) => void;
}

const defaultPreferences: UserPreferences = {
    theme: 'light',
    autoAdvance: false,
    playbackSpeed: 1.0,
    uiLanguage: 'om',
    wifiOnlyDownload: true,
    lastReadPage: undefined,
};

export const createPreferencesSlice: StateCreator<
    PreferencesSlice,
    [['zustand/immer', never]],
    [],
    PreferencesSlice
> = (set) => ({
    preferences: defaultPreferences,

    setTheme: (theme) =>
        set((state) => {
            state.preferences.theme = theme;
        }),

    setAutoAdvance: (enabled) =>
        set((state) => {
            state.preferences.autoAdvance = enabled;
        }),

    setPlaybackSpeed: (speed) =>
        set((state) => {
            state.preferences.playbackSpeed = speed;
        }),

    setUILanguage: (lang) =>
        set((state) => {
            state.preferences.uiLanguage = lang;
        }),

    setWifiOnlyDownload: (enabled) =>
        set((state) => {
            state.preferences.wifiOnlyDownload = enabled;
        }),

    setLastReadPage: (page) =>
        set((state) => {
            state.preferences.lastReadPage = page;
        }),
});
