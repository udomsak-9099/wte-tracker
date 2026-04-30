import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

type Props = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "📋",
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  icon: { fontSize: 48, marginBottom: space.sm },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginBottom: space.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    marginTop: space.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
