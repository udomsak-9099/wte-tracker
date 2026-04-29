import { Stack, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useProject } from "@/contexts/project";
import { useProjectIssues } from "@/features/issues/queries";
import { colors, fontSize, fontWeight, radius, severityColor, space } from "@/lib/theme";

const STATUS_COLOR: Record<string, string> = {
  open: colors.danger,
  in_progress: colors.warning,
  resolved: colors.success,
  closed: colors.textDim,
};

export default function IssuesList() {
  const { current } = useProject();
  const issues = useProjectIssues(current?.id);
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Issues",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/issues/new")}
              style={{ paddingHorizontal: space.md }}
            >
              <Text style={{ color: colors.primary, fontSize: fontSize.md }}>
                + New
              </Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        contentContainerStyle={styles.content}
        data={issues.data ?? []}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {issues.isLoading ? "Loading…" : "No issues reported."}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
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
            <View style={styles.metaRow}>
              <Text
                style={[
                  styles.status,
                  { color: STATUS_COLOR[item.status ?? "open"] },
                ]}
              >
                {item.status}
              </Text>
              <Text style={styles.date}>{item.reported_date}</Text>
            </View>
            {item.description && (
              <Text style={styles.desc} numberOfLines={3}>
                {item.description}
              </Text>
            )}
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
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
    alignItems: "flex-start",
    gap: space.sm,
  },
  title: {
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
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  status: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
  },
  date: { color: colors.textDim, fontSize: fontSize.xs },
  desc: { color: colors.textMuted, fontSize: fontSize.sm },
});
