import AudioPlayer from '@/components/AudioPlayer';
import { BookmarkModal } from '@/components/BookmarkModal';
import { DownloadButton } from '@/components/DownloadButton';
import { MushafImage } from '@/components/MushafImage';
import { MushafText } from '@/components/MushafText';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PageHeader } from '@/components/PageHeader';
import { FULL_SCREEN_CONTROLS_TIMEOUT_MS, LAST_READ_SAVE_DEBOUNCE_MS } from '@/constants/config';
import { t } from '@/constants/i18n/index';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/index';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function PageScreen() {
    const { pageNumber: pageParam } = useLocalSearchParams<{ pageNumber: string }>();
    const router = useRouter();
    const { palette, spacing } = useTheme();

    const pageNumber = Math.min(604, Math.max(1, parseInt(pageParam ?? '1', 10) || 1));

    // Store selectors
    const locale = useStore((s) => s.preferences.uiLanguage);
    const fontSize = useStore((s) => s.preferences.fontSize);
    const theme = useStore((s) => s.preferences.theme);
    const mushafImageMode = useStore((s) => s.preferences.mushafImageMode);
    const setMushafImageMode = useStore((s) => s.setMushafImageMode);
    const setCurrentPage = useStore((s) => s.setCurrentPage);
    const setLastReadPage = useStore((s) => s.setLastReadPage);
    const isPageLocked = useStore((s) => s.isPageLocked);
    const isFullScreen = useStore((s) => s.isFullScreen);
    const togglePageLock = useStore((s) => s.togglePageLock);
    const toggleFullScreen = useStore((s) => s.toggleFullScreen);
    const isBookmarked = useStore((s) => s.isBookmarked(pageNumber));

    // Local fallback state: if image mode is on but image unavailable, fall back to text
    const [imageFailed, setImageFailed] = useState(false);

    // Bookmark modal state
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);

    // Full-screen controls visibility
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleImageFallback = useCallback(() => {
        setImageFailed(true);
    }, []);

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

    // Reset image fallback state when page changes
    useEffect(() => {
        setImageFailed(false);
    }, [pageNumber]);

    // Debounce ref for setLastReadPage
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Stop audio from previous page
        pause().catch(() => { });
        release().catch(() => { });

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

    // Get page metadata (safe — pageNumber is clamped to [1, 604])
    const previousLabel = t('page_previous', locale);
    const nextLabel = t('page_next', locale);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: palette.border,
            backgroundColor: palette.surface,
        },
        toggleLabel: {
            fontSize: 14,
            color: palette.text,
        },
        pageContent: {
            flex: 1,
        },
        navRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border,
            backgroundColor: palette.surface,
        },
        navButton: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 8,
            backgroundColor: palette.primary,
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

    const isPrevDisabled = pageNumber <= 1 || isPageLocked;
    const isNextDisabled = pageNumber >= 604 || isPageLocked;

    const showImageMode = mushafImageMode && !imageFailed;
    const showChrome = !isFullScreen || showControls;

    // Swipe gesture
    const translateX = useSharedValue(0);

    const navigateNext = useCallback(() => {
        router.push(`/page/${pageNumber + 1}`);
    }, [router, pageNumber]);

    const navigatePrev = useCallback(() => {
        router.push(`/page/${pageNumber - 1}`);
    }, [router, pageNumber]);

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

    return (
        <View style={styles.container}>
            <StatusBar hidden={isFullScreen} />

            {showChrome && (
                <PageHeader
                    pageNumber={pageNumber}
                    isFullScreen={isFullScreen}
                    isPageLocked={isPageLocked}
                    isBookmarked={isBookmarked}
                    onToggleFullScreen={toggleFullScreen}
                    onTogglePageLock={togglePageLock}
                    onBookmark={() => setShowBookmarkModal(true)}
                />
            )}

            {showChrome && <OfflineBanner pageNumber={pageNumber} />}

            <BookmarkModal
                visible={showBookmarkModal}
                pageNumber={pageNumber}
                isBookmarked={isBookmarked}
                onClose={() => setShowBookmarkModal(false)}
            />

            {/* Image / Text mode toggle bar */}
            {showChrome && (
                <View style={StyleSheet.flatten([styles.toggleRow])}>
                    <Text style={styles.toggleLabel}>
                        {t('settings_image_mode', locale)}
                    </Text>
                    <Switch
                        value={mushafImageMode}
                        onValueChange={setMushafImageMode}
                        accessibilityLabel={t('settings_image_mode', locale)}
                    />
                </View>
            )}

            {/* Page content */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.pageContent, animatedStyle]}>
                    <Pressable style={styles.pageContent} onPress={handlePageContentPress}>
                        {showImageMode ? (
                            <MushafImage
                                pageNumber={pageNumber}
                                onFallback={handleImageFallback}
                            />
                        ) : (
                            <MushafText
                                pageNumber={pageNumber}
                                fontSize={fontSize}
                                theme={theme}
                            />
                        )}
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
                    </Pressable>
                </View>
            )}
        </View>
    );
}
