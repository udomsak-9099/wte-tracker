import { Stack } from "expo-router";

import { HomeButton } from "@/components/ui-kit/HomeButton";
import { colors } from "@/lib/theme";

export default function EpcLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.bg },
        headerRight: () => <HomeButton />,
      }}
    />
  );
}
