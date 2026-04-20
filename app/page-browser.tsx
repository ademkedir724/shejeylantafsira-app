import { t } from '@/constants/i18n/index';
import { PAGES_DATA } from '@/features/quran/data/pages';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/index';
import type { PageMetadata } from '@/types/quran';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function PageBrowserScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);

    const [inputValue, setInputValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const inputRef = useRef<TextInput>(null);

    function handleGo() {
        const num = parseInt(inputValue, 10);
        if (!inputValue.trim() || isNaN(num) || !Number.isInteger(num) || num < 1 || num > 604) {
            setErrorMessage(t('page_browser_invalid', locale));
            return;
        }
        setErrorMessage('');
        router.push(`/page/${num}`);
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.xs,
            gap: spacing.sm,
            backgroundColor: palette.surface,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
        },
        textInput: {
            flex: 1,
            height: 44,
            borderWidth: 1,
            borderColor: errorMessage ? '#E53E3E' : palette.border,
            borderRadius: 8,
            paddingHorizontal: spacing.sm,
            fontSize: 16,
            color: palette.text,
            backgroundColor: palette.background,
        },
        goButton: {
            height: 44,
            paddingHorizontal: spacing.md,
            backgroundColor: palette.primary,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        goButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        errorText: {
            color: '#E53E3E',
            fontSize: 13,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            backgroundColor: palette.surface,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
        },
        pageNumber: {
            width: 44,
            fontSize: 15,
            fontWeight: '700',
            color: palette.primary,
        },
        rowInfo: {
            flex: 1,
        },
        arabicName: {
            fontSize: 16,
            color: palette.text,
            textAlign: 'right',
        },
        englishName: {
            fontSize: 13,
            color: palette.textSecondary,
            marginTop: 1,
        },
        juzLabel: {
            fontSize: 12,
            color: palette.textSecondary,
            marginTop: 1,
        },
    });

    const renderItem = ({ item }: { item: PageMetadata }) => (
        <Pressable
            style={styles.row}
            onPress={() => router.push(`/page/${item.pageNumber}`)}
            accessibilityRole="button"
            accessibilityLabel={`Page ${item.pageNumber}, ${item.surahNameEnglish}, Juz ${item.juzNumber}`}
        >
            <Text style={styles.pageNumber}>{item.pageNumber}</Text>
            <View style={styles.rowInfo}>
                <Text style={styles.arabicName}>{item.surahNameArabic}</Text>
                <Text style={styles.englishName}>{item.surahNameEnglish}</Text>
                <Text style={styles.juzLabel}>
                    {t('page_juz_label', locale).replace('{{number}}', String(item.juzNumber))}
                </Text>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputRow}>
                <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    placeholder={t('page_browser_input_placeholder', locale)}
                    placeholderTextColor={palette.textSecondary}
                    keyboardType="number-pad"
                    returnKeyType="go"
                    value={inputValue}
                    onChangeText={(text) => {
                        setInputValue(text);
                        if (errorMessage) setErrorMessage('');
                    }}
                    onSubmitEditing={handleGo}
                    accessibilityLabel={t('page_browser_input_placeholder', locale)}
                />
                <Pressable
                    style={styles.goButton}
                    onPress={handleGo}
                    accessibilityRole="button"
                    accessibilityLabel={t('page_browser_go_button', locale)}
                >
                    <Text style={styles.goButtonText}>{t('page_browser_go_button', locale)}</Text>
                </Pressable>
            </View>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <FlatList
                data={PAGES_DATA}
                keyExtractor={(item) => String(item.pageNumber)}
                renderItem={renderItem}
                initialNumToRender={30}
                maxToRenderPerBatch={30}
                windowSize={10}
            />
        </View>
    );
}
