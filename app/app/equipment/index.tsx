import { Stack, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useProject } from "@/contexts/project";
import { useEquipmentItems } from "@/features/equipment/queries";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

export default function EquipmentList() {
  const { current } = useProject();
  const items = useEquipmentItems(current?.id);
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Equipment" }} />
      <FlatList
        contentContainerStyle={styles.content}
        data={items.data ?? []}
        keyExtractor={(it) => it.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {items.isLoading
              ? "Loading…"
              : "No equipment yet. Admins can add equipment from Settings."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/equipment/${item.id}`)}
          >
            <Text style={styles.name}>{item.name}</Text>
            {item.epc_systems?.name && (
              <Text style={styles.system}>{item.epc_systems.name}</Text>
            )}
            <View style={styles.row}>
              {item.organizations?.name && (
                <Text style={styles.meta}>
                  Mfr: {item.organizations.name}
                </Text>
              )}
              {item.country_of_origin && (
                <Text style={styles.meta}>{item.country_of_origin}</Text>
              )}
            </View>
            {item.po_number && (
              <Text style={styles.po}>PO: {item.po_number}</Text>
            )}
          </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
    gap: 4,
  },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  system: { color: colors.textLink, fontSize: fontSize.xs },
  row: { flexDirection: "row", gap: space.md, marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: fontSize.xs },
  po: { color: colors.textDim, fontSize: fontSize.xs },
});
