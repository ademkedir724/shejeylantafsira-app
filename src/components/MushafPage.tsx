/**
 * MushafPage.tsx
 *
 * Renders a single Quran page in Dar al-Maarifah Tajweed Mushaf style.
 *
 * Architecture:
 *  1. Reads line layout from mushafLayout.ts (pre-extracted from .docx files)
 *  2. Loads the per-page QPC font (bundled for p1, downloaded for p2–p604)
 *  3. Renders each line using the page font — glyphs match the printed Mushaf
 *  4. Exposes word-tap callback for future Tajweed / audio-sync features
 *
 * Font strategy:
 *  - Page 1: uses bundled p1.ttf (always available, no download needed)
 *  - Pages 2–604: downloaded from R2 on first visit, cached in documentDirectory
 *  - While font is loading: shows a skeleton placeholder
 *  - If download fails: falls back to p1.ttf with a warning
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Font from 'expo-font';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { R2_BASE_URL } from '../constants/config';
import { THEMES, typography } from '../constants/theme';
import {
    getPageFontName,
    getPageFontUrl,
    getPageLayout,
    isPageFontBundled,
} from '../features/quran/mushafLayout';
import { useTheme } from '../hooks/useTheme';
import type { ReadingTheme } from '../types/preferences';

// ─── Font cache directory ────────────────────────────────────────────────────

const FONT_CACHE_DIR = `${FileSystem.documentDirectory}fonts/`;

async function ensureFontDir(): Promise<void> {
    await FileSystem.makeDirectoryAsync(FONT_CACHE_DIR, { intermediates: true });
}

function getCachedFontPath(pageNumber: number): string {
    return `${FONT_CACHE_DIR}p${pageNumber}.ttf`;
}

// ─── Font loader ─────────────────────────────────────────────────────────────

/**
 * Loads the per-page font.
 * - Page 1: loads from bundled asset
 * - Others: checks cache first, downloads if missing, then loads
 * Returns the font name to use in fontFamily style.
 */
async function loadPageFont(pageNumber: number): Promise<string> {
    const fontName = getPageFontName(pageNumber);

    // Already loaded by expo-font — skip
    if (Font.isLoaded(fontName)) return fontName;

    if (isPageFontBundled(pageNumber)) {
        // Bundled p1.ttf
        await Font.loadAsync({
            [fontName]: require('../../assets/fonts/p1.ttf'),
        });
        return fontName;
    }

    // Check local cache
    const cachedPath = getCachedFontPath(pageNumber);
    await ensureFontDir();
    const info = await FileSystem.getInfoAsync(cachedPath);

    if (!info.exists) {
        // Download from R2
        const url = getPageFontUrl(pageNumber, R2_BASE_URL);
        if (!R2_BASE_URL) {
            // No remote URL — fall back to p1
            return getPageFontName(1);
        }
        const dl = FileSystem.createDownloadResumable(url, cachedPath);
        const result = await dl.downloadAsync();
        if (!result || result.status !== 200) {
            return getPageFontName(1); // fallback
        }
    }

    await Font.loadAsync({ [fontName]: cachedPath });
    return fontName;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface MushafPageProps {
    pageNumber: number;
    fontSize?: number;
    theme?: ReadingTheme;
    /** Called when a word is tapped — for future Tajweed / audio sync */
    onWordTap?: (lineIndex: number, wordIndex: number, text: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MushafPage({
    pageNumber,
    fontSize,
    theme,
    onWordTap,
}: MushafPageProps) {
    const { palette, spacing } = useTheme();
    const activeTheme = theme ?? 'light';
    const activePalette = THEMES[activeTheme];
    const activeFontSize = fontSize ?? typography.arabicMinSize;

    const [fontName, setFontName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const layout = getPageLayout(pageNumber);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setFontName(null);

        loadPageFont(pageNumber)
            .then((name) => {
                if (!cancelled) {
                    setFontName(name);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    // Fallback to page 1 font
                    setFontName(getPageFontName(1));
                    setError(`Font load failed: ${err?.message ?? 'unknown'}`);
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [pageNumber]);

    const handleWordTap = useCallback(
        (lineIndex: number, wordIndex: number, text: string) => {
            onWordTap?.(lineIndex, wordIndex, text);
        },
        [onWordTap],
    );

    const styles = makeStyles(activePalette, activeFontSize, spacing);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={activePalette.primary} />
                <Text style={styles.loadingText}>
                    {pageNumber === 1 ? 'Loading...' : `Loading page font ${pageNumber}...`}
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {layout.lines.map((line, lineIndex) => (
                <MushafLine
                    key={lineIndex}
                    line={line}
                    lineIndex={lineIndex}
                    fontName={fontName!}
                    fontSize={activeFontSize}
                    color={activePalette.text}
                    onWordTap={onWordTap ? handleWordTap : undefined}
                />
            ))}
        </ScrollView>
    );
}

// ─── MushafLine ───────────────────────────────────────────────────────────────

interface MushafLineProps {
    line: string;
    lineIndex: number;
    fontName: string;
    fontSize: number;
    color: string;
    onWordTap?: (lineIndex: number, wordIndex: number, text: string) => void;
}

function MushafLine({
    line,
    lineIndex,
    fontName,
    fontSize,
    color,
    onWordTap,
}: MushafLineProps) {
    // Split line into individual words (space-separated QPC tokens)
    const words = line.split(' ').filter(Boolean);

    if (!onWordTap) {
        // Fast path: render the whole line as one Text node
        return (
            <Text
                style={{
                    fontFamily: fontName,
                    fontSize,
                    color,
                    textAlign: 'center',
                    writingDirection: 'rtl',
                    lineHeight: fontSize * typography.arabicLineHeight,
                    marginVertical: 2,
                }}
                accessibilityLabel={`Line ${lineIndex + 1}`}
            >
                {line}
            </Text>
        );
    }

    // Interactive path: each word is a separate tappable Text
    return (
        <Text
            style={{
                textAlign: 'center',
                writingDirection: 'rtl',
                marginVertical: 2,
                flexWrap: 'wrap',
                flexDirection: 'row',
            }}
        >
            {words.map((word, wordIndex) => (
                <Text
                    key={wordIndex}
                    onPress={() => onWordTap(lineIndex, wordIndex, word)}
                    style={{
                        fontFamily: fontName,
                        fontSize,
                        color,
                        lineHeight: fontSize * typography.arabicLineHeight,
                        paddingHorizontal: 2,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Word ${wordIndex + 1} on line ${lineIndex + 1}`}
                >
                    {word}{' '}
                </Text>
            ))}
        </Text>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(
    palette: ReturnType<typeof THEMES['light']['background'] extends string ? () => typeof THEMES['light'] : never>,
    fontSize: number,
    spacing: { sm: number; md: number },
) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: (palette as any).background,
        },
        content: {
            paddingHorizontal: (spacing as any).md ?? 16,
            paddingVertical: (spacing as any).sm ?? 8,
            alignItems: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
        },
        loadingText: {
            fontSize: 14,
            color: (palette as any).textSecondary,
        },
        errorText: {
            fontSize: 12,
            color: '#cc4444',
            marginBottom: 8,
            textAlign: 'center',
        },
    });
}
