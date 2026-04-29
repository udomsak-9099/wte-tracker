import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SCurveChart } from "@/components/ui-kit/SCurveChart";
import { useAuth } from "@/contexts/auth";
import { useProject } from "@/contexts/project";
import { useRealtimeAlerts } from "@/hooks/data/useRealtimeAlerts";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { current } = useProject();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - space.lg * 2 - 24, 600);
  useRealtimeAlerts();

  const counts = useQuery({
    enabled: !!current,
    queryKey: ["dashboard-counts", current?.id],
    queryFn: async () => {
      if (!current) return null;
      const [tasks, openIssues, permitsTotal, permitsObtained, phases] =
        await Promise.all([
          supabase
            .from("tasks")
            .select("id, phases!inner(project_id)", { count: "exact", head: true })
            .eq("phases.project_id", current.id),
          supabase
            .from("issues")
            .select("id, phases!inner(project_id)", { count: "exact", head: true })
            .eq("phases.project_id", current.id)
            .eq("status", "open"),
          supabase
            .from("permits")
            .select("*", { count: "exact", head: true })
            .eq("project_id", current.id),
          supabase
            .from("permits")
            .select("*", { count: "exact", head: true })
            .eq("project_id", current.id)
            .eq("status", "obtained"),
          supabase
            .from("phases")
            .select("progress")
            .eq("project_id", current.id),
        ]);
      const phaseRows = phases.data ?? [];
      const overallProgress =
        phaseRows.length === 0
          ? 0
          : phaseRows.reduce((s, p) => s + (p.progress ?? 0), 0) /
            phaseRows.length;
      return {
        tasks: tasks.count ?? 0,
        issuesOpen: openIssues.count ?? 0,
        permitsObtained: permitsObtained.count ?? 0,
        permitsTotal: permitsTotal.count ?? 0,
        overallProgress,
      };
    },
  });

  const cod = current?.cod_target_date
    ? new Date(current.cod_target_date)
    : null;
  const daysToCod = cod ? daysUntil(cod) : null;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>
          Welcome back, {profile?.full_name ?? "—"}
        </Text>
        <Text style={styles.role}>
          {profile?.role} · {current?.name ?? "No project"}
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Days to COD</Text>
          <Text style={styles.heroValue}>
            {daysToCod !== null ? daysToCod : "—"}
          </Text>
          <Text style={styles.heroSub}>
            Target: {cod?.toLocaleDateString() ?? "Not set"}
          </Text>
        </View>

        {current?.start_date && current?.cod_target_date && (
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Progress curve</Text>
            <SCurveChart
              startDate={current.start_date}
              endDate={current.cod_target_date}
              actualProgress={counts.data?.overallProgress ?? 0}
              width={chartWidth}
              height={180}
            />
          </View>
        )}

        <View style={styles.row}>
          <Stat label="Tasks" value={counts.data?.tasks ?? 0} />
          <Stat
            label="Open Issues"
            value={counts.data?.issuesOpen ?? 0}
            onPress={() => router.push("/issues")}
          />
        </View>
        <View style={styles.row}>
          <Stat
            label="Permits"
            value={`${counts.data?.permitsObtained ?? 0}/${counts.data?.permitsTotal ?? 0}`}
            onPress={() => router.push("/permits")}
          />
          <Stat
            label="Capacity"
            value={current?.capacity_mw ? `${current.capacity_mw} MW` : "—"}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string | number;
  onPress?: () => void;
}) {
  const Wrap = onPress ? Pressable : View;
  return (
    <Wrap style={styles.statCard} onPress={onPress}>
      <Text style={styles.statLabel}>
        {label}
        {onPress ? "  ›" : ""}
      </Text>
      <Text style={styles.statValue}>{value}</Text>
    </Wrap>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },
  welcome: { color: colors.text, fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  role: {
    color: colors.textLink,
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    marginBottom: space.sm,
  },
  heroCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: space.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLabel: { color: colors.textMuted, fontSize: fontSize.sm, textTransform: "uppercase" },
  heroValue: {
    color: colors.primary,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.extrabold,
    marginVertical: 4,
  },
  heroSub: { color: colors.textMuted, fontSize: fontSize.sm },
  chartCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    marginBottom: space.sm,
  },
  row: { flexDirection: "row", gap: space.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, textTransform: "uppercase" },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginTop: 4,
  },
});
