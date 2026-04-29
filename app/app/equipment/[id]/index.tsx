import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useEquipmentItem,
  useShipmentsForItem,
} from "@/features/equipment/queries";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

const STATUS_LABEL: Record<string, string> = {
  planned: "Planned",
  manufacturing: "Manufacturing",
  ready: "Ready to ship",
  in_transit: "In transit",
  customs: "At customs",
  arrived: "Arrived on site",
  installed: "Installed",
};

const STATUS_ORDER = [
  "planned",
  "manufacturing",
  "ready",
  "in_transit",
  "customs",
  "arrived",
  "installed",
];

export default function EquipmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useEquipmentItem(id);
  const shipments = useShipmentsForItem(id);

  return (
    <>
      <Stack.Screen options={{ title: item.data?.name ?? "Equipment" }} />
      <ScrollView contentContainerStyle={styles.content}>
        {item.data && (
          <View style={styles.card}>
            <Text style={styles.name}>{item.data.name}</Text>
            {item.data.description && (
              <Text style={styles.desc}>{item.data.description}</Text>
            )}
            <View style={styles.metaRow}>
              {item.data.organizations?.name && (
                <Meta label="Manufacturer" value={item.data.organizations.name} />
              )}
              {item.data.country_of_origin && (
                <Meta label="Origin" value={item.data.country_of_origin} />
              )}
              {item.data.po_number && (
                <Meta label="PO" value={item.data.po_number} />
              )}
              {item.data.quantity && (
                <Meta label="Qty" value={String(item.data.quantity)} />
              )}
            </View>
          </View>
        )}

        <Text style={styles.h}>Shipments</Text>
        {(shipments.data ?? []).length === 0 && (
          <Text style={styles.empty}>
            {shipments.isLoading ? "Loading…" : "No shipment recorded yet."}
          </Text>
        )}
        {(shipments.data ?? []).map((s) => {
          const stepIdx = STATUS_ORDER.indexOf(s.status ?? "planned");
          const dates: { label: string; value: string | null }[] = [
            { label: "Manufacturing start", value: s.manufacturing_start_date },
            { label: "Ready", value: s.ready_date },
            { label: "Shipped", value: s.ship_date },
            { label: "ETA", value: s.eta_date },
            { label: "Arrived", value: s.arrived_date },
            { label: "Installed", value: s.installed_date },
          ];
          return (
            <View key={s.id} style={styles.shipmentCard}>
              <View style={styles.shipmentHead}>
                <Text style={styles.statusText}>
                  {STATUS_LABEL[s.status ?? "planned"]}
                </Text>
                {s.shipping?.name && (
                  <Text style={styles.shipper}>{s.shipping.name}</Text>
                )}
              </View>
              <View style={styles.steps}>
                {STATUS_ORDER.map((step, i) => (
                  <View
                    key={step}
                    style={[
                      styles.step,
                      i <= stepIdx && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                ))}
              </View>
              {s.bl_number && <Meta label="B/L" value={s.bl_number} />}
              {s.current_location && (
                <Meta label="Location" value={s.current_location} />
              )}
              <View style={styles.timeline}>
                {dates
                  .filter((d) => d.value)
                  .map((d) => (
                    <Text key={d.label} style={styles.timelineItem}>
                      {d.label}: {d.value}
                    </Text>
                  ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: 32 },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.sm,
  },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  desc: { color: colors.textMuted, fontSize: fontSize.sm },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.md,
    marginTop: space.sm,
  },
  metaItem: { gap: 2 },
  metaLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
  },
  metaValue: { color: colors.text, fontSize: fontSize.sm },
  h: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    marginTop: space.md,
  },
  empty: { color: colors.textMuted, textAlign: "center", paddingVertical: space.lg },
  shipmentCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.sm,
  },
  shipmentHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  shipper: { color: colors.textMuted, fontSize: fontSize.sm },
  steps: { flexDirection: "row", gap: 4, marginVertical: 4 },
  step: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  timeline: { gap: 2, marginTop: 4 },
  timelineItem: { color: colors.textMuted, fontSize: fontSize.xs },
});
