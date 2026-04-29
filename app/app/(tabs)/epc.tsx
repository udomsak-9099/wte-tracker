import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProject } from "@/contexts/project";
import { useEpcSystems } from "@/features/epc/queries";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

export default function Epc() {
  const { current } = useProject();
  const systems = useEpcSystems(current?.id);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={systems.data ?? []}
        keyExtractor={(s) => s.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {systems.isLoading ? "Loading…" : "No EPC systems for this project."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/epc/${item.id}`)}
          >
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
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: space.xl,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  cat: { color: colors.textLink, fontSize: fontSize.xs, marginTop: 2 },
  bar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginTop: space.sm + 2,
  },
  barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  pct: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
    textAlign: "right",
  },
});
