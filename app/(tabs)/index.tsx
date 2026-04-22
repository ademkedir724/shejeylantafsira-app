import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/constants/i18n';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store';

export default function HomeScreen() {
  const router = useRouter();
  const { palette, spacing } = useTheme();
  const lastReadPage = useStore((s) => s.preferences.lastReadPage);
  const bookmarkCount = useStore((s) => s.bookmarks.length);
  const uiLanguage = useStore((s) => s.preferences.uiLanguage);

  const styles = makeStyles(palette, spacing);

  const goToPage = (page: number) => {
    router.push(`/page/${page}`);
  };

  const bookmarksRow = (
    <Pressable
      style={({ pressed }) => [styles.bookmarksBtn, pressed && styles.buttonPressed]}
      onPress={() => router.push('/bookmarks')}
      accessibilityRole="button"
      accessibilityLabel="View bookmarks"
    >
      <Ionicons name="bookmark" size={18} color={palette.primary} />
      <Text style={styles.bookmarksBtnText}>
        {t('bookmarks_title', uiLanguage)}
        {bookmarkCount > 0 ? `  (${bookmarkCount})` : ''}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
    </Pressable>
  );

  if (lastReadPage) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t('home_resume_prompt', uiLanguage).replace('{{page}}', String(lastReadPage))}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => goToPage(lastReadPage)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{t('home_resume_button', uiLanguage)}</Text>
          </Pressable>
        </View>
        {bookmarksRow}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeTitle}>{t('home_welcome', uiLanguage)}</Text>
      <Text style={styles.welcomeSubtitle}>{t('home_welcome_subtitle', uiLanguage)}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => goToPage(1)}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{t('home_start_reading', uiLanguage)}</Text>
      </Pressable>
      {bookmarksRow}
    </View>
  );
}

function makeStyles(
  palette: ReturnType<typeof useTheme>['palette'],
  spacing: ReturnType<typeof useTheme>['spacing'],
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: spacing.lg,
      width: '100%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    cardTitle: {
      fontSize: 18,
      color: palette.text,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: palette.textSecondary,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    button: {
      backgroundColor: palette.primary,
      borderRadius: 8,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      minWidth: 160,
      minHeight: 44,
      justifyContent: 'center',
    },
    buttonPressed: {
      opacity: 0.75,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    bookmarksBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      minWidth: 200,
      justifyContent: 'center',
    },
    bookmarksBtnText: {
      fontSize: 15,
      color: palette.primary,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
    },
  });
}
