import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type IssueInsert = Database["public"]["Tables"]["issues"]["Insert"];

export function useProjectIssues(projectId: string | null | undefined) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["issues", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issues")
        .select("*, phases!inner(project_id, name)")
        .eq("phases.project_id", projectId!)
        .order("reported_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectPhases(projectId: string | null | undefined) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["phases", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phases")
        .select("id, name, display_order")
        .eq("project_id", projectId!)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateIssue(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: IssueInsert) => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("issues")
        .insert({ ...input, reported_by: u.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      await logActivity("create_issue", "issues", data.id, {
        title: input.title,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues", projectId] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts", projectId] });
    },
  });
}
