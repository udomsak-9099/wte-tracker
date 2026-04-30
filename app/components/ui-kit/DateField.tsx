import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode?: "date" | "datetime";
  error?: string;
};

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function toIsoDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function parseValue(value: string): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function DateField({
  label,
  value,
  onChange,
  mode = "date",
  error,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const date = parseValue(value);

  function handleChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    if (selected) {
      onChange(mode === "date" ? toIsoDate(selected) : toIsoDateTime(selected));
    }
  }

  if (Platform.OS === "web") {
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <input
          type={mode === "date" ? "date" : "datetime-local"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: colors.bgElevated,
            color: colors.text,
            borderRadius: radius.md,
            paddingLeft: space.lg,
            paddingRight: space.lg,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: fontSize.md,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: error ? colors.danger : colors.border,
            colorScheme: "dark",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          } as React.CSSProperties}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.input, error && { borderColor: colors.danger }]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.value}>{value || "Tap to choose"}</Text>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
      {Platform.OS === "ios" && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={date}
          mode={mode}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { color: colors.text, fontSize: fontSize.md },
  error: { color: colors.danger, fontSize: fontSize.xs, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalDone: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
