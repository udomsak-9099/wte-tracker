import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/database.types";

const COD_TARGET = new Date("2026-11-30");

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [counts, setCounts] = useState({
    tasks: 0,
    issuesOpen: 0,
    permitsObtained: 0,
    permitsTotal: 0,
  });

  useEffect(() => {
    (async () => {
      const [{ data: p }, tasks, openIssues, permits, permitsObtained] = await Promise.all([
        supabase.from("projects").select("*").limit(1).maybeSingle(),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase
          .from("issues")
          .select("*", { count: "exact", head: true })
          .eq("status", "open"),
        supabase.from("permits").select("*", { count: "exact", head: true }),
        supabase
          .from("permits")
          .select("*", { count: "exact", head: true })
          .eq("status", "obtained"),
      ]);
      setProject(p);
      setCounts({
        tasks: tasks.count ?? 0,
        issuesOpen: openIssues.count ?? 0,
        permitsObtained: permitsObtained.count ?? 0,
        permitsTotal: permits.count ?? 0,
      });
    })();
  }, []);

  const cod = project?.cod_target_date
    ? new Date(project.cod_target_date)
    : COD_TARGET;
  const daysToCod = daysUntil(cod);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>
          Welcome back, {profile?.full_name ?? "—"}
        </Text>
        <Text style={styles.role}>{profile?.role ?? ""}</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Days to COD</Text>
          <Text style={styles.heroValue}>{daysToCod}</Text>
          <Text style={styles.heroSub}>
            Target: {cod.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Stat label="Tasks" value={counts.tasks} />
          <Stat label="Open Issues" value={counts.issuesOpen} />
        </View>
        <View style={styles.row}>
          <Stat
            label="Permits"
            value={`${counts.permitsObtained}/${counts.permitsTotal}`}
          />
          <Stat label="Project" value={project?.name ?? "Not set"} small />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, small && { fontSize: 18 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1225" },
  content: { padding: 16, gap: 12 },
  welcome: { color: "#fff", fontSize: 22, fontWeight: "700" },
  role: { color: "#7eb1ff", fontSize: 13, textTransform: "uppercase", marginBottom: 8 },
  heroCard: {
    backgroundColor: "#1a1f3a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3050",
  },
  heroLabel: { color: "#a0a8c0", fontSize: 13, textTransform: "uppercase" },
  heroValue: { color: "#3b82f6", fontSize: 64, fontWeight: "800", marginVertical: 4 },
  heroSub: { color: "#a0a8c0", fontSize: 13 },
  row: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1f3a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a3050",
  },
  statLabel: { color: "#a0a8c0", fontSize: 12, textTransform: "uppercase" },
  statValue: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 4 },
});
