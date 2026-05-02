import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { Permit } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

const STATUS_COLOR: Record<string, string> = {
  obtained: colors.success,
  in_progress: "#f97316",
  pending: colors.warning,
  expired: colors.danger,
  rejected: colors.danger,
};

type ChecklistItem = { label: string; done: boolean };

function parseChecklist(raw: unknown): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (i): i is ChecklistItem =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as ChecklistItem).label === "string"
    )
    .map((i) => ({ label: i.label, done: Boolean(i.done) }));
}

export default function PermitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const permit = useQuery<Permit | null>({
    enabled: !!id,
    queryKey: ["permit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permits")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return (data as Permit) ?? null;
    },
  });

  const data = permit.data;
  const checklist = parseChecklist(data?.checklist);
  const doneCount = checklist.filter((c) => c.done).length;
  const progress =
    checklist.length > 0 ? (doneCount / checklist.length) * 100 : data?.progress ?? 0;

  return (
    <>
      <Stack.Screen options={{ title: data?.name ?? "Permit" }} />
      <ScrollView contentContainerStyle={styles.content}>
        {data && (
          <>
            <View style={styles.header}>
              <View style={styles.headRow}>
                <Text style={styles.name}>{data.name}</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        STATUS_COLOR[data.status ?? "pending"],
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>{data.status}</Text>
                </View>
              </View>
              {data.authority && <Text style={styles.meta}>{data.authority}</Text>}
              {data.ref_number && (
                <Text style={styles.ref}>Ref: {data.ref_number}</Text>
              )}
              <View style={styles.bar}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.min(progress, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progress}>{Math.round(progress)}%</Text>
            </View>

            <View style={styles.dates}>
              {data.issue_date && (
                <DateRow label="Issued" value={data.issue_date} />
              )}
              {data.expiry_date && (
                <DateRow label="Expires" value={data.expiry_date} />
              )}
            </View>

            {checklist.length > 0 && (
              <View style={styles.checklistCard}>
                <Text style={styles.h}>
                  Checklist ({doneCount}/{checklist.length})
                </Text>
                {checklist.map((c, i) => (
                  <View key={i} style={styles.checkRow}>
                    <Text
                      style={[
                        styles.checkBox,
                        c.done && {
                          backgroundColor: colors.success,
                          borderColor: colors.success,
                        },
                      ]}
                    >
                      {c.done ? "✓" : ""}
                    </Text>
                    <Text
                      style={[
                        styles.checkText,
                        c.done && {
                          color: colors.textDim,
                          textDecorationLine: "line-through",
                        },
                      ]}
                    >
                      {c.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {data.notes && (
              <View style={styles.notesCard}>
                <Text style={styles.h}>Notes</Text>
                <Text style={styles.notes}>{data.notes}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dateRow}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.dateValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: 32 },
  header: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: space.sm,
  },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, flex: 1 },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
  },
  meta: { color: colors.textMuted, fontSize: fontSize.sm },
  ref: { color: colors.textLink, fontSize: fontSize.xs },
  bar: { height: 8, backgroundColor: colors.border, borderRadius: 4, marginTop: 6 },
  barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  progress: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: "right" },
  dates: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dateLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  dateValue: { color: colors.text, fontSize: fontSize.sm },
  checklistCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.sm,
  },
  h: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  checkBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    textAlign: "center",
    fontSize: fontSize.sm,
    lineHeight: 22,
    backgroundColor: colors.bg,
  },
  checkText: { color: colors.text, fontSize: fontSize.sm, flex: 1 },
  notesCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notes: { color: colors.textMuted, fontSize: fontSize.sm },
});
