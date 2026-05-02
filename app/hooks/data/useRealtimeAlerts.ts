import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useProject } from "@/contexts/project";
import { supabase } from "@/lib/supabase";

export function useRealtimeAlerts() {
  const { current } = useProject();
  const qc = useQueryClient();
  const [latestPing, setLatestPing] = useState<number>(0);

  useEffect(() => {
    if (!current) return;
    const channel = supabase
      .channel(`alerts:${current.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "issues" },
        () => {
          setLatestPing(Date.now());
          qc.invalidateQueries({ queryKey: ["dashboard-counts", current.id] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "safety_incidents" },
        () => {
          setLatestPing(Date.now());
          qc.invalidateQueries({ queryKey: ["safety-incidents", current.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [current?.id, qc]);

  return { latestPing };
}
