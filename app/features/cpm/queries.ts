import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";

export type TaskScheduleRow = {
  id: string;
  name: string;
  phase_id: string | null;
  status: string | null;
  progress: number | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  optimistic_days: number | null;
  likely_days: number | null;
  pessimistic_days: number | null;
  expected_days: number | null;
  variance: number | null;
  es_offset_days: number | null;
  ef_offset_days: number | null;
  ls_offset_days: number | null;
  lf_offset_days: number | null;
  slack_days: number | null;
  is_critical: boolean | null;
  project_start: string | null;
  project_cod: string | null;
  es_date_calc: string | null;
  ef_date_calc: string | null;
  phases?: { name: string; phase_group: string } | null;
};

export type CpmSummary = {
  totalTasks: number;
  criticalTasks: number;
  projectFinishDays: number;
  criticalPathVariance: number;
  projectStart: string | null;
  projectCod: string | null;
};

export function useCpmTasks(projectId: string | null | undefined) {
  return useQuery<TaskScheduleRow[]>({
    enabled: !!projectId,
    queryKey: ["cpm-tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_schedule")
        .select(
          "id,name,phase_id,status,progress,start_date,end_date,duration_days,optimistic_days,likely_days,pessimistic_days,expected_days,variance,es_offset_days,ef_offset_days,ls_offset_days,lf_offset_days,slack_days,is_critical,project_start,project_cod,es_date_calc,ef_date_calc,project_id"
        )
        .eq("project_id", projectId!)
        .order("es_offset_days", { ascending: true, nullsFirst: false });
      if (error) throw error;

      const ids = (data ?? []).map((r) => r.id);
      let phaseMap = new Map<string, { name: string; phase_group: string }>();
      if (ids.length > 0) {
        const { data: phases } = await supabase
          .from("phases")
          .select("id, name, phase_group");
        for (const p of phases ?? []) {
          phaseMap.set(p.id, { name: p.name, phase_group: p.phase_group });
        }
      }
      return (data ?? []).map((r) => ({
        ...r,
        phases: r.phase_id ? phaseMap.get(r.phase_id) ?? null : null,
      })) as TaskScheduleRow[];
    },
  });
}

export function useCpmSummary(
  tasks: TaskScheduleRow[] | undefined
): CpmSummary {
  const ts = tasks ?? [];
  const critical = ts.filter((t) => t.is_critical);
  const finishDays = Math.max(0, ...ts.map((t) => t.ef_offset_days ?? 0));
  const variance = critical.reduce(
    (s, t) => s + Number(t.variance ?? 0),
    0
  );
  const start = ts[0]?.project_start ?? null;
  const cod = ts[0]?.project_cod ?? null;
  return {
    totalTasks: ts.length,
    criticalTasks: critical.length,
    projectFinishDays: finishDays,
    criticalPathVariance: variance,
    projectStart: start,
    projectCod: cod,
  };
}

export function useTaskDependencies(taskId: string | null | undefined) {
  return useQuery<{ depends_on_id: string }[]>({
    enabled: !!taskId,
    queryKey: ["task-deps", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_dependencies")
        .select("depends_on_id")
        .eq("task_id", taskId!);
      if (error) throw error;
      return (data ?? []) as { depends_on_id: string }[];
    },
  });
}

export function useRecomputeCpm(projectId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!projectId) return;
      const { error } = await supabase.rpc("compute_cpm", {
        p_project_id: projectId,
      });
      if (error) throw error;
      await logActivity("recompute_cpm", "tasks", undefined, { projectId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cpm-tasks", projectId] });
    },
  });
}

/**
 * PERT probability of finishing by target date using normal approximation.
 * Z = (target - mean) / sigma
 * Returns 0..1 probability.
 */
export function pertProbability(
  meanDays: number,
  varianceDays: number,
  targetDays: number
): number {
  if (varianceDays <= 0) return targetDays >= meanDays ? 1 : 0;
  const sigma = Math.sqrt(varianceDays);
  const z = (targetDays - meanDays) / sigma;
  // Cumulative standard normal via Abramowitz & Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return Math.max(0, Math.min(1, p));
}
