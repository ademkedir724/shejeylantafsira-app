import Constants from 'expo-constants';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { t } from '../../src/constants/i18n';
import { useTheme } from '../../src/hooks/useTheme';
import { useStore } from '../../src/store';
import type { PlaybackSpeed, ReadingTheme, UILanguage } from '../../src/types/preferences';

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];
const THEMES: ReadingTheme[] = ['light', 'dark', 'sepia', 'paper'];
const LANGUAGES: UILanguage[] = ['om', 'en', 'ar'];

const THEME_LABEL_KEYS = {
    light: 'settings_theme_light',
    dark: 'settings_theme_dark',
    sepia: 'settings_theme_sepia',
    paper: 'settings_theme_paper',
} as const;

const LANG_LABEL_KEYS = {
    om: 'settings_language_om',
    en: 'settings_language_en',
    ar: 'settings_language_ar',
} as const;

export default function SettingsScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const preferences = useStore((s) => s.preferences);
    const downloadedPages = useStore((s) => s.downloadedPages);
    const markMissing = useStore((s) => s.markMissing);

    const setTheme = useStore((s) => s.setTheme);
    const setFontSize = useStore((s) => s.setFontSize);
    const setMushafImageMode = useStore((s) => s.setMushafImageMode);
    const setAutoAdvance = useStore((s) => s.setAutoAdvance);
    const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);
    const setUILanguage = useStore((s) => s.setUILanguage);
    const setWifiOnlyDownload = useStore((s) => s.setWifiOnlyDownload);

    const locale = preferences.uiLanguage;
    const pageCount = downloadedPages.size;
    const estimatedMB = pageCount; // ~1 MB per page
    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

    function handleFontSizeDecrease() {
        const next = preferences.fontSize - 2;
        if (next >= 16) setFontSize(next);
    }

    function handleFontSizeIncrease() {
        const next = preferences.fontSize + 2;
        if (next <= 36) setFontSize(next);
    }

    function handleClearDownloads() {
        Alert.alert(
            t('settings_clear_downloads', locale),
            t('settings_clear_downloads_confirm_hint', locale),
            [
                { text: t('common_cancel', locale), style: 'cancel' },
                {
                    text: t('settings_clear_downloads_button', locale),
                    style: 'destructive',
                    onPress: () => {
                        downloadedPages.forEach((page) => markMissing(page));
                    },
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
        label: {
            fontSize: 16,
            color: palette.text,
            marginBottom: spacing.sm,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        rowLabel: {
            fontSize: 16,
            color: palette.text,
            flex: 1,
        },
        rowHint: {
            fontSize: 13,
            color: palette.textSecondary,
            marginTop: 2,
        },
        rowLabelBlock: {
            flex: 1,
        },
        buttonGroup: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginTop: spacing.xs,
        },
        optionBtn: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.background,
        },
        optionBtnActive: {
            borderColor: palette.primary,
            backgroundColor: palette.primary,
        },
        optionBtnText: {
            fontSize: 14,
            color: palette.text,
        },
        optionBtnTextActive: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
        fontSizeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            marginTop: spacing.xs,
        },
        fontSizeBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.background,
            alignItems: 'center',
            justifyContent: 'center',
        },
        fontSizeBtnDisabled: {
            opacity: 0.4,
        },
        fontSizeBtnText: {
            fontSize: 20,
            color: palette.text,
            lineHeight: 24,
        },
        fontSizeValue: {
            fontSize: 16,
            color: palette.text,
            minWidth: 52,
            textAlign: 'center',
        },
        divider: {
            height: 1,
            backgroundColor: palette.border,
            marginVertical: spacing.sm,
        },
        storageInfo: {
            fontSize: 15,
            color: palette.text,
            marginBottom: spacing.xs,
        },
        manageBtn: {
            marginTop: spacing.sm,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: palette.primary,
            alignItems: 'center',
        },
        manageBtnText: {
            color: palette.primary,
            fontSize: 15,
            fontWeight: '600',
        },
        clearBtn: {
            marginTop: spacing.sm,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#D32F2F',
            alignItems: 'center',
        },
        clearBtnText: {
            color: '#D32F2F',
            fontSize: 15,
            fontWeight: '600',
        },
        versionText: {
            fontSize: 14,
            color: palette.textSecondary,
            textAlign: 'center',
            marginTop: spacing.sm,
            marginBottom: spacing.lg,
        },
    });

    return (
        <View style={s.container}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* Theme */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('settings_theme', locale)}</Text>
                    <View style={s.buttonGroup}>
                        {THEMES.map((theme) => {
                            const active = preferences.theme === theme;
                            return (
                                <Pressable
                                    key={theme}
                                    style={[s.optionBtn, active && s.optionBtnActive]}
                                    onPress={() => setTheme(theme)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                >
                                    <Text style={[s.optionBtnText, active && s.optionBtnTextActive]}>
                                        {t(THEME_LABEL_KEYS[theme], locale)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Font Size */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('settings_font_size', locale)}</Text>
                    <View style={s.fontSizeRow}>
                        <Pressable
                            style={[s.fontSizeBtn, preferences.fontSize <= 16 && s.fontSizeBtnDisabled]}
                            onPress={handleFontSizeDecrease}
                            disabled={preferences.fontSize <= 16}
                            accessibilityLabel="Decrease font size"
                        >
                            <Text style={s.fontSizeBtnText}>−</Text>
                        </Pressable>
                        <Text style={s.fontSizeValue}>
                            {t('settings_font_size_value', locale).replace('{{size}}', String(preferences.fontSize))}
                        </Text>
                        <Pressable
                            style={[s.fontSizeBtn, preferences.fontSize >= 36 && s.fontSizeBtnDisabled]}
                            onPress={handleFontSizeIncrease}
                            disabled={preferences.fontSize >= 36}
                            accessibilityLabel="Increase font size"
                        >
                            <Text style={s.fontSizeBtnText}>+</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Reading Options */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>Reading</Text>

                    {/* Mushaf Image Mode */}
                    <View style={s.row}>
                        <View style={s.rowLabelBlock}>
                            <Text style={s.rowLabel}>{t('settings_image_mode', locale)}</Text>
                            <Text style={s.rowHint}>{t('settings_image_mode_hint', locale)}</Text>
                        </View>
                        <Switch
                            value={preferences.mushafImageMode}
                            onValueChange={setMushafImageMode}
                            trackColor={{ true: palette.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={s.divider} />

                    {/* Auto-Advance */}
                    <View style={s.row}>
                        <View style={s.rowLabelBlock}>
                            <Text style={s.rowLabel}>{t('settings_auto_advance', locale)}</Text>
                            <Text style={s.rowHint}>{t('settings_auto_advance_hint', locale)}</Text>
                        </View>
                        <Switch
                            value={preferences.autoAdvance}
                            onValueChange={setAutoAdvance}
                            trackColor={{ true: palette.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Playback Speed */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('settings_playback_speed', locale)}</Text>
                    <View style={s.buttonGroup}>
                        {PLAYBACK_SPEEDS.map((speed) => {
                            const active = preferences.playbackSpeed === speed;
                            return (
                                <Pressable
                                    key={speed}
                                    style={[s.optionBtn, active && s.optionBtnActive]}
                                    onPress={() => setPlaybackSpeed(speed)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                >
                                    <Text style={[s.optionBtnText, active && s.optionBtnTextActive]}>
                                        {speed}×
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Language */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('settings_language', locale)}</Text>
                    <View style={s.buttonGroup}>
                        {LANGUAGES.map((lang) => {
                            const active = preferences.uiLanguage === lang;
                            return (
                                <Pressable
                                    key={lang}
                                    style={[s.optionBtn, active && s.optionBtnActive]}
                                    onPress={() => setUILanguage(lang)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                >
                                    <Text style={[s.optionBtnText, active && s.optionBtnTextActive]}>
                                        {t(LANG_LABEL_KEYS[lang], locale)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Network */}
                <View style={s.card}>
                    <View style={s.row}>
                        <View style={s.rowLabelBlock}>
                            <Text style={s.rowLabel}>{t('settings_wifi_only', locale)}</Text>
                            <Text style={s.rowHint}>{t('settings_wifi_only_hint', locale)}</Text>
                        </View>
                        <Switch
                            value={preferences.wifiOnlyDownload}
                            onValueChange={setWifiOnlyDownload}
                            trackColor={{ true: palette.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Storage */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('settings_storage', locale)}</Text>
                    <Text style={s.storageInfo}>
                        {t('settings_storage_used', locale).replace('{{mb}}', String(estimatedMB))}
                    </Text>
                    <Text style={s.storageInfo}>
                        {t('settings_storage_pages', locale).replace('{{count}}', String(pageCount))}
                    </Text>
                    <Pressable
                        style={s.manageBtn}
                        onPress={() => router.push('/downloads')}
                        accessibilityRole="button"
                    >
                        <Text style={s.manageBtnText}>{t('downloads_title', locale)}</Text>
                    </Pressable>
                    <Pressable
                        style={s.clearBtn}
                        onPress={handleClearDownloads}
                        accessibilityRole="button"
                    >
                        <Text style={s.clearBtnText}>{t('settings_clear_downloads', locale)}</Text>
                    </Pressable>
                </View>

                {/* Version */}
                <Text style={s.versionText}>
                    {t('settings_version', locale).replace('{{version}}', appVersion)}
                </Text>

            </ScrollView>
        </View>
    );
}
