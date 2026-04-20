import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store';

interface DownloadButtonProps {
    pageNumber: number;
}

export function DownloadButton({ pageNumber }: DownloadButtonProps) {
    const { palette } = useTheme();
    const downloadedPages = useStore((s) => s.downloadedPages);
    const queue = useStore((s) => s.queue);
    const enqueueDownload = useStore((s) => s.enqueueDownload);

    const queueItem = queue.find((item) => item.pageNumber === pageNumber);
    const isDownloaded = downloadedPages.has(pageNumber);
    const isDownloading = queueItem?.status === 'downloading';
    const isQueued = queueItem?.status === 'queued';
    const isError = queueItem?.status === 'error';
    const progress = queueItem?.progress ?? 0;

    if (isDownloaded) {
        return (
            <View style={styles.container}>
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            </View>
        );
    }

    if (isDownloading) {
        const percent = Math.round(progress * 100);
        return (
            <View style={[styles.container, styles.progressContainer, { borderColor: palette.primary }]}>
                <Text style={[styles.progressText, { color: palette.primary }]}>{percent}%</Text>
            </View>
        );
    }

    if (isQueued) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={palette.primary} />
            </View>
        );
    }

    if (isError) {
        return (
            <TouchableOpacity
                style={styles.container}
                onPress={() => enqueueDownload(pageNumber)}
                accessibilityLabel="Retry download"
                accessibilityRole="button"
            >
                <Ionicons name="warning" size={28} color="#F44336" />
            </TouchableOpacity>
        );
    }

    // Not downloaded
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => enqueueDownload(pageNumber)}
            accessibilityLabel="Download for offline listening"
            accessibilityRole="button"
        >
            <Ionicons name="download-outline" size={28} color={palette.primary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
    },
    progressText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
