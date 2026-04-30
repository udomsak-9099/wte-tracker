import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSize, fontWeight, space } from "@/lib/theme";

export function HomeButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.replace("/(tabs)/dashboard")}
      style={styles.btn}
      hitSlop={8}
    >
      <Text style={styles.text}>⌂ Home</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
  },
  text: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
