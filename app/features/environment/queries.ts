import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type EnvInsert = Database["public"]["Tables"]["environmental_records"]["Insert"];

type EnvRecord = Database["public"]["Tables"]["environmental_records"]["Row"];

export function useEnvRecords(projectId: string | null | undefined) {
  return useQuery<EnvRecord[]>({
    enabled: !!projectId,
    queryKey: ["env-records", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("environmental_records")
        .select("*")
        .eq("project_id", projectId!)
        .order("record_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as EnvRecord[];
    },
  });
}

function computeStatus(
  value: number,
  min: number | null,
  max: number | null
): "compliant" | "warning" | "exceeded" {
  if (max != null) {
    if (value > max) return "exceeded";
    if (value > max * 0.9) return "warning";
  }
  if (min != null) {
    if (value < min) return "exceeded";
    if (value < min * 1.1) return "warning";
  }
  return "compliant";
}

export function useCreateEnvRecord(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EnvInsert) => {
      const { data: u } = await supabase.auth.getUser();
      const status =
        input.value != null
          ? computeStatus(
              Number(input.value),
              input.threshold_min ?? null,
              input.threshold_max ?? null
            )
          : "compliant";
      const { data, error } = await supabase
        .from("environmental_records")
        .insert({
          ...input,
          project_id: projectId,
          recorded_by: u.user?.id ?? null,
          status,
        })
        .select()
        .single();
      if (error) throw error;
      await logActivity(
        "create_env_record",
        "environmental_records",
        data.id,
        { parameter: input.parameter, value: input.value }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["env-records", projectId] });
    },
  });
}
