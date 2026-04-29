import { z } from "zod";

export const dailyReportSchema = z.object({
  report_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  manpower_count: z.coerce
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .max(10_000),
  weather: z.string().max(200).optional(),
  activities: z.string().min(3, "Describe activities").max(2000),
  remarks: z.string().max(2000).optional(),
});

export type DailyReportInput = z.infer<typeof dailyReportSchema>;
