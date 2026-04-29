import { Stack } from "expo-router";

import { colors } from "@/lib/theme";

export default function IssuesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
