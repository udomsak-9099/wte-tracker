import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth";
import { useProject } from "@/contexts/project";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { current } = useProject();

  const counts = useQuery({
    enabled: !!current,
    queryKey: ["dashboard-counts", current?.id],
    queryFn: async () => {
      if (!current) return null;
      const [tasks, openIssues, permitsTotal, permitsObtained] =
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
        ]);
      return {
        tasks: tasks.count ?? 0,
        issuesOpen: openIssues.count ?? 0,
        permitsObtained: permitsObtained.count ?? 0,
        permitsTotal: permitsTotal.count ?? 0,
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

        <View style={styles.row}>
          <Stat label="Tasks" value={counts.data?.tasks ?? 0} />
          <Stat label="Open Issues" value={counts.data?.issuesOpen ?? 0} />
        </View>
        <View style={styles.row}>
          <Stat
            label="Permits"
            value={`${counts.data?.permitsObtained ?? 0}/${counts.data?.permitsTotal ?? 0}`}
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
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
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
