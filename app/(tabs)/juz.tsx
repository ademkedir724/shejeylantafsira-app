import { t } from '@/constants/i18n/index';
import { getAllJuz } from '@/features/quran/index';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/index';
import type { JuzInfo } from '@/types/quran';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const JUZ_DATA = getAllJuz();

export default function JuzScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);
    const enqueueJuz = useStore((s) => s.enqueueJuz);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
            backgroundColor: palette.surface,
            marginHorizontal: spacing.sm,
            marginTop: spacing.xs,
            borderRadius: 8,
        },
        info: {
            flex: 1,
            marginRight: spacing.sm,
        },
        juzNumber: {
            fontSize: 16,
            fontWeight: '700',
            color: palette.primary,
        },
        arabicName: {
            fontSize: 18,
            color: palette.text,
            textAlign: 'right',
            marginTop: 2,
        },
        englishName: {
            fontSize: 14,
            color: palette.textSecondary,
            marginTop: 2,
        },
        pageLabel: {
            fontSize: 12,
            color: palette.textSecondary,
            marginTop: 2,
        },
        downloadButton: {
            backgroundColor: palette.primary,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 6,
        },
        downloadButtonText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
        },
    });

    const renderItem = ({ item }: { item: JuzInfo }) => {
        const juzLabel = t('juz_number', locale).replace('{{number}}', String(item.juzNumber));
        const pageLabel = t('juz_starts_at', locale).replace('{{page}}', String(item.startPage));
        const downloadLabel = t('juz_download_button', locale).replace('{{number}}', String(item.juzNumber));

        return (
            <Pressable
                style={styles.row}
                onPress={() => router.push(`/page/${item.startPage}`)}
                accessibilityRole="button"
                accessibilityLabel={`${juzLabel}, ${pageLabel}`}
            >
                <View style={styles.info}>
                    <Text style={styles.juzNumber}>{juzLabel}</Text>
                    <Text style={styles.arabicName}>{item.startSurahNameArabic}</Text>
                    <Text style={styles.englishName}>{item.startSurahNameEnglish}</Text>
                    <Text style={styles.pageLabel}>{pageLabel}</Text>
                </View>
                <Pressable
                    style={styles.downloadButton}
                    onPress={() => enqueueJuz(item.juzNumber)}
                    accessibilityRole="button"
                    accessibilityLabel={downloadLabel}
                >
                    <Text style={styles.downloadButtonText}>{downloadLabel}</Text>
                </Pressable>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={JUZ_DATA}
                keyExtractor={(item) => String(item.juzNumber)}
                renderItem={renderItem}
                contentContainerStyle={{ paddingVertical: spacing.xs }}
            />
        </View>
    );
}
