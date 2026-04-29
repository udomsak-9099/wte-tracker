import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import type { SafetyIncident } from "@/lib/database.types";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export default function Safety() {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);

  useEffect(() => {
    supabase
      .from("safety_incidents")
      .select("*")
      .order("incident_date", { ascending: false })
      .limit(50)
      .then(({ data }) => setIncidents(data ?? []));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={incidents}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={<Text style={styles.h}>Recent incidents</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No incidents recorded.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.date}>{item.incident_date}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: SEVERITY_COLOR[item.severity ?? "medium"] },
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
  safe: { flex: 1, backgroundColor: "#0f1225" },
  content: { padding: 16, gap: 12 },
  h: { color: "#a0a8c0", fontSize: 13, textTransform: "uppercase", marginBottom: 4 },
  empty: { color: "#a0a8c0", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#1a1f3a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2a3050",
    gap: 4,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { color: "#7eb1ff", fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  type: { color: "#fff", fontSize: 15, fontWeight: "600" },
  desc: { color: "#a0a8c0", fontSize: 13 },
  loc: { color: "#7a8099", fontSize: 12 },
});
