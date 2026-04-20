import { useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { t } from '../src/constants/i18n';
import { useTheme } from '../src/hooks/useTheme';
import { useStore } from '../src/store';
import type { DownloadItem } from '../src/types/download';

export default function DownloadsScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);

    const queue = useStore((s) => s.queue);
    const downloadedPages = useStore((s) => s.downloadedPages);
    const isQueuePaused = useStore((s) => s.isQueuePaused);
    const cancelDownload = useStore((s) => s.cancelDownload);
    const pauseQueue = useStore((s) => s.pauseQueue);
    const resumeQueue = useStore((s) => s.resumeQueue);
    const enqueueAll = useStore((s) => s.enqueueAll);

    const activeItems = queue.filter((i) => i.status === 'downloading' || i.status === 'queued');
    const queuedCount = queue.filter((i) => i.status === 'queued').length;
    const completedCount = downloadedPages.size;
    const estimatedMB = completedCount;

    function handlePauseResume() {
        if (isQueuePaused) {
            resumeQueue();
        } else {
            pauseQueue();
        }
    }

    function handleDownloadAll() {
        Alert.alert(
            t('downloads_download_all', locale),
            t('downloads_download_all_confirm', locale),
            [
                { text: t('common_cancel', locale), style: 'cancel' },
                {
                    text: t('common_confirm', locale),
                    onPress: () => enqueueAll(),
                },
            ]
        );
    }

    const s = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        scroll: {
            padding: spacing.md,
        },
        card: {
            backgroundColor: palette.surface,
            borderRadius: 12,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: palette.border,
        },
        sectionTitle: {
            fontSize: 13,
            fontWeight: '600',
            color: palette.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: spacing.sm,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: spacing.xs,
        },
        summaryLabel: {
            fontSize: 15,
            color: palette.textSecondary,
        },
        summaryValue: {
            fontSize: 15,
            fontWeight: '600',
            color: palette.text,
        },
        storageText: {
            fontSize: 14,
            color: palette.textSecondary,
            marginTop: spacing.xs,
        },
        downloadItem: {
            marginBottom: spacing.sm,
        },
        itemRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        itemLabel: {
            fontSize: 15,
            color: palette.text,
            flex: 1,
        },
        itemStatus: {
            fontSize: 13,
            color: palette.textSecondary,
            marginRight: spacing.sm,
        },
        cancelBtn: {
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: palette.border,
        },
        cancelBtnText: {
            fontSize: 13,
            color: palette.textSecondary,
        },
        progressTrack: {
            height: 4,
            backgroundColor: palette.border,
            borderRadius: 2,
            overflow: 'hidden',
        },
        progressFill: {
            height: 4,
            backgroundColor: palette.primary,
            borderRadius: 2,
        },
        actionBtn: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: palette.primary,
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        actionBtnText: {
            fontSize: 15,
            fontWeight: '600',
            color: palette.primary,
        },
        downloadAllBtn: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 10,
            backgroundColor: palette.primary,
            alignItems: 'center',
        },
        downloadAllBtnText: {
            fontSize: 15,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        emptyText: {
            fontSize: 16,
            color: palette.text,
            textAlign: 'center',
            marginBottom: spacing.xs,
        },
        emptyHint: {
            fontSize: 14,
            color: palette.textSecondary,
            textAlign: 'center',
        },
        emptyContainer: {
            alignItems: 'center',
            paddingVertical: spacing.lg,
        },
        divider: {
            height: 1,
            backgroundColor: palette.border,
            marginVertical: spacing.sm,
        },
    });

    function renderItem({ item }: { item: DownloadItem }) {
        const progressPct = Math.round(item.progress * 100);
        return (
            <View style={s.downloadItem} accessibilityLabel={`Page ${item.pageNumber}, ${progressPct}%`}>
                <View style={s.itemRow}>
                    <Text style={s.itemLabel}>Page {item.pageNumber}</Text>
                    <Text style={s.itemStatus}>
                        {item.status === 'downloading' ? `${progressPct}%` : item.status}
                    </Text>
                    <Pressable
                        style={s.cancelBtn}
                        onPress={() => cancelDownload(item.pageNumber)}
                        accessibilityRole="button"
                        accessibilityLabel={t('downloads_cancel_download', locale)}
                    >
                        <Text style={s.cancelBtnText}>{t('downloads_cancel_download', locale)}</Text>
                    </Pressable>
                </View>
                <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${progressPct}%` }]} />
                </View>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* Summary */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('downloads_completed', locale)}</Text>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>{t('downloads_queued', locale)}</Text>
                        <Text style={s.summaryValue}>
                            {t('downloads_queued_count', locale).replace('{{count}}', String(queuedCount))}
                        </Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>{t('downloads_completed', locale)}</Text>
                        <Text style={s.summaryValue}>
                            {t('downloads_completed_count', locale).replace('{{count}}', String(completedCount))}
                        </Text>
                    </View>
                    <View style={s.divider} />
                    <Text style={s.storageText}>
                        {t('downloads_storage_used', locale).replace('{{mb}}', String(estimatedMB))}
                    </Text>
                </View>

                {/* Active Downloads */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('downloads_active', locale)}</Text>
                    {activeItems.length === 0 ? (
                        <View style={s.emptyContainer}>
                            <Text style={s.emptyText}>{t('downloads_empty', locale)}</Text>
                            <Text style={s.emptyHint}>{t('downloads_empty_hint', locale)}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={activeItems}
                            keyExtractor={(item) => String(item.pageNumber)}
                            renderItem={renderItem}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                {/* Actions */}
                <View style={s.card}>
                    {activeItems.length > 0 && (
                        <Pressable
                            style={s.actionBtn}
                            onPress={handlePauseResume}
                            accessibilityRole="button"
                        >
                            <Text style={s.actionBtnText}>
                                {isQueuePaused
                                    ? t('downloads_resume_queue', locale)
                                    : t('downloads_pause_queue', locale)}
                            </Text>
                        </Pressable>
                    )}
                    <Pressable
                        style={s.downloadAllBtn}
                        onPress={handleDownloadAll}
                        accessibilityRole="button"
                    >
                        <Text style={s.downloadAllBtnText}>{t('downloads_download_all', locale)}</Text>
                    </Pressable>
                </View>

            </ScrollView>
        </View>
    );
}
