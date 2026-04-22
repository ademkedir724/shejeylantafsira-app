import AudioPlayer from '@/components/AudioPlayer';
import { BookmarkModal } from '@/components/BookmarkModal';
import { DownloadButton } from '@/components/DownloadButton';
import { MushafImage } from '@/components/MushafImage';
import { OfflineBanner } from '@/components/OfflineBanner';
import { FULL_SCREEN_CONTROLS_TIMEOUT_MS, LAST_READ_SAVE_DEBOUNCE_MS } from '@/constants/config';
import { t } from '@/constants/i18n/index';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PageScreen() {
    const { pageNumber: pageParam } = useLocalSearchParams<{ pageNumber: string }>();
    const router = useRouter();
    const { palette, spacing } = useTheme();

    const pageNumber = Math.min(604, Math.max(1, parseInt(pageParam ?? '1', 10) || 1));

    // Store selectors
    const locale = useStore((s) => s.preferences.uiLanguage);
    const setCurrentPage = useStore((s) => s.setCurrentPage);
    const setLastReadPage = useStore((s) => s.setLastReadPage);
    const isPageLocked = useStore((s) => s.isPageLocked);
    const isFullScreen = useStore((s) => s.isFullScreen);
    const togglePageLock = useStore((s) => s.togglePageLock);
    const toggleFullScreen = useStore((s) => s.toggleFullScreen);
    const isBookmarked = useStore((s) => s.isBookmarked(pageNumber));

    // Bookmark modal state
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);

    // Full-screen controls visibility
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset showControls to true when exiting full-screen
    useEffect(() => {
        if (!isFullScreen) {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = null;
            }
        }
    }, [isFullScreen]);

    // Clear controls timeout on unmount
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    const handlePageContentPress = useCallback(() => {
        if (!isFullScreen) return;
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, FULL_SCREEN_CONTROLS_TIMEOUT_MS);
    }, [isFullScreen]);

    const { loadPage, pause, release } = useAudioEngine();

    // Debounce ref for setLastReadPage
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Stop audio from previous page
        pause();
        release();

        // Update navigation state
        setCurrentPage(pageNumber);

        // Debounced last-read save
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            setLastReadPage(pageNumber);
        }, LAST_READ_SAVE_DEBOUNCE_MS);

        // Load audio for this page
        loadPage(pageNumber).catch(() => { });

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

    const previousLabel = t('page_previous', locale);
    const nextLabel = t('page_next', locale);

    const isPrevDisabled = pageNumber <= 1 || isPageLocked;
    const isNextDisabled = pageNumber >= 604 || isPageLocked;
    const showChrome = !isFullScreen || showControls;

    // Swipe gesture
    const translateX = useSharedValue(0);

    const navigateNext = useCallback(() => {
        router.push(`/page/${pageNumber + 1}`);
    }, [router, pageNumber]);

    const navigatePrev = useCallback(() => {
        router.push(`/page/${pageNumber - 1}`);
    }, [router, pageNumber]);

    // Back button → always go to page list
    const handleBack = useCallback(() => {
        router.push('/page-browser');
    }, [router]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .onEnd((event) => {
            if (event.translationX < -50 && !isNextDisabled && !isPageLocked) {
                runOnJS(navigateNext)();
            } else if (event.translationX > 50 && !isPrevDisabled && !isPageLocked) {
                runOnJS(navigatePrev)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: palette.headerBg,
        },
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: palette.headerBg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: palette.text,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
        },
        iconButton: {
            padding: spacing.sm,
            borderRadius: 8,
        },
        pageContent: {
            flex: 1,
        },
        navRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border,
            backgroundColor: palette.surface,
        },
        navButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 8,
            backgroundColor: palette.primary,
            minWidth: 90,
            justifyContent: 'center',
        },
        navButtonDisabled: {
            backgroundColor: palette.border,
        },
        navButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        navButtonTextDisabled: {
            color: palette.textSecondary,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar hidden={isFullScreen} />

            <View style={styles.container}>
                {/* Header */}
                {showChrome && (
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Pressable
                                style={styles.iconButton}
                                onPress={handleBack}
                                accessibilityRole="button"
                                accessibilityLabel="Back to page list"
                                hitSlop={8}
                            >
                                <Ionicons name="arrow-back" size={22} color={palette.text} />
                            </Pressable>
                            <Text style={styles.headerTitle}>Page {pageNumber}</Text>
                        </View>

                        <View style={styles.headerActions}>
                            <Pressable
                                style={styles.iconButton}
                                onPress={togglePageLock}
                                accessibilityRole="button"
                                accessibilityLabel={isPageLocked ? 'Unlock page' : 'Lock page'}
                                hitSlop={8}
                            >
                                <Ionicons
                                    name={isPageLocked ? 'lock-closed' : 'lock-open'}
                                    size={22}
                                    color={isPageLocked ? palette.primary : palette.text}
                                />
                            </Pressable>

                            <Pressable
                                style={styles.iconButton}
                                onPress={() => setShowBookmarkModal(true)}
                                accessibilityRole="button"
                                accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                hitSlop={8}
                            >
                                <Ionicons
                                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                                    size={22}
                                    color={isBookmarked ? palette.primary : palette.text}
                                />
                            </Pressable>

                            <Pressable
                                style={styles.iconButton}
                                onPress={toggleFullScreen}
                                accessibilityRole="button"
                                accessibilityLabel={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
                                hitSlop={8}
                            >
                                <Ionicons
                                    name={isFullScreen ? 'contract' : 'expand'}
                                    size={22}
                                    color={palette.text}
                                />
                            </Pressable>
                        </View>
                    </View>
                )}

                {showChrome && <OfflineBanner pageNumber={pageNumber} />}

                <BookmarkModal
                    visible={showBookmarkModal}
                    pageNumber={pageNumber}
                    isBookmarked={isBookmarked}
                    onClose={() => setShowBookmarkModal(false)}
                />

                {/* Page content — image only */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.pageContent, animatedStyle]}>
                        <Pressable style={styles.pageContent} onPress={handlePageContentPress}>
                            <MushafImage pageNumber={pageNumber} />
                        </Pressable>
                    </Animated.View>
                </GestureDetector>

                {showChrome && (
                    <AudioPlayer
                        pageNumber={pageNumber}
                        onNavigateNext={() => {
                            if (pageNumber < 604) router.push(`/page/${pageNumber + 1}`);
                        }}
                    />
                )}

                {showChrome && (
                    <View style={styles.navRow}>
                        <Pressable
                            style={[styles.navButton, isPrevDisabled && styles.navButtonDisabled]}
                            disabled={isPrevDisabled}
                            onPress={() => router.push(`/page/${pageNumber - 1}`)}
                            accessibilityRole="button"
                            accessibilityLabel={previousLabel}
                            accessibilityState={{ disabled: isPrevDisabled }}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={16}
                                color={isPrevDisabled ? palette.textSecondary : '#FFFFFF'}
                            />
                            <Text style={[styles.navButtonText, isPrevDisabled && styles.navButtonTextDisabled]}>
                                {previousLabel}
                            </Text>
                        </Pressable>

                        <DownloadButton pageNumber={pageNumber} />

                        <Pressable
                            style={[styles.navButton, isNextDisabled && styles.navButtonDisabled]}
                            disabled={isNextDisabled}
                            onPress={() => router.push(`/page/${pageNumber + 1}`)}
                            accessibilityRole="button"
                            accessibilityLabel={nextLabel}
                            accessibilityState={{ disabled: isNextDisabled }}
                        >
                            <Text style={[styles.navButtonText, isNextDisabled && styles.navButtonTextDisabled]}>
                                {nextLabel}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={isNextDisabled ? palette.textSecondary : '#FFFFFF'}
                            />
                        </Pressable>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
