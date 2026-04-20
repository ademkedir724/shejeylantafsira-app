import { t } from '@/constants/i18n/index';
import { getPageMetadata } from '@/features/quran/metadata';
import { useStore } from '@/store/index';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

export interface BookmarkModalProps {
    visible: boolean;
    pageNumber: number;
    isBookmarked: boolean;
    onClose: () => void;
}

export function BookmarkModal({
    visible,
    pageNumber,
    isBookmarked,
    onClose,
}: BookmarkModalProps) {
    const { palette, spacing } = useTheme();
    const locale = useStore((s) => s.preferences.uiLanguage);
    const addBookmark = useStore((s) => s.addBookmark);
    const removeBookmark = useStore((s) => s.removeBookmark);

    const [label, setLabel] = useState('');

    const handleSave = () => {
        const meta = getPageMetadata(pageNumber);
        addBookmark({
            id: Date.now().toString(),
            pageNumber,
            surahNameEnglish: meta.surahNameEnglish,
            juzNumber: meta.juzNumber,
            label: label.trim(),
            createdAt: Date.now(),
        });
        setLabel('');
        onClose();
    };

    const handleRemove = () => {
        removeBookmark(pageNumber);
        onClose();
    };

    const handleCancel = () => {
        setLabel('');
        onClose();
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
        },
        card: {
            backgroundColor: palette.surface,
            borderRadius: 12,
            padding: spacing.lg,
            width: '100%',
            maxWidth: 400,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: palette.text,
            marginBottom: spacing.md,
        },
        input: {
            borderWidth: 1,
            borderColor: palette.border,
            borderRadius: 8,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            fontSize: 16,
            color: palette.text,
            backgroundColor: palette.background,
            marginBottom: spacing.xs,
        },
        charCount: {
            fontSize: 12,
            color: palette.textSecondary,
            textAlign: 'right',
            marginBottom: spacing.md,
        },
        confirmText: {
            fontSize: 16,
            color: palette.text,
            marginBottom: spacing.lg,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: spacing.sm,
        },
        button: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 8,
            minWidth: 80,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: palette.border,
        },
        primaryButton: {
            backgroundColor: palette.primary,
        },
        destructiveButton: {
            backgroundColor: '#D32F2F',
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: palette.text,
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
            accessibilityViewIsModal
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {isBookmarked ? (
                        <>
                            <Text style={styles.title}>
                                {t('bookmarks_remove', locale)}
                            </Text>
                            <Text style={styles.confirmText}>
                                {t('bookmarks_confirm_delete', locale)}
                            </Text>
                            <View style={styles.buttonRow}>
                                <Pressable
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleCancel}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('bookmarks_cancel', locale)}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        {t('bookmarks_cancel', locale)}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.button, styles.destructiveButton]}
                                    onPress={handleRemove}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('bookmarks_delete_confirm_button', locale)}
                                >
                                    <Text style={styles.buttonText}>
                                        {t('bookmarks_delete_confirm_button', locale)}
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>
                                {t('bookmarks_add', locale)}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('bookmarks_label_placeholder', locale)}
                                placeholderTextColor={palette.textSecondary}
                                value={label}
                                onChangeText={(text) => setLabel(text.slice(0, 60))}
                                maxLength={60}
                                returnKeyType="done"
                                onSubmitEditing={handleSave}
                                accessibilityLabel={t('bookmarks_label_placeholder', locale)}
                            />
                            <Text style={styles.charCount}>
                                {label.length}/60
                            </Text>
                            <View style={styles.buttonRow}>
                                <Pressable
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleCancel}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('bookmarks_cancel', locale)}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        {t('bookmarks_cancel', locale)}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.button, styles.primaryButton]}
                                    onPress={handleSave}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('bookmarks_save', locale)}
                                >
                                    <Text style={styles.buttonText}>
                                        {t('bookmarks_save', locale)}
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}
