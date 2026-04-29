import { z } from "zod";

export const issueSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(2000).optional(),
  phase_id: z.string().uuid("Select a phase"),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export type IssueInput = z.infer<typeof issueSchema>;
