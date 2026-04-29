import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/auth";
import { ProjectProvider } from "@/contexts/project";
import { QueryProvider } from "@/lib/query-client";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  clearUser,
  identifyUser,
  initObservability,
} from "@/lib/observability";

initObservability();

function RootNav() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) router.replace("/(auth)/login");
    else if (session && inAuthGroup) router.replace("/(tabs)/dashboard");
  }, [session, loading, segments]);

  useEffect(() => {
    if (session?.user && profile) {
      identifyUser(session.user.id, session.user.email, profile.role);
    } else if (!session) {
      clearUser();
    }
  }, [session?.user, profile]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryProvider>
        <AuthProvider>
          <ProjectProvider>
            <RootNav />
            <StatusBar style="auto" />
          </ProjectProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
