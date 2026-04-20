import { t } from '@/constants/i18n/index';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/index';
import type { Bookmark } from '@/types/bookmarks';
import { useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function BookmarksScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);
    const bookmarks = useStore((s) => s.bookmarks);
    const removeBookmark = useStore((s) => s.removeBookmark);

    const sorted = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);

    const handleDelete = (item: Bookmark) => {
        Alert.alert(
            t('bookmarks_remove', locale),
            t('bookmarks_confirm_delete', locale),
            [
                { text: t('bookmarks_cancel', locale), style: 'cancel' },
                {
                    text: t('bookmarks_delete_confirm_button', locale),
                    style: 'destructive',
                    onPress: () => removeBookmark(item.pageNumber),
                },
            ]
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
        },
        emptyText: {
            fontSize: 16,
            color: palette.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.sm,
        },
        emptyHint: {
            fontSize: 14,
            color: palette.textSecondary,
            textAlign: 'center',
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
            backgroundColor: palette.surface,
        },
        rowContent: {
            flex: 1,
        },
        pageLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: palette.text,
            marginBottom: 2,
        },
        surahLabel: {
            fontSize: 14,
            color: palette.text,
            marginBottom: 2,
        },
        metaRow: {
            flexDirection: 'row',
            gap: spacing.sm,
            marginBottom: 2,
        },
        metaText: {
            fontSize: 12,
            color: palette.textSecondary,
        },
        bookmarkLabel: {
            fontSize: 13,
            color: palette.primary,
            fontStyle: 'italic',
        },
        dateText: {
            fontSize: 12,
            color: palette.textSecondary,
        },
        deleteButton: {
            padding: spacing.sm,
            marginLeft: spacing.sm,
        },
        deleteButtonText: {
            fontSize: 13,
            color: '#D32F2F',
            fontWeight: '600',
        },
    });

    const renderItem = ({ item }: { item: Bookmark }) => (
        <Pressable
            style={styles.row}
            onPress={() => router.push(`/page/${item.pageNumber}`)}
            onLongPress={() => handleDelete(item)}
            accessibilityRole="button"
            accessibilityLabel={`Page ${item.pageNumber}, ${item.surahNameEnglish}`}
            accessibilityHint="Long press to delete"
        >
            <View style={styles.rowContent}>
                <Text style={styles.pageLabel}>
                    {t('bookmarks_page_number', locale).replace('{{page}}', String(item.pageNumber))}
                </Text>
                <Text style={styles.surahLabel}>{item.surahNameEnglish}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                        {t('bookmarks_juz_number', locale).replace('{{number}}', String(item.juzNumber))}
                    </Text>
                    <Text style={styles.metaText}>·</Text>
                    <Text style={styles.dateText}>
                        {t('bookmarks_date', locale).replace('{{date}}', formatDate(item.createdAt))}
                    </Text>
                </View>
                {item.label ? (
                    <Text style={styles.bookmarkLabel}>{item.label}</Text>
                ) : null}
            </View>
            <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
                accessibilityRole="button"
                accessibilityLabel={t('bookmarks_remove', locale)}
            >
                <Text style={styles.deleteButtonText}>{t('common_delete', locale)}</Text>
            </Pressable>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sorted}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {t('bookmarks_empty', locale)}
                        </Text>
                        <Text style={styles.emptyHint}>
                            {t('bookmarks_empty_hint', locale)}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
