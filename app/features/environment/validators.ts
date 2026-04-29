import { z } from "zod";

export const envCategoryOptions = [
  { value: "air", label: "Air quality" },
  { value: "water", label: "Water" },
  { value: "noise", label: "Noise" },
  { value: "waste", label: "Waste" },
  { value: "emissions", label: "Emissions" },
];

export const envRecordSchema = z.object({
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  category: z.string().min(1, "Select a category"),
  parameter: z.string().min(1, "Parameter required").max(100),
  value: z.coerce.number(),
  unit: z.string().max(50).optional(),
  threshold_min: z.coerce.number().optional(),
  threshold_max: z.coerce.number().optional(),
  notes: z.string().max(2000).optional(),
});

export type EnvRecordInput = z.infer<typeof envRecordSchema>;
