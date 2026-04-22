import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { HapticTab } from '../../components/haptic-tab';
import { useColorScheme } from '../../hooks/use-color-scheme';

// Active colors per theme
const ACTIVE_COLOR_LIGHT = '#1B5E20';
const ACTIVE_COLOR_DARK = '#81C784';

// Inactive icon colors — chosen for clear contrast against each tab bar background
const INACTIVE_COLOR_LIGHT = '#555555';  // dark grey on white bg
const INACTIVE_COLOR_DARK = '#BBBBBB';   // light grey on dark bg (#1E1E1E)

// Tab bar backgrounds — match src/constants/theme.ts surface values
const TAB_BG_LIGHT = '#FFFFFF';
const TAB_BG_DARK = '#1E1E1E';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeColor = isDark ? ACTIVE_COLOR_DARK : ACTIVE_COLOR_LIGHT;
  const inactiveColor = isDark ? INACTIVE_COLOR_DARK : INACTIVE_COLOR_LIGHT;
  const tabBarBg = isDark ? TAB_BG_DARK : TAB_BG_LIGHT;
  const headerBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const headerText = isDark ? '#E8E8E8' : '#1A1A1A';
  const borderColor = isDark ? '#444444' : '#E0E0E0';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: true,
        headerStyle: {
          backgroundColor: headerBg,
        },
        headerTintColor: headerText,
        headerShadowVisible: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: borderColor,
          borderTopWidth: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="juz"
        options={{
          title: 'Juz',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="surah"
        options={{
          title: 'Surah',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
