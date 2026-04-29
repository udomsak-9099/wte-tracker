import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type PtwInsert = Database["public"]["Tables"]["permits_to_work"]["Insert"];

export function usePtwList(projectId: string | null | undefined) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["ptw", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permits_to_work")
        .select("*, issued:issued_to(full_name), approved:approved_by(full_name)")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePtw(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PtwInsert) => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("permits_to_work")
        .insert({
          ...input,
          project_id: projectId,
          issued_to: u.user?.id ?? null,
          status: "requested",
        })
        .select()
        .single();
      if (error) throw error;
      await logActivity("create_ptw", "permits_to_work", data.id, {
        type: input.ptw_type,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ptw", projectId] });
    },
  });
}
