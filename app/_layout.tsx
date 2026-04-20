import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, I18nManager, View } from 'react-native';
import 'react-native-reanimated';

import { initLockScreen } from '@/features/audio/lockScreen';
import { useStore } from '@/store/index';
import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hasHydrated = useStore((s) => s._hasHydrated);
  const uiLanguage = useStore((s) => s.preferences.uiLanguage);

  // Load custom Arabic font — gracefully handles missing font file
  const [fontsLoaded] = useFonts({
    KFGQPCUthmanicScript: require('../assets/fonts/KFGQPCUthmanicScript.ttf'),
    QPC_P1: require('../assets/fonts/p1.ttf'),
  });

  useEffect(() => {
    initLockScreen().catch(() => {
      // Silently ignore errors — background audio mode is best-effort
    });
  }, []);

  // Apply RTL when Arabic UI language is selected.
  // Note: I18nManager.forceRTL sets a flag read at startup — a full app restart
  // is required for the RTL layout change to take full effect (React Native limitation).
  useEffect(() => {
    if (uiLanguage === 'ar') {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }
  }, [uiLanguage]);

  // Wait for AsyncStorage rehydration before rendering screens
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="page/[pageNumber]" options={{ headerShown: false }} />
        <Stack.Screen name="bookmarks" options={{ title: 'Bookmarks' }} />
        <Stack.Screen name="downloads" options={{ title: 'Downloads' }} />
        <Stack.Screen name="page-browser" options={{ presentation: 'modal', title: 'Go to Page' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
