import { t } from '@/constants/i18n/index';
import { getAllSurahs } from '@/features/quran/index';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/index';
import type { SurahInfo } from '@/types/quran';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const SURAH_DATA = getAllSurahs();

export default function SurahScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
            backgroundColor: palette.surface,
            marginHorizontal: spacing.sm,
            marginTop: spacing.xs,
            borderRadius: 8,
        },
        numberBadge: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: palette.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
        },
        numberText: {
            fontSize: 13,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        info: {
            flex: 1,
        },
        englishName: {
            fontSize: 15,
            fontWeight: '600',
            color: palette.text,
        },
        meta: {
            fontSize: 12,
            color: palette.textSecondary,
            marginTop: 2,
        },
        arabicName: {
            fontSize: 20,
            color: palette.text,
            textAlign: 'right',
            marginLeft: spacing.sm,
        },
    });

    const renderItem = ({ item }: { item: SurahInfo }) => {
        const ayahsLabel = t('surah_total_ayahs', locale).replace('{{count}}', String(item.totalAyahs));
        const pageLabel = t('surah_starts_at_page', locale).replace('{{page}}', String(item.startPage));

        return (
            <Pressable
                style={styles.row}
                onPress={() => router.push(`/page/${item.startPage}`)}
                accessibilityRole="button"
                accessibilityLabel={`Surah ${item.surahNumber}, ${item.nameEnglish}, ${ayahsLabel}, ${pageLabel}`}
            >
                <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{item.surahNumber}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.englishName}>{item.nameEnglish}</Text>
                    <Text style={styles.meta}>{ayahsLabel} · {pageLabel}</Text>
                </View>
                <Text style={styles.arabicName}>{item.nameArabic}</Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* TODO: Search bar — Req 13.5 */}
            <FlatList
                data={SURAH_DATA}
                keyExtractor={(item) => String(item.surahNumber)}
                renderItem={renderItem}
                contentContainerStyle={{ paddingVertical: spacing.xs }}
            />
        </View>
    );
}
