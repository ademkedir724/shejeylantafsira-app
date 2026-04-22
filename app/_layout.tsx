import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, I18nManager, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { initLockScreen } from '@/features/audio/lockScreen';
import { useStore } from '@/store/index';
import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const uiLanguage = useStore((s) => s.preferences.uiLanguage);

  const [fontsLoaded, fontError] = useFonts({
    QPC_P1: require('../assets/fonts/p1.ttf'),
  });

  useEffect(() => {
    initLockScreen().catch(() => { });
  }, []);

  useEffect(() => {
    I18nManager.forceRTL(uiLanguage === 'ar');
  }, [uiLanguage]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="page/[pageNumber]" options={{ headerShown: false }} />
          <Stack.Screen name="bookmarks" options={{ title: 'Bookmarks' }} />
          <Stack.Screen name="downloads" options={{ title: 'Downloads' }} />
          <Stack.Screen name="page-browser" options={{ presentation: 'modal', title: 'Go to Page' }} />
          <Stack.Screen name="_debug" options={{ title: 'Debug' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
