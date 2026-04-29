import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth";
import { useProject } from "@/contexts/project";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export default function Finance() {
  const { profile } = useAuth();
  const { current } = useProject();
  const canSeeEquity = profile?.role !== "bank";

  const loans = useQuery({
    enabled: !!current,
    queryKey: ["loans", current?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_drawdowns")
        .select("*")
        .eq("project_id", current!.id)
        .order("drawdown_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const equity = useQuery({
    enabled: !!current && canSeeEquity,
    queryKey: ["equity", current?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equity_calls")
        .select("*")
        .eq("project_id", current!.id)
        .order("call_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const milestones = useQuery({
    enabled: !!current,
    queryKey: ["milestones", current?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_milestones")
        .select("*")
        .eq("project_id", current!.id)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const totalLoan = (loans.data ?? []).reduce(
    (s, l) => s + Number(l.amount),
    0
  );
  const totalEquity = (equity.data ?? []).reduce(
    (s, e) => s + Number(e.amount),
    0
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h}>Funding</Text>
        <View style={styles.row}>
          <Card label="Loan drawdowns" value={`฿${fmt(totalLoan)}`} />
          {canSeeEquity && (
            <Card label="Equity calls" value={`฿${fmt(totalEquity)}`} />
          )}
        </View>

        <Text style={styles.h}>Upcoming milestones</Text>
        {(milestones.data ?? []).length === 0 && (
          <Text style={styles.empty}>
            {milestones.isLoading ? "Loading…" : "No payment milestones yet."}
          </Text>
        )}
        {(milestones.data ?? []).map((m) => (
          <View key={m.id} style={styles.card}>
            <Text style={styles.name}>{m.name}</Text>
            <Text style={styles.amount}>฿{fmt(Number(m.amount))}</Text>
            <Text style={styles.meta}>
              {m.funding_source} • due {m.due_date ?? "—"} • {m.status}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ label, value }: { label: string; value: string }) {
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
  h: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    marginTop: space.sm,
  },
  empty: { color: colors.textMuted, textAlign: "center", marginVertical: space.lg },
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
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  amount: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  meta: { color: colors.textDim, fontSize: fontSize.xs, marginTop: 4 },
});
