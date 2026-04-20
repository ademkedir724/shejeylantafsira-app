import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AUTO_ADVANCE_DELAY_MS, SAMPLE_PAGES } from '../constants/config';
import { t } from '../constants/i18n';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store';
import SleepTimerModal from './SleepTimerModal';
import SpeedPickerSheet from './SpeedPickerSheet';

interface AudioPlayerProps {
    pageNumber: number;
    onNavigateNext: () => void;
}

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function AudioPlayer({ pageNumber, onNavigateNext }: AudioPlayerProps) {
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);
    const audio = useStore((s) => s.audio);
    const autoAdvance = useStore((s) => s.preferences.autoAdvance);
    const toggleRepeat = useStore((s) => s.toggleRepeat);

    const { play, pause, seekTo, setSpeed } = useAudioEngine();

    const [showSpeedPicker, setShowSpeedPicker] = useState(false);
    const [showSleepTimer, setShowSleepTimer] = useState(false);
    const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasAdvanced = useRef(false);

    const isSample = (SAMPLE_PAGES as readonly number[]).includes(pageNumber);
    const noSource = audio.source === null && !audio.isLoading;

    // Auto-advance logic
    useEffect(() => {
        if (
            audio.durationMs > 0 &&
            audio.positionMs >= audio.durationMs &&
            autoAdvance &&
            !audio.isRepeat
        ) {
            if (!hasAdvanced.current) {
                hasAdvanced.current = true;
                autoAdvanceTimer.current = setTimeout(() => {
                    onNavigateNext();
                }, AUTO_ADVANCE_DELAY_MS);
            }
        } else {
            hasAdvanced.current = false;
            if (autoAdvanceTimer.current) {
                clearTimeout(autoAdvanceTimer.current);
                autoAdvanceTimer.current = null;
            }
        }
        return () => {
            if (autoAdvanceTimer.current) {
                clearTimeout(autoAdvanceTimer.current);
            }
        };
    }, [audio.positionMs, audio.durationMs, autoAdvance, audio.isRepeat, onNavigateNext]);

    const progress =
        audio.durationMs > 0 ? audio.positionMs / audio.durationMs : 0;

    const styles = StyleSheet.create({
        container: {
            backgroundColor: palette.audioPlayerBg,
            borderTopWidth: 1,
            borderTopColor: palette.border,
            padding: spacing.md,
        },
        placeholder: {
            alignItems: 'center',
            paddingVertical: spacing.sm,
        },
        placeholderText: {
            color: palette.textSecondary,
            fontSize: 14,
        },
        sampleBadge: {
            backgroundColor: palette.accent,
            borderRadius: 4,
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
            alignSelf: 'flex-start',
            marginBottom: spacing.sm,
        },
        sampleBadgeText: {
            color: '#fff',
            fontSize: 11,
            fontWeight: '600',
        },
        timeRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: spacing.xs,
        },
        timeText: {
            color: palette.textSecondary,
            fontSize: 12,
        },
        progressTrack: {
            height: 4,
            backgroundColor: palette.border,
            borderRadius: 2,
            marginBottom: spacing.sm,
        },
        progressFill: {
            height: 4,
            backgroundColor: palette.primary,
            borderRadius: 2,
        },
        controls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
        },
        controlBtn: {
            padding: spacing.sm,
        },
        controlBtnText: {
            color: palette.text,
            fontSize: 14,
        },
        activeText: {
            color: palette.primary,
        },
        playBtn: {
            backgroundColor: palette.primary,
            borderRadius: 24,
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
        },
        playBtnText: {
            color: '#fff',
            fontSize: 18,
        },
    });

    if (noSource) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>{t('audio_coming_soon', locale)}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isSample && (
                <View style={styles.sampleBadge}>
                    <Text style={styles.sampleBadgeText}>{t('audio_sample_badge', locale)}</Text>
                </View>
            )}

            {/* Progress bar */}
            <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(audio.positionMs)}</Text>
                <Text style={styles.timeText}>{formatTime(audio.durationMs)}</Text>
            </View>
            <TouchableOpacity
                style={styles.progressTrack}
                onPress={(e) => {
                    if (audio.durationMs > 0) {
                        const { locationX, target } = e.nativeEvent;
                        // Simple tap-to-seek on the track
                        seekTo(audio.positionMs); // fallback — full slider not available without @react-native-community/slider
                    }
                }}
                activeOpacity={1}
            >
                <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
            </TouchableOpacity>

            {/* Controls */}
            <View style={styles.controls}>
                {/* Speed */}
                <TouchableOpacity style={styles.controlBtn} onPress={() => setShowSpeedPicker(true)}>
                    <Text style={styles.controlBtnText}>{audio.playbackSpeed}×</Text>
                </TouchableOpacity>

                {/* Play / Pause */}
                {audio.isLoading ? (
                    <ActivityIndicator color={palette.primary} size="small" />
                ) : (
                    <TouchableOpacity
                        style={styles.playBtn}
                        onPress={audio.isPlaying ? pause : play}
                    >
                        <Text style={styles.playBtnText}>{audio.isPlaying ? '⏸' : '▶'}</Text>
                    </TouchableOpacity>
                )}

                {/* Repeat */}
                <TouchableOpacity style={styles.controlBtn} onPress={toggleRepeat}>
                    <Text style={[styles.controlBtnText, audio.isRepeat && styles.activeText]}>
                        🔁
                    </Text>
                </TouchableOpacity>

                {/* Sleep timer */}
                <TouchableOpacity style={styles.controlBtn} onPress={() => setShowSleepTimer(true)}>
                    <Text style={[styles.controlBtnText, audio.sleepTimerMs !== null && styles.activeText]}>
                        🌙
                    </Text>
                </TouchableOpacity>
            </View>

            <SpeedPickerSheet
                visible={showSpeedPicker}
                onClose={() => setShowSpeedPicker(false)}
            />
            <SleepTimerModal
                visible={showSleepTimer}
                onClose={() => setShowSleepTimer(false)}
            />
        </View>
    );
}
