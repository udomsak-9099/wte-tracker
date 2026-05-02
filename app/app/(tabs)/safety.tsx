import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui-kit/EmptyState";
import { useAuth } from "@/contexts/auth";
import { useProject } from "@/contexts/project";
import type { SafetyIncident } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, severityColor, space } from "@/lib/theme";

type Severity = SafetyIncident["severity"];

export default function Safety() {
  const { current } = useProject();
  const { profile } = useAuth();
  const router = useRouter();
  const canReport =
    profile?.role === "admin" ||
    profile?.role === "epc_pm" ||
    profile?.role === "safety_officer";

  const incidents = useQuery<SafetyIncident[]>({
    enabled: !!current,
    queryKey: ["safety-incidents", current?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_incidents")
        .select("*")
        .eq("project_id", current!.id)
        .order("incident_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as SafetyIncident[];
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={incidents.data ?? []}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={styles.h}>Recent incidents</Text>
            {canReport && (
              <Pressable
                style={styles.reportBtn}
                onPress={() => router.push("/safety-incidents/new")}
              >
                <Text style={styles.reportBtnText}>+ Report</Text>
              </Pressable>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={incidents.isRefetching}
            onRefresh={() => incidents.refetch()}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          incidents.isLoading ? null : (
            <EmptyState
              icon="🦺"
              title="No incidents"
              description="Safe so far — incidents reported here once filed."
              actionLabel={canReport ? "+ Report incident" : undefined}
              onAction={
                canReport
                  ? () => router.push("/safety-incidents/new")
                  : undefined
              }
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.date}>{item.incident_date}</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      severityColor[(item.severity ?? "medium") as NonNullable<Severity>],
                  },
                ]}
              >
                <Text style={styles.badgeText}>{item.severity}</Text>
              </View>
            </View>
            <Text style={styles.type}>{item.incident_type ?? "—"}</Text>
            <Text style={styles.desc}>{item.description ?? ""}</Text>
            <Text style={styles.loc}>{item.location ?? ""}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },
  h: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    marginBottom: 4,
  },
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
  date: { color: colors.textLink, fontSize: fontSize.sm },
  badge: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
  },
  type: { color: colors.text, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  desc: { color: colors.textMuted, fontSize: fontSize.sm },
  loc: { color: colors.textDim, fontSize: fontSize.xs },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reportBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  reportBtnText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
