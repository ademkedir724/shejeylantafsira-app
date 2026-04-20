import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { THEMES, typography } from '../constants/theme';
import { getPageMetadata } from '../features/quran/metadata';
import type { ReadingTheme } from '../types/preferences';

// TODO: Replace with actual Tajweed text data when available

const BASMALA = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

export interface MushafTextProps {
    pageNumber: number;
    fontSize: number;
    theme: ReadingTheme;
}

export function MushafText({ pageNumber, fontSize, theme }: MushafTextProps) {
    const meta = getPageMetadata(pageNumber);
    const palette = THEMES[theme];

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        scrollContent: {
            padding: 16,
            alignItems: 'center',
        },
        basmala: {
            fontFamily: typography.arabicFontFamily,
            fontSize: fontSize,
            color: palette.text,
            textAlign: 'center',
            writingDirection: 'rtl',
            lineHeight: fontSize * typography.arabicLineHeight,
            marginBottom: 12,
        },
        surahName: {
            fontFamily: typography.arabicFontFamily,
            fontSize: fontSize + 4,
            color: palette.primary,
            textAlign: 'center',
            writingDirection: 'rtl',
            lineHeight: (fontSize + 4) * typography.arabicLineHeight,
            marginBottom: 8,
        },
        metaText: {
            fontSize: 14,
            color: palette.textSecondary,
            textAlign: 'center',
            marginBottom: 4,
        },
        placeholderText: {
            fontFamily: typography.arabicFontFamily,
            fontSize: fontSize,
            color: palette.text,
            textAlign: 'center',
            writingDirection: 'rtl',
            lineHeight: fontSize * typography.arabicLineHeight,
            flexWrap: 'wrap',
            marginTop: 16,
        },
    });

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsHorizontalScrollIndicator={false}
        >
            {meta.hasBasmala && (
                <Text style={styles.basmala} accessibilityLabel="Basmala">
                    {BASMALA}
                </Text>
            )}

            <Text style={styles.surahName} accessibilityLabel={`Surah ${meta.surahNameEnglish}`}>
                {meta.surahNameArabic}
            </Text>

            <Text style={styles.metaText}>
                {meta.surahNameEnglish} — Ayah {meta.startAyah}–{meta.endAyah}
            </Text>

            <Text style={styles.metaText}>
                Juz {meta.juzNumber} · Page {meta.pageNumber}
            </Text>

            <Text style={styles.placeholderText}>
                {meta.surahNameArabic}
            </Text>
        </ScrollView>
    );
}
