import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Даалгавар', presentation: 'modal' }} />
        <Stack.Screen name="subject/[id]" options={{ title: 'Хичээл', presentation: 'modal' }} />
        <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz' }} />
        <Stack.Screen name="quiz/result" options={{ title: 'Үр дүн', headerBackVisible: false }} />
        <Stack.Screen name="pomodoro" options={{ title: 'Pomodoro төвлөрөл' }} />
        <Stack.Screen name="profile" options={{ title: 'Профайл ба тохиргоо' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
