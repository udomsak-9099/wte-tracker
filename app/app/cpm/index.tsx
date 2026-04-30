import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { GanttChart } from "@/components/ui-kit/GanttChart";
import { useProject } from "@/contexts/project";
import {
  pertProbability,
  useCpmSummary,
  useCpmTasks,
  useRecomputeCpm,
} from "@/features/cpm/queries";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

type Tab = "list" | "gantt";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

function fmtNum(n: number | null | undefined, digits = 1): string {
  if (n == null) return "—";
  return Number(n).toFixed(digits);
}

export default function CpmScreen() {
  const { current } = useProject();
  const tasks = useCpmTasks(current?.id);
  const summary = useCpmSummary(tasks.data);
  const recompute = useRecomputeCpm(current?.id);
  const [tab, setTab] = useState<Tab>("list");
  const { width } = useWindowDimensions();

  // PERT analytics
  const pertData = useMemo(() => {
    if (!current?.cod_target_date || !current?.start_date) return null;
    const start = new Date(current.start_date).getTime();
    const cod = new Date(current.cod_target_date).getTime();
    const codDays = Math.max(0, Math.round((cod - start) / 86_400_000));
    const sigma = Math.sqrt(summary.criticalPathVariance);
    const probability = pertProbability(
      summary.projectFinishDays,
      summary.criticalPathVariance,
      codDays
    );
    return {
      codDays,
      mean: summary.projectFinishDays,
      sigma,
      probability,
      slackToCod: codDays - summary.projectFinishDays,
    };
  }, [current, summary]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "CPM / PERT",
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={tasks.isRefetching}
            onRefresh={() => tasks.refetch()}
            tintColor={colors.primary}
          />
        }
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            label="Tasks"
            value={String(summary.totalTasks)}
            sub={`${summary.criticalTasks} critical`}
          />
          <SummaryCard
            label="Project finish"
            value={`${summary.projectFinishDays} d`}
            sub={pertData ? `target ${pertData.codDays} d` : ""}
            color={
              pertData && pertData.slackToCod < 0 ? colors.danger : colors.text
            }
          />
        </View>

        {pertData && (
          <View style={styles.pertCard}>
            <Text style={styles.pertTitle}>
              PERT — probability of meeting COD
            </Text>
            <View style={styles.pertRow}>
              <View>
                <Text style={styles.pertNum}>
                  {(pertData.probability * 100).toFixed(0)}%
                </Text>
                <Text style={styles.pertSub}>chance on time</Text>
              </View>
              <View style={styles.pertStats}>
                <Text style={styles.pertStat}>
                  μ = {fmtNum(pertData.mean, 0)} d
                </Text>
                <Text style={styles.pertStat}>
                  σ = {fmtNum(pertData.sigma, 1)} d
                </Text>
                <Text style={styles.pertStat}>
                  Buffer ={" "}
                  <Text
                    style={{
                      color:
                        pertData.slackToCod < 7
                          ? colors.danger
                          : pertData.slackToCod < 14
                            ? colors.warning
                            : colors.success,
                    }}
                  >
                    {pertData.slackToCod} d
                  </Text>
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.recomputeBtn}
              onPress={() => recompute.mutate()}
              disabled={recompute.isPending}
            >
              {recompute.isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.recomputeText}>↻ Recompute CPM</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === "list" && styles.tabActive]}
            onPress={() => setTab("list")}
          >
            <Text style={[styles.tabText, tab === "list" && styles.tabTextActive]}>
              List
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === "gantt" && styles.tabActive]}
            onPress={() => setTab("gantt")}
          >
            <Text style={[styles.tabText, tab === "gantt" && styles.tabTextActive]}>
              Gantt
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        {tasks.isLoading && (
          <ActivityIndicator size="large" color={colors.primary} />
        )}

        {tab === "gantt" && tasks.data && (
          <View style={styles.ganttCard}>
            <GanttChart tasks={tasks.data} width={Math.max(width - 32, 800)} />
            <View style={styles.legend}>
              <LegendItem color={colors.danger} label="Critical (slack=0)" />
              <LegendItem color={colors.primary} label="Has slack" />
              <LegendItem color={colors.textDim} label="Slack zone" />
            </View>
          </View>
        )}

        {tab === "list" &&
          (tasks.data ?? []).map((t) => (
            <View
              key={t.id}
              style={[
                styles.taskCard,
                t.is_critical && {
                  borderColor: colors.danger,
                  borderLeftWidth: 4,
                },
              ]}
            >
              <View style={styles.taskHead}>
                <Text style={styles.taskName} numberOfLines={2}>
                  {t.name}
                </Text>
                {t.is_critical && (
                  <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                    <Text style={styles.badgeText}>CRITICAL</Text>
                  </View>
                )}
              </View>
              <Text style={styles.taskMeta}>
                {t.phases?.name ?? "—"}
              </Text>
              <View style={styles.taskGrid}>
                <Stat label="ES" value={`D${t.es_offset_days ?? 0}`} />
                <Stat label="EF" value={`D${t.ef_offset_days ?? 0}`} />
                <Stat label="LS" value={`D${t.ls_offset_days ?? 0}`} />
                <Stat label="LF" value={`D${t.lf_offset_days ?? 0}`} />
                <Stat
                  label="Slack"
                  value={`${t.slack_days ?? 0}d`}
                  color={
                    (t.slack_days ?? 0) === 0
                      ? colors.danger
                      : (t.slack_days ?? 0) < 7
                        ? colors.warning
                        : colors.success
                  }
                />
                <Stat label="Dur" value={`${t.duration_days ?? 0}d`} />
              </View>
              {t.optimistic_days !== null && (
                <Text style={styles.pert}>
                  PERT: O={t.optimistic_days} M={t.likely_days} P=
                  {t.pessimistic_days} → TE={fmtNum(t.expected_days)} σ²=
                  {fmtNum(t.variance, 2)}
                </Text>
              )}
              <Text style={styles.dates}>
                {fmtDate(t.es_date_calc)} → {fmtDate(t.ef_date_calc)}
              </Text>
            </View>
          ))}
      </ScrollView>
    </>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: 32 },
  summaryRow: { flexDirection: "row", gap: space.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, textTransform: "uppercase" },
  statValue: { color: colors.text, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginTop: 2 },
  statSub: { color: colors.textDim, fontSize: fontSize.xs },

  pertCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pertTitle: { color: colors.textMuted, fontSize: fontSize.xs, textTransform: "uppercase", marginBottom: space.sm },
  pertRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pertNum: { color: colors.primary, fontSize: 36, fontWeight: fontWeight.extrabold },
  pertSub: { color: colors.textMuted, fontSize: fontSize.xs },
  pertStats: { gap: 4, alignItems: "flex-end" },
  pertStat: { color: colors.textMuted, fontSize: fontSize.sm },
  recomputeBtn: {
    marginTop: space.md,
    paddingVertical: space.sm,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recomputeText: { color: colors.textLink, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  tabs: {
    flexDirection: "row",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: "center" },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.text, fontWeight: fontWeight.semibold },

  ganttCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  legend: { flexDirection: "row", gap: space.lg, marginTop: space.md, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textMuted, fontSize: fontSize.xs },

  taskCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  taskHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: space.sm },
  taskName: { color: colors.text, fontSize: fontSize.base, fontWeight: fontWeight.semibold, flex: 1 },
  taskMeta: { color: colors.textLink, fontSize: fontSize.xs },
  taskGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, gap: 6 },
  statCell: {
    minWidth: 60,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
  },
  cellLabel: { color: colors.textDim, fontSize: 9, textTransform: "uppercase" },
  cellValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  pert: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 4 },
  dates: { color: colors.textDim, fontSize: fontSize.xs, marginTop: 2 },

  badge: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: { color: colors.text, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: "uppercase" },
});
