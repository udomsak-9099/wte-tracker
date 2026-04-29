import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useProject } from "@/contexts/project";
import type { Permit } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

const STATUS_COLOR: Record<string, string> = {
  obtained: colors.success,
  in_progress: "#f97316",
  pending: colors.warning,
  expired: colors.danger,
  rejected: colors.danger,
};

export default function PermitsScreen() {
  const { current } = useProject();
  const router = useRouter();

  const permits = useQuery<Permit[]>({
    enabled: !!current,
    queryKey: ["permits", current?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permits")
        .select("*")
        .eq("project_id", current!.id)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Permit[];
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: "Permits & Licensing" }} />
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.content}
          data={permits.data ?? []}
          keyExtractor={(p) => p.id}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {permits.isLoading ? "Loading…" : "No permits yet."}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/permits/${item.id}`)}
            >
              <View style={styles.head}>
                <Text style={styles.name}>{item.name}</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        STATUS_COLOR[item.status ?? "pending"],
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              {item.authority && (
                <Text style={styles.meta}>{item.authority}</Text>
              )}
              {item.ref_number && (
                <Text style={styles.ref}>Ref: {item.ref_number}</Text>
              )}
              {item.issue_date && (
                <Text style={styles.meta}>Issued: {item.issue_date}</Text>
              )}
              {item.expiry_date && (
                <Text style={styles.meta}>Expires: {item.expiry_date}</Text>
              )}
            </Pressable>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
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
    alignItems: "flex-start",
    gap: space.sm,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
  },
  meta: { color: colors.textMuted, fontSize: fontSize.xs },
  ref: { color: colors.textLink, fontSize: fontSize.xs },
});
