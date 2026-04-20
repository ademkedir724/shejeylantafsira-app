import type { ReadingTheme } from '../types/preferences';

export interface ThemePalette {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    accent: string;
    audioPlayerBg: string;
    headerBg: string;
}

const light: ThemePalette = {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    primary: '#1B5E20',
    accent: '#4CAF50',
    audioPlayerBg: '#F0F0F0',
    headerBg: '#FFFFFF',
};

const dark: ThemePalette = {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#E8E8E8',
    textSecondary: '#9E9E9E',
    border: '#333333',
    primary: '#81C784',
    accent: '#66BB6A',
    audioPlayerBg: '#1E1E1E',
    headerBg: '#1A1A1A',
};

const sepia: ThemePalette = {
    background: '#F4ECD8',
    surface: '#EDE0C4',
    text: '#3B2A1A',
    textSecondary: '#7A5C3A',
    border: '#C8B89A',
    primary: '#6D4C41',
    accent: '#8D6E63',
    audioPlayerBg: '#EDE0C4',
    headerBg: '#F4ECD8',
};

const paper: ThemePalette = {
    background: '#FAFAF7',
    surface: '#F0F0EB',
    text: '#2C2C2C',
    textSecondary: '#5A5A5A',
    border: '#D8D8D0',
    primary: '#37474F',
    accent: '#546E7A',
    audioPlayerBg: '#F0F0EB',
    headerBg: '#FAFAF7',
};

export const THEMES: Record<ReadingTheme, ThemePalette> = {
    light,
    dark,
    sepia,
    paper,
};

export const typography = {
    arabicFontFamily: 'KFGQPCUthmanicScript',
    arabicFontSizeMin: 20,
    arabicFontSizeMax: 36,
    arabicLineHeight: 1.8,
    uiFontSizeBase: 16,
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
} as const;
