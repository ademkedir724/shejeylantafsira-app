import { t } from '@/constants/i18n/index';
import { defaultSearchProvider, type SearchResult } from '@/features/search/index';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/index';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const TYPE_BADGE_COLORS: Record<SearchResult['type'], string> = {
    page: '#4A90D9',
    juz: '#7B68EE',
    surah: '#2ECC71',
};

export default function SearchScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const inputRef = useRef<TextInput>(null);

    // Auto-focus on mount
    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleChangeText = useCallback((text: string) => {
        setQuery(text);
        setResults(defaultSearchProvider.search(text));
    }, []);

    const handleResultPress = useCallback(
        (result: SearchResult) => {
            router.push(`/page/${result.pageNumber}`);
        },
        [router],
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            margin: spacing.md,
            paddingHorizontal: spacing.sm,
            backgroundColor: palette.surface,
            borderRadius: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border,
        },
        input: {
            flex: 1,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.xs,
            fontSize: 16,
            color: palette.text,
        },
        clearButton: {
            paddingHorizontal: spacing.xs,
            paddingVertical: spacing.xs,
        },
        clearText: {
            fontSize: 14,
            color: palette.textSecondary,
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
        rowInfo: {
            flex: 1,
        },
        label: {
            fontSize: 15,
            fontWeight: '600',
            color: palette.text,
        },
        sublabel: {
            fontSize: 13,
            color: palette.textSecondary,
            marginTop: 2,
        },
        badge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            marginLeft: spacing.sm,
        },
        badgeText: {
            fontSize: 11,
            fontWeight: '700',
            color: '#FFFFFF',
            textTransform: 'capitalize',
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: spacing.xl ?? 40,
        },
        emptyText: {
            fontSize: 15,
            color: palette.textSecondary,
        },
    });

    const renderItem = ({ item }: { item: SearchResult }) => (
        <Pressable
            style={styles.row}
            onPress={() => handleResultPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.label}${item.sublabel ? ', ' + item.sublabel : ''}, ${item.type}`}
        >
            <View style={styles.rowInfo}>
                <Text style={styles.label}>{item.label}</Text>
                {item.sublabel ? (
                    <Text style={styles.sublabel}>{item.sublabel}</Text>
                ) : null}
            </View>
            <View style={[styles.badge, { backgroundColor: TYPE_BADGE_COLORS[item.type] }]}>
                <Text style={styles.badgeText}>{item.type}</Text>
            </View>
        </Pressable>
    );

    const showEmpty = query.trim().length > 0 && results.length === 0;

    return (
        <View style={styles.container}>
            <View style={styles.inputWrapper}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={query}
                    onChangeText={handleChangeText}
                    placeholder={t('search_placeholder', locale)}
                    placeholderTextColor={palette.textSecondary}
                    returnKeyType="search"
                    clearButtonMode="never"
                    autoCorrect={false}
                    autoCapitalize="none"
                    accessibilityLabel={t('search_placeholder', locale)}
                />
                {query.length > 0 && (
                    <Pressable
                        style={styles.clearButton}
                        onPress={() => handleChangeText('')}
                        accessibilityRole="button"
                        accessibilityLabel={t('search_clear', locale)}
                    >
                        <Text style={styles.clearText}>✕</Text>
                    </Pressable>
                )}
            </View>

            {showEmpty ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('search_no_results', locale)}</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => `${item.type}-${item.pageNumber}-${index}`}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: spacing.md }}
                />
            )}
        </View>
    );
}
