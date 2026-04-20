import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { t } from '../constants/i18n';
import { useNetworkState } from '../hooks/useNetworkState';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store';

interface OfflineBannerProps {
    pageNumber: number;
}

export function OfflineBanner({ pageNumber }: OfflineBannerProps) {
    const { isConnected } = useNetworkState();
    const { spacing } = useTheme();
    const downloadedPages = useStore((s) => s.downloadedPages);
    const locale = useStore((s) => s.preferences.uiLanguage);

    if (isConnected) {
        return null;
    }

    const isPageDownloaded = downloadedPages.has(pageNumber);

    return (
        <View style={[styles.banner, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
            <Text style={styles.text}>{t('offline_no_internet', locale)}</Text>
            {!isPageDownloaded && (
                <Text style={styles.text}>{t('offline_download_to_listen', locale)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#FFF176',
        width: '100%',
    },
    text: {
        color: '#5D4037',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
});
