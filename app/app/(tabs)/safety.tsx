import { useQuery } from "@tanstack/react-query";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProject } from "@/contexts/project";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, severityColor, space } from "@/lib/theme";

export default function Safety() {
  const { current } = useProject();

  const incidents = useQuery({
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
      return data;
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={incidents.data ?? []}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={<Text style={styles.h}>Recent incidents</Text>}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {incidents.isLoading ? "Loading…" : "No incidents recorded."}
          </Text>
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
                      severityColor[item.severity ?? "medium"],
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
});
