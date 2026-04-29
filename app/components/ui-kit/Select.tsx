import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

export type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  error?: string;
};

export function Select({ label, options, value, onChange, error }: Props) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[
                styles.chip,
                selected && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && { color: colors.text, fontWeight: fontWeight.semibold },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    marginBottom: space.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  chipText: { color: colors.textMuted, fontSize: fontSize.sm },
  error: { color: colors.danger, fontSize: fontSize.xs, marginTop: 4 },
});
