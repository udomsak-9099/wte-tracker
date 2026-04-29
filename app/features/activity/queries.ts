import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 30;

export function useActivityLog(filterAction?: string) {
  return useInfiniteQuery({
    queryKey: ["activity-log", filterAction ?? "all"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from("activity_log")
        .select("*, profiles(full_name, role)")
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      if (filterAction) q = q.eq("action", filterAction);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, all) =>
      (lastPage?.length ?? 0) === PAGE_SIZE ? all.length * PAGE_SIZE : undefined,
  });
}

export function useDistinctActions() {
  return useQuery({
    queryKey: ["activity-actions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("action")
        .limit(500);
      if (error) throw error;
      const set = new Set<string>();
      data.forEach((r) => set.add(r.action));
      return Array.from(set).sort();
    },
  });
}
