import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/constants/i18n';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store';

export default function HomeScreen() {
  const router = useRouter();
  const { palette, spacing } = useTheme();
  const lastReadPage = useStore((s) => s.preferences.lastReadPage);
  const uiLanguage = useStore((s) => s.preferences.uiLanguage);

  const styles = makeStyles(palette, spacing);

  const goToPage = (page: number) => {
    console.log('[HomeScreen] navigating to page', page);
    router.push(`/page/${page}`);
  };

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
  });
}
