import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useDailyReports, useEpcSystem } from "@/features/epc/queries";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

export default function EpcSystemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const system = useEpcSystem(id);
  const reports = useDailyReports(id);

  return (
    <>
      <Stack.Screen
        options={{ title: system.data?.name ?? "EPC System" }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.cat}>{system.data?.category ?? ""}</Text>
          <View style={styles.bar}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.min(system.data?.progress ?? 0, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progress}>
            {Math.round(system.data?.progress ?? 0)}% complete
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.sectionTitle}>Daily reports</Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push(`/epc/${id}/new`)}
          >
            <Text style={styles.addBtnText}>+ New report</Text>
          </Pressable>
        </View>

        <FlatList
          data={reports.data ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ gap: space.md, paddingBottom: 32 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {reports.isLoading
                ? "Loading…"
                : "No daily reports yet. Tap + New report to add one."}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              <View style={styles.reportHead}>
                <Text style={styles.reportDate}>{item.report_date}</Text>
                <Text style={styles.manpower}>
                  {item.manpower_count ?? 0} workers
                </Text>
              </View>
              {item.weather && (
                <Text style={styles.meta}>Weather: {item.weather}</Text>
              )}
              <Text style={styles.activities}>{item.activities ?? ""}</Text>
              {item.remarks && (
                <Text style={styles.remarks}>Remarks: {item.remarks}</Text>
              )}
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.lg, gap: space.md },
  header: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cat: { color: colors.textLink, fontSize: fontSize.sm, marginBottom: space.sm },
  bar: { height: 10, backgroundColor: colors.border, borderRadius: 5 },
  barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 5 },
  progress: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 6 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textTransform: "uppercase",
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
  },
  addBtnText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: space.xl,
  },
  reportCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  reportHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportDate: {
    color: colors.textLink,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  manpower: { color: colors.text, fontSize: fontSize.sm },
  meta: { color: colors.textMuted, fontSize: fontSize.xs },
  activities: { color: colors.text, fontSize: fontSize.sm },
  remarks: { color: colors.textMuted, fontSize: fontSize.xs },
});
