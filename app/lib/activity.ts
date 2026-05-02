import { supabase } from "./supabase";

export async function logActivity(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("activity_log").insert({
    user_id: u.user.id,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    details: details ?? null,
  });
}
