import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { t } from '../constants/i18n';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store';
import type { PlaybackSpeed } from '../types/preferences';

interface SpeedPickerSheetProps {
    visible: boolean;
    onClose: () => void;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];

export default function SpeedPickerSheet({ visible, onClose }: SpeedPickerSheetProps) {
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);
    const currentSpeed = useStore((s) => s.audio.playbackSpeed);
    const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);
    const { setSpeed } = useAudioEngine();

    const handleSelect = async (speed: PlaybackSpeed) => {
        setPlaybackSpeed(speed);
        await setSpeed(speed);
        onClose();
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        sheet: {
            backgroundColor: palette.surface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: spacing.xl,
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
        option: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        optionText: {
            color: palette.text,
            fontSize: 16,
        },
        activeOptionText: {
            color: palette.primary,
            fontWeight: '600',
        },
        checkmark: {
            color: palette.primary,
            fontSize: 16,
        },
    });

    const speedLabel = (speed: PlaybackSpeed): string => {
        const map: Record<PlaybackSpeed, string> = {
            0.75: t('speed_0_75', locale),
            1.0: t('speed_1_0', locale),
            1.25: t('speed_1_25', locale),
            1.5: t('speed_1_5', locale),
            2.0: t('speed_2_0', locale),
        };
        return map[speed];
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.sheet}>
                    <Text style={styles.title}>{t('speed_picker_title', locale)}</Text>
                    {SPEED_OPTIONS.map((speed) => (
                        <TouchableOpacity
                            key={speed}
                            style={styles.option}
                            onPress={() => handleSelect(speed)}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    currentSpeed === speed && styles.activeOptionText,
                                ]}
                            >
                                {speedLabel(speed)}
                            </Text>
                            {currentSpeed === speed && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
