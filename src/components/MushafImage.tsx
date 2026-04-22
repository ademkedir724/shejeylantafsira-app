/**
 * MushafImage.tsx
 *
 * Displays a Quran page as a scanned image from assets/quran-image/.
 *
 * Images are bundled as static require() calls — Metro requires this.
 * Add images to assets/quran-image/ named 1.png through 604.png,
 * then run the generate script to populate BUNDLED_PAGE_IMAGES below.
 *
 * Until images are added, a placeholder is shown.
 */

import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

// ─── Static image map ────────────────────────────────────────────────────────
// Populated once you add images to assets/quran-image/
// Each entry: pageNumber → require('../../../assets/quran-image/{n}.png')

const BUNDLED_PAGE_IMAGES: Record<number, ReturnType<typeof require>> = {
    // Images will be added here after you provide the quran-image folder
};

// ─── Props ───────────────────────────────────────────────────────────────────

export interface MushafImageProps {
    pageNumber: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MushafImage({ pageNumber }: MushafImageProps) {
    const { palette } = useTheme();
    const source = BUNDLED_PAGE_IMAGES[pageNumber];

    if (!source) {
        // Placeholder shown until images are bundled
        return (
            <View style={[styles.placeholder, { backgroundColor: palette.background }]}>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={[styles.placeholderText, { color: palette.textSecondary }]}>
                    Page {pageNumber}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image
                source={source}
                contentFit="contain"
                style={styles.image}
                accessibilityLabel={`Mushaf page ${pageNumber}`}
                transition={150}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        width: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    placeholderText: {
        fontSize: 14,
    },
});
