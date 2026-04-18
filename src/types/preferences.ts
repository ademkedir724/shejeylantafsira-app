export type ReadingTheme = 'light' | 'dark' | 'sepia' | 'paper';
export type UILanguage = 'om' | 'en' | 'ar';
export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface UserPreferences {
    theme: ReadingTheme;
    fontSize: number;             // 16–36, step 2
    mushafImageMode: boolean;
    autoAdvance: boolean;
    playbackSpeed: PlaybackSpeed;
    uiLanguage: UILanguage;
    wifiOnlyDownload: boolean;
    lastReadPage?: number;
}
