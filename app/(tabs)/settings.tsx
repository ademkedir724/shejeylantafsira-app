import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { t } from '../../src/constants/i18n';
import { useTheme } from '../../src/hooks/useTheme';
import { useStore } from '../../src/store';
import type { PlaybackSpeed, ReadingTheme, UILanguage } from '../../src/types/preferences';

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];
const THEMES: ReadingTheme[] = ['light', 'dark', 'sepia', 'paper'];
const LANGUAGES: UILanguage[] = ['om', 'en', 'ar'];

const THEME_LABELS: Record<ReadingTheme, string> = {
    light: 'settings_theme_light',
    dark: 'settings_theme_dark',
    sepia: 'settings_theme_sepia',
    paper: 'settings_theme_paper',
};

const LANG_LABELS: Record<UILanguage, string> = {
    om: 'settings_language_om',
    en: 'settings_language_en',
    ar: 'settings_language_ar',
};

export default function SettingsScreen() {
    const router = useRouter();
    const { palette, spacing } = useTheme();
    const preferences = useStore((s) => s.preferences);
    const downloadedPages = useStore((s) => s.downloadedPages);
    const markMissing = useStore((s) => s.markMissing);
    const setTheme = useStore((s) => s.setTheme);
    const setAutoAdvance = useStore((s) => s.setAutoAdvance);
    const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);
    const setUILanguage = useStore((s) => s.setUILanguage);
    const setWifiOnlyDownload = useStore((s) => s.setWifiOnlyDownload);

    const locale = preferences.uiLanguage;
    const pageCount = downloadedPages.size;
    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

    function handleClearDownloads() {
        Alert.alert(
            t('settings_clear_downloads', locale),
            t('settings_clear_downloads_confirm_hint', locale),
            [
                { text: t('common_cancel', locale), style: 'cancel' },
                {
                    text: t('settings_clear_downloads_button', locale),
                    style: 'destructive',
                    onPress: () => downloadedPages.forEach((page) => markMissing(page)),
                },
            ]
        );
    }

    const s = StyleSheet.create({
        container: { flex: 1, backgroundColor: palette.background },
        scroll: { padding: spacing.md },
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
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        rowLabelBlock: { flex: 1 },
        rowLabel: { fontSize: 16, color: palette.text },
        rowHint: { fontSize: 13, color: palette.textSecondary, marginTop: 2 },
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
        optionBtnText: { fontSize: 14, color: palette.text },
        optionBtnTextActive: { color: '#fff', fontWeight: '600' },
        storageInfo: { fontSize: 15, color: palette.text, marginBottom: spacing.xs },
        manageBtn: {
            marginTop: spacing.sm,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: palette.primary,
            alignItems: 'center',
        },
        manageBtnText: { color: palette.primary, fontSize: 15, fontWeight: '600' },
        clearBtn: {
            marginTop: spacing.sm,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#D32F2F',
            alignItems: 'center',
        },
        clearBtnText: { color: '#D32F2F', fontSize: 15, fontWeight: '600' },
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
                                        {t(THEME_LABELS[theme], locale)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Reading */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('settings_auto_advance', locale)}</Text>
                    <View style={s.row}>
                        <View style={s.rowLabelBlock}>
                            <Text style={s.rowLabel}>{t('settings_auto_advance', locale)}</Text>
                            <Text style={s.rowHint}>{t('settings_auto_advance_hint', locale)}</Text>
                        </View>
                        <Switch
                            value={preferences.autoAdvance}
                            onValueChange={setAutoAdvance}
                            trackColor={{ true: palette.primary }}
                            thumbColor="#fff"
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
                                        {t(LANG_LABELS[lang], locale)}
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
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Storage */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>{t('settings_storage', locale)}</Text>
                    <Text style={s.storageInfo}>
                        {t('settings_storage_used', locale).replace('{{mb}}', String(pageCount))}
                    </Text>
                    <Text style={s.storageInfo}>
                        {t('settings_storage_pages', locale).replace('{{count}}', String(pageCount))}
                    </Text>
                    <Pressable style={s.manageBtn} onPress={() => router.push('/downloads')} accessibilityRole="button">
                        <Text style={s.manageBtnText}>{t('downloads_title', locale)}</Text>
                    </Pressable>
                    <Pressable style={s.clearBtn} onPress={handleClearDownloads} accessibilityRole="button">
                        <Text style={s.clearBtnText}>{t('settings_clear_downloads', locale)}</Text>
                    </Pressable>
                </View>

                <Text style={s.versionText}>
                    {t('settings_version', locale).replace('{{version}}', appVersion)}
                </Text>

            </ScrollView>
        </View>
    );
}
