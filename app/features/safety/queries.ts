import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type IncidentInsert =
  Database["public"]["Tables"]["safety_incidents"]["Insert"];

export function useCreateSafetyIncident(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: IncidentInsert) => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("safety_incidents")
        .insert({
          ...input,
          project_id: projectId,
          reported_by: u.user?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      await logActivity("create_safety_incident", "safety_incidents", data.id, {
        type: input.incident_type,
        severity: input.severity,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-incidents", projectId] });
    },
  });
}

export function useSafetyIncident(id: string | null | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["safety-incident", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_incidents")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
