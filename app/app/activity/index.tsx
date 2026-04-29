import { Stack } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useActivityLog } from "@/features/activity/queries";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

function actionLabel(action: string): string {
  return action.replaceAll("_", " ");
}

export default function ActivityLogScreen() {
  const log = useActivityLog();
  const items = (log.data?.pages ?? []).flat();

  return (
    <>
      <Stack.Screen options={{ title: "Activity Log" }} />
      <FlatList
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {log.isLoading ? "Loading…" : "No activity yet."}
          </Text>
        }
        ListFooterComponent={
          log.hasNextPage ? (
            <Pressable
              style={styles.loadMore}
              onPress={() => log.fetchNextPage()}
              disabled={log.isFetchingNextPage}
            >
              <Text style={styles.loadMoreText}>
                {log.isFetchingNextPage ? "Loading…" : "Load more"}
              </Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dot} />
            <View style={styles.body}>
              <Text style={styles.action}>{actionLabel(item.action)}</Text>
              <Text style={styles.who}>
                {item.profiles?.full_name ?? "Unknown"}
                {item.profiles?.role ? ` · ${item.profiles.role}` : ""}
              </Text>
              {item.entity_type && (
                <Text style={styles.entity}>{item.entity_type}</Text>
              )}
              <Text style={styles.time}>{fmtTime(item.created_at)}</Text>
            </View>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  row: {
    flexDirection: "row",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  body: { flex: 1, gap: 2 },
  action: { color: colors.text, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  who: { color: colors.textLink, fontSize: fontSize.xs },
  entity: { color: colors.textMuted, fontSize: fontSize.xs },
  time: { color: colors.textDim, fontSize: fontSize.xs, marginTop: 2 },
  loadMore: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.md,
    alignItems: "center",
  },
  loadMoreText: {
    color: colors.textLink,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
