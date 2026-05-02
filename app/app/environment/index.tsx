import { Stack, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useProject } from "@/contexts/project";
import { useEnvRecords } from "@/features/environment/queries";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

const STATUS_COLOR: Record<string, string> = {
  compliant: colors.success,
  warning: colors.warning,
  exceeded: colors.danger,
};

export default function EnvironmentScreen() {
  const { current } = useProject();
  const records = useEnvRecords(current?.id);
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Environmental",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/environment/new")}
              style={{ paddingHorizontal: space.md }}
            >
              <Text style={{ color: colors.primary, fontSize: fontSize.md }}>
                + New
              </Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        contentContainerStyle={styles.content}
        data={records.data ?? []}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {records.isLoading ? "Loading…" : "No environmental records yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.parameter}>{item.parameter}</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      STATUS_COLOR[item.status ?? "compliant"],
                  },
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.value}>
              {item.value ?? "—"} {item.unit ?? ""}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{item.category ?? "—"}</Text>
              <Text style={styles.meta}>{item.record_date}</Text>
            </View>
            {(item.threshold_min != null || item.threshold_max != null) && (
              <Text style={styles.threshold}>
                Limit: {item.threshold_min ?? "−∞"} – {item.threshold_max ?? "∞"}
              </Text>
            )}
            {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  parameter: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  value: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: { color: colors.textMuted, fontSize: fontSize.xs },
  threshold: { color: colors.textDim, fontSize: fontSize.xs },
  notes: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
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
});
