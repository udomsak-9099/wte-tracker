import { Stack, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useProject } from "@/contexts/project";
import { usePtwList } from "@/features/ptw/queries";
import { ptwTypeOptions } from "@/features/ptw/validators";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

const STATUS_COLOR: Record<string, string> = {
  requested: colors.warning,
  approved: colors.success,
  rejected: colors.danger,
  closed: colors.textDim,
};

function typeLabel(t: string): string {
  return ptwTypeOptions.find((o) => o.value === t)?.label ?? t;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function PtwScreen() {
  const { current } = useProject();
  const list = usePtwList(current?.id);
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Permit to Work",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/ptw/new")}
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
        data={list.data ?? []}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {list.isLoading ? "Loading…" : "No PTW records yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.type}>{typeLabel(item.ptw_type)}</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      STATUS_COLOR[item.status ?? "requested"],
                  },
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            {item.location && (
              <Text style={styles.location}>{item.location}</Text>
            )}
            {item.work_description && (
              <Text style={styles.desc} numberOfLines={2}>
                {item.work_description}
              </Text>
            )}
            <Text style={styles.time}>
              {fmtDate(item.start_time)} → {fmtDate(item.end_time)}
            </Text>
            {item.issued?.full_name && (
              <Text style={styles.meta}>
                Issued to: {item.issued.full_name}
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
    alignItems: "center",
  },
  type: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  location: { color: colors.textLink, fontSize: fontSize.sm },
  desc: { color: colors.textMuted, fontSize: fontSize.sm },
  time: { color: colors.textDim, fontSize: fontSize.xs, marginTop: 2 },
  meta: { color: colors.textDim, fontSize: fontSize.xs },
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
});
