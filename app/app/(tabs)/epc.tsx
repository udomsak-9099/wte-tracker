import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import type { EpcSystem } from "@/lib/database.types";

export default function Epc() {
  const [systems, setSystems] = useState<EpcSystem[]>([]);

  useEffect(() => {
    supabase
      .from("epc_systems")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => setSystems(data ?? []));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={systems}
        keyExtractor={(s) => s.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No EPC systems yet. Admins can add the 19 standard systems from
            Settings.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.cat}>{item.category ?? ""}</Text>
            <View style={styles.bar}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.min(item.progress ?? 0, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.pct}>{Math.round(item.progress ?? 0)}%</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1225" },
  content: { padding: 16, gap: 12 },
  empty: { color: "#a0a8c0", textAlign: "center", marginTop: 40, paddingHorizontal: 24 },
  card: {
    backgroundColor: "#1a1f3a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2a3050",
  },
  name: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cat: { color: "#7eb1ff", fontSize: 12, marginTop: 2 },
  bar: { height: 8, backgroundColor: "#2a3050", borderRadius: 4, marginTop: 10 },
  barFill: { height: "100%", backgroundColor: "#3b82f6", borderRadius: 4 },
  pct: { color: "#a0a8c0", fontSize: 12, marginTop: 4, textAlign: "right" },
});
