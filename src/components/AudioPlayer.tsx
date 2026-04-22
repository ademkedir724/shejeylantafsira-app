import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
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
    const [seekBarWidth, setSeekBarWidth] = useState(0);
    const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasAdvanced = useRef(false);

    const isSample = (SAMPLE_PAGES as readonly number[]).includes(pageNumber);
    const noSource = !audio.isLoading && audio.source === null && audio.error !== null;

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

    const progress = audio.durationMs > 0 ? audio.positionMs / audio.durationMs : 0;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    const handleSeekBarPress = (locationX: number) => {
        if (seekBarWidth > 0 && audio.durationMs > 0) {
            const ratio = Math.min(Math.max(locationX / seekBarWidth, 0), 1);
            seekTo(ratio * audio.durationMs);
        }
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: palette.audioPlayerBg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.md,
        },
        // "Coming soon" placeholder
        placeholder: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
        },
        placeholderText: {
            color: palette.textSecondary,
            fontSize: 14,
        },
        // Top row: sample badge + time
        topRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.xs,
        },
        sampleBadge: {
            backgroundColor: palette.accent,
            borderRadius: 4,
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
        },
        sampleBadgeText: {
            color: '#fff',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        timeRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: 1,
            marginLeft: spacing.sm,
        },
        timeText: {
            color: palette.textSecondary,
            fontSize: 12,
            fontVariant: ['tabular-nums'],
        },
        // Seek bar
        seekBarHitArea: {
            paddingVertical: 8,
            marginBottom: spacing.sm,
        },
        seekBarTrack: {
            height: 4,
            backgroundColor: palette.border,
            borderRadius: 2,
            overflow: 'hidden',
        },
        seekBarFill: {
            height: 4,
            backgroundColor: palette.primary,
            borderRadius: 2,
        },
        // Controls row
        controls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        // Side controls (speed, sleep)
        sideControl: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
        },
        speedText: {
            color: palette.text,
            fontSize: 13,
            fontWeight: '600',
        },
        // Center controls (repeat, play, next)
        centerControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
        },
        iconBtn: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        playBtn: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: palette.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: palette.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            elevation: 4,
        },
    });

    if (noSource) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Ionicons name="musical-notes-outline" size={18} color={palette.textSecondary} />
                    <Text style={styles.placeholderText}>{t('audio_coming_soon', locale)}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top row: sample badge + timestamps */}
            <View style={styles.topRow}>
                {isSample ? (
                    <View style={styles.sampleBadge}>
                        <Text style={styles.sampleBadgeText}>{t('audio_sample_badge', locale)}</Text>
                    </View>
                ) : (
                    <View />
                )}
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(audio.positionMs)}</Text>
                    <Text style={styles.timeText}>{formatTime(audio.durationMs)}</Text>
                </View>
            </View>

            {/* Seek bar */}
            <Pressable
                style={styles.seekBarHitArea}
                onLayout={(e) => setSeekBarWidth(e.nativeEvent.layout.width)}
                onPress={(e) => handleSeekBarPress(e.nativeEvent.locationX)}
                accessibilityRole="adjustable"
                accessibilityLabel="Seek audio"
            >
                <View style={styles.seekBarTrack}>
                    <View style={[styles.seekBarFill, { width: `${clampedProgress * 100}%` }]} />
                </View>
            </Pressable>

            {/* Controls */}
            <View style={styles.controls}>
                {/* Speed button */}
                <Pressable
                    style={styles.sideControl}
                    onPress={() => setShowSpeedPicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel={`Playback speed ${audio.playbackSpeed}x`}
                    hitSlop={8}
                >
                    <Text style={styles.speedText}>{audio.playbackSpeed}×</Text>
                </Pressable>

                {/* Center: Repeat + Play/Pause + (placeholder for symmetry) */}
                <View style={styles.centerControls}>
                    {/* Repeat */}
                    <Pressable
                        style={styles.iconBtn}
                        onPress={toggleRepeat}
                        accessibilityRole="button"
                        accessibilityLabel={audio.isRepeat ? 'Disable repeat' : 'Enable repeat'}
                        hitSlop={8}
                    >
                        <Ionicons
                            name="repeat"
                            size={22}
                            color={audio.isRepeat ? palette.primary : palette.textSecondary}
                        />
                    </Pressable>

                    {/* Play / Pause */}
                    {audio.isLoading ? (
                        <View style={styles.playBtn}>
                            <ActivityIndicator color="#fff" size="small" />
                        </View>
                    ) : (
                        <Pressable
                            style={styles.playBtn}
                            onPress={audio.isPlaying ? pause : play}
                            accessibilityRole="button"
                            accessibilityLabel={audio.isPlaying ? t('audio_pause', locale) : t('audio_play', locale)}
                        >
                            <Ionicons
                                name={audio.isPlaying ? 'pause' : 'play'}
                                size={26}
                                color="#FFFFFF"
                                style={{ marginLeft: audio.isPlaying ? 0 : 2 }}
                            />
                        </Pressable>
                    )}

                    {/* Skip forward (placeholder — same width as repeat for symmetry) */}
                    <Pressable
                        style={styles.iconBtn}
                        onPress={onNavigateNext}
                        accessibilityRole="button"
                        accessibilityLabel="Next page"
                        hitSlop={8}
                    >
                        <Ionicons
                            name="play-skip-forward"
                            size={22}
                            color={palette.textSecondary}
                        />
                    </Pressable>
                </View>

                {/* Sleep timer */}
                <Pressable
                    style={styles.sideControl}
                    onPress={() => setShowSleepTimer(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Sleep timer"
                    hitSlop={8}
                >
                    <Ionicons
                        name="moon"
                        size={20}
                        color={audio.sleepTimerMs !== null ? palette.primary : palette.textSecondary}
                    />
                </Pressable>
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
