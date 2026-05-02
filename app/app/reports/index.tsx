import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useProject } from "@/contexts/project";
import { exportCsv, rowsToCsv } from "@/lib/csv";
import { trackEvent } from "@/lib/observability";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

type ReportRow = {
  id: string;
  report_date: string;
  manpower_count: number | null;
  weather: string | null;
  activities: string | null;
  remarks: string | null;
  epc_systems: { name: string; project_id: string | null } | null;
};

function groupByDate(rows: ReportRow[]) {
  const map = new Map<string, ReportRow[]>();
  for (const r of rows) {
    const list = map.get(r.report_date) ?? [];
    list.push(r);
    map.set(r.report_date, list);
  }
  return Array.from(map.entries())
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default function ReportsScreen() {
  const { current } = useProject();

  const reports = useQuery({
    enabled: !!current,
    queryKey: ["all-reports", current?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("epc_daily_reports")
        .select("*, epc_systems!inner(name, project_id)")
        .eq("epc_systems.project_id", current!.id)
        .order("report_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as ReportRow[];
    },
  });

  const grouped = useMemo(
    () => groupByDate(reports.data ?? []),
    [reports.data]
  );

  function handleExport() {
    const all = reports.data ?? [];
    if (all.length === 0) return;
    const csv = rowsToCsv(
      all.map((r) => ({
        date: r.report_date,
        system: r.epc_systems?.name ?? "",
        manpower: r.manpower_count ?? 0,
        weather: r.weather ?? "",
        activities: r.activities ?? "",
        remarks: r.remarks ?? "",
      })),
      [
        { key: "date", header: "Date" },
        { key: "system", header: "System" },
        { key: "manpower", header: "Manpower" },
        { key: "weather", header: "Weather" },
        { key: "activities", header: "Activities" },
        { key: "remarks", header: "Remarks" },
      ]
    );
    const projectCode = current?.code ?? "project";
    const today = new Date().toISOString().slice(0, 10);
    void exportCsv(`${projectCode}-reports-${today}.csv`, csv);
    trackEvent("reports_csv_exported", { count: all.length });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Reports",
          headerRight: () =>
            (reports.data ?? []).length > 0 ? (
              <Pressable
                onPress={handleExport}
                style={{ paddingHorizontal: space.md }}
              >
                <Text style={{ color: colors.primary, fontSize: fontSize.md }}>
                  Export CSV
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      <FlatList
        contentContainerStyle={styles.content}
        data={grouped}
        keyExtractor={(g) => g.date}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {reports.isLoading ? "Loading…" : "No daily reports yet."}
          </Text>
        }
        renderItem={({ item }) => {
          const totalManpower = item.items.reduce(
            (s, r) => s + (r.manpower_count ?? 0),
            0
          );
          return (
            <View style={styles.daySection}>
              <View style={styles.dayHead}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.summary}>
                  {item.items.length} reports · {totalManpower} workers
                </Text>
              </View>
              {item.items.map((r) => (
                <View key={r.id} style={styles.reportCard}>
                  <Text style={styles.systemName}>
                    {r.epc_systems?.name ?? "—"}
                  </Text>
                  <Text style={styles.activities} numberOfLines={3}>
                    {r.activities}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>
                      {r.manpower_count ?? 0} workers
                    </Text>
                    {r.weather && (
                      <Text style={styles.meta}>{r.weather}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.lg, paddingBottom: 32 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  daySection: { gap: space.sm },
  dayHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  date: { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  summary: { color: colors.textMuted, fontSize: fontSize.xs },
  reportCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  systemName: {
    color: colors.textLink,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  activities: { color: colors.text, fontSize: fontSize.sm },
  metaRow: { flexDirection: "row", gap: space.md, marginTop: 2 },
  meta: { color: colors.textDim, fontSize: fontSize.xs },
});
