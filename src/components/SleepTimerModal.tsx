import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { t } from '../constants/i18n';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store';

interface SleepTimerModalProps {
    visible: boolean;
    onClose: () => void;
}

type DurationOption = 5 | 10 | 15 | 30 | 45 | 60 | 'end-of-page';

const DURATION_OPTIONS: DurationOption[] = [5, 10, 15, 30, 45, 60, 'end-of-page'];

function formatCountdown(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function SleepTimerModal({ visible, onClose }: SleepTimerModalProps) {
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);
    const sleepTimerMs = useStore((s) => s.audio.sleepTimerMs);
    const setSleepTimer = useStore((s) => s.setSleepTimer);
    const { pause } = useAudioEngine();

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Countdown tick — start interval when timer becomes active, clear when cancelled
    const timerActive = sleepTimerMs !== null && sleepTimerMs > 0;
    useEffect(() => {
        if (!timerActive) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        if (intervalRef.current) return; // already ticking

        intervalRef.current = setInterval(() => {
            useStore.getState().setSleepTimer(
                Math.max(0, (useStore.getState().audio.sleepTimerMs ?? 0) - 1000)
            );
            if ((useStore.getState().audio.sleepTimerMs ?? 0) <= 0) {
                useStore.getState().setSleepTimer(null);
                pause();
                clearInterval(intervalRef.current!);
                intervalRef.current = null;
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [timerActive]); // restart only when active state changes

    const handleSelect = (option: DurationOption) => {
        if (option === 'end-of-page') {
            // Use a sentinel value; AudioPlayer will handle "end of page" via audio finish
            setSleepTimer(-1);
        } else {
            setSleepTimer(option * 60 * 1000);
        }
        onClose();
    };

    const handleCancel = () => {
        setSleepTimer(null);
        onClose();
    };

    const durationLabel = (option: DurationOption): string => {
        if (option === 'end-of-page') return t('sleep_timer_end_of_page', locale);
        const keyMap: Record<number, string> = {
            5: 'sleep_timer_5min',
            10: 'sleep_timer_10min',
            15: 'sleep_timer_15min',
            30: 'sleep_timer_30min',
            45: 'sleep_timer_45min',
            60: 'sleep_timer_60min',
        };
        return t(keyMap[option] as any, locale);
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: spacing.lg,
        },
        modal: {
            backgroundColor: palette.surface,
            borderRadius: 16,
            overflow: 'hidden',
        },
        title: {
            color: palette.text,
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
        },
        countdown: {
            color: palette.primary,
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
            paddingVertical: spacing.sm,
        },
        countdownLabel: {
            color: palette.textSecondary,
            fontSize: 12,
            textAlign: 'center',
            marginBottom: spacing.sm,
        },
        option: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
        },
        optionText: {
            color: palette.text,
            fontSize: 15,
            textAlign: 'center',
        },
        cancelBtn: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
        },
        cancelText: {
            color: palette.accent,
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'center',
        },
    });

    const isActive = sleepTimerMs !== null && sleepTimerMs > 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.modal}>
                    <Text style={styles.title}>{t('sleep_timer_title', locale)}</Text>

                    {isActive && (
                        <>
                            <Text style={styles.countdown}>{formatCountdown(sleepTimerMs!)}</Text>
                            <Text style={styles.countdownLabel}>{t('sleep_timer_remaining', locale).replace('{{time}}', formatCountdown(sleepTimerMs!))}</Text>
                        </>
                    )}

                    {DURATION_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={String(option)}
                            style={styles.option}
                            onPress={() => handleSelect(option)}
                        >
                            <Text style={styles.optionText}>{durationLabel(option)}</Text>
                        </TouchableOpacity>
                    ))}

                    {isActive && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                            <Text style={styles.cancelText}>{t('sleep_timer_cancel', locale)}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
