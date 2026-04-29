import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useEquipmentItems(projectId: string | null | undefined) {
  return useQuery({
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
      return data;
    },
  });
}

export function useEquipmentItem(id: string | null | undefined) {
  return useQuery({
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
      return data;
    },
  });
}

export function useShipmentsForItem(itemId: string | null | undefined) {
  return useQuery({
    enabled: !!itemId,
    queryKey: ["shipments", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_shipments")
        .select("*, shipping:shipping_org_id(name)")
        .eq("equipment_item_id", itemId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
