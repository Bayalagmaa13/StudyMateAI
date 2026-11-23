import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';

import type { IconName } from '@/components/ui';
import { colors } from '@/theme';

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color as string} size={size} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Нүүр', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="planner" options={{ title: 'Төлөвлөгч', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="tutor" options={{ title: 'AI Tutor', tabBarIcon: icon('sparkles') }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz', tabBarIcon: icon('help-circle') }} />
      <Tabs.Screen name="progress" options={{ title: 'Ахиц', tabBarIcon: icon('stats-chart') }} />
    </Tabs>
  );
}
