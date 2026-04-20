import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export interface PageHeaderProps {
    pageNumber: number;
    isFullScreen: boolean;
    isPageLocked: boolean;
    isBookmarked: boolean;
    onToggleFullScreen: () => void;
    onTogglePageLock: () => void;
    onBookmark: () => void;
}

export function PageHeader({
    pageNumber,
    isFullScreen,
    isPageLocked,
    isBookmarked,
    onToggleFullScreen,
    onTogglePageLock,
    onBookmark,
}: PageHeaderProps) {
    const { palette, spacing } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: palette.headerBg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
        },
        pageNumber: {
            fontSize: 16,
            fontWeight: '600',
            color: palette.text,
        },
        actions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        iconButton: {
            padding: spacing.xs,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.pageNumber}>Page {pageNumber}</Text>
            <View style={styles.actions}>
                <Pressable
                    style={styles.iconButton}
                    onPress={onTogglePageLock}
                    accessibilityRole="button"
                    accessibilityLabel={isPageLocked ? 'Unlock page' : 'Lock page'}
                >
                    <Ionicons
                        name={isPageLocked ? 'lock-closed' : 'lock-open'}
                        size={22}
                        color={palette.text}
                    />
                </Pressable>
                <Pressable
                    style={styles.iconButton}
                    onPress={onBookmark}
                    accessibilityRole="button"
                    accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                    <Ionicons
                        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={22}
                        color={palette.text}
                    />
                </Pressable>
                <Pressable
                    style={styles.iconButton}
                    onPress={onToggleFullScreen}
                    accessibilityRole="button"
                    accessibilityLabel={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
                >
                    <Ionicons
                        name={isFullScreen ? 'contract' : 'expand'}
                        size={22}
                        color={palette.text}
                    />
                </Pressable>
            </View>
        </View>
    );
}
