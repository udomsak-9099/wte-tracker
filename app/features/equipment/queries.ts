import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

export type EquipmentRow =
  Database["public"]["Tables"]["equipment_items"]["Row"] & {
    organizations: { name: string } | null;
    epc_systems: { name: string } | null;
  };

export type ShipmentRow =
  Database["public"]["Tables"]["equipment_shipments"]["Row"] & {
    shipping: { name: string } | null;
  };

export function useEquipmentItems(projectId: string | null | undefined) {
  return useQuery<EquipmentRow[]>({
    enabled: !!projectId,
    queryKey: ["equipment-items", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_items")
        .select(
          "*, organizations:manufacturer_org_id(name), epc_systems(name)"
        )
        .eq("project_id", projectId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as EquipmentRow[];
    },
  });
}

export function useEquipmentItem(id: string | null | undefined) {
  return useQuery<EquipmentRow | null>({
    enabled: !!id,
    queryKey: ["equipment-item", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_items")
        .select(
          "*, organizations:manufacturer_org_id(name), epc_systems(name)"
        )
        .eq("id", id!)
        .single();
      if (error) throw error;
      return (data as unknown as EquipmentRow) ?? null;
    },
  });
}

export function useShipmentsForItem(itemId: string | null | undefined) {
  return useQuery<ShipmentRow[]>({
    enabled: !!itemId,
    queryKey: ["shipments", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_shipments")
        .select("*, shipping:shipping_org_id(name)")
        .eq("equipment_item_id", itemId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ShipmentRow[];
    },
  });
}
