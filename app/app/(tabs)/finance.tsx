import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import type { LoanDrawdown, EquityCall, PaymentMilestone } from "@/lib/database.types";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export default function Finance() {
  const { profile } = useAuth();
  const [loans, setLoans] = useState<LoanDrawdown[]>([]);
  const [equity, setEquity] = useState<EquityCall[]>([]);
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);

  const canSeeEquity = profile?.role !== "bank";

  useEffect(() => {
    supabase
      .from("loan_drawdowns")
      .select("*")
      .order("drawdown_date", { ascending: false })
      .then(({ data }) => setLoans(data ?? []));
    if (canSeeEquity) {
      supabase
        .from("equity_calls")
        .select("*")
        .order("call_date", { ascending: false })
        .then(({ data }) => setEquity(data ?? []));
    }
    supabase
      .from("payment_milestones")
      .select("*")
      .order("due_date", { ascending: true })
      .then(({ data }) => setMilestones(data ?? []));
  }, [canSeeEquity]);

  const totalLoan = loans.reduce((s, l) => s + Number(l.amount), 0);
  const totalEquity = equity.reduce((s, e) => s + Number(e.amount), 0);

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
        {milestones.length === 0 && (
          <Text style={styles.empty}>No payment milestones yet.</Text>
        )}
        {milestones.map((m) => (
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
  safe: { flex: 1, backgroundColor: "#0f1225" },
  content: { padding: 16, gap: 12 },
  h: { color: "#a0a8c0", fontSize: 13, textTransform: "uppercase", marginTop: 8 },
  empty: { color: "#a0a8c0", textAlign: "center", marginVertical: 16 },
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
  statValue: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 4 },
  card: {
    backgroundColor: "#1a1f3a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2a3050",
  },
  name: { color: "#fff", fontSize: 15, fontWeight: "600" },
  amount: { color: "#3b82f6", fontSize: 18, fontWeight: "700", marginTop: 2 },
  meta: { color: "#7a8099", fontSize: 12, marginTop: 4 },
});
