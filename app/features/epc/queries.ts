import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import type { Database, EpcSystem } from "@/lib/database.types";

type DailyReport = Database["public"]["Tables"]["epc_daily_reports"]["Row"];
type DailyReportInsert =
  Database["public"]["Tables"]["epc_daily_reports"]["Insert"];

export function useEpcSystems(projectId: string | null | undefined) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["epc-systems", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("epc_systems")
        .select("*")
        .eq("project_id", projectId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as EpcSystem[];
    },
  });
}

export function useEpcSystem(systemId: string | null | undefined) {
  return useQuery({
    enabled: !!systemId,
    queryKey: ["epc-system", systemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("epc_systems")
        .select("*")
        .eq("id", systemId!)
        .single();
      if (error) throw error;
      return data as EpcSystem;
    },
  });
}

export function useDailyReports(systemId: string | null | undefined) {
  return useQuery({
    enabled: !!systemId,
    queryKey: ["epc-reports", systemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("epc_daily_reports")
        .select("*")
        .eq("epc_system_id", systemId!)
        .order("report_date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as DailyReport[];
    },
  });
}

export function useCreateDailyReport(systemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<DailyReportInsert, "epc_system_id">) => {
      const { data, error } = await supabase
        .from("epc_daily_reports")
        .insert({ ...input, epc_system_id: systemId })
        .select()
        .single();
      if (error) throw error;
      await logActivity("create_daily_report", "epc_daily_reports", data.id);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["epc-reports", systemId] });
    },
  });
}
