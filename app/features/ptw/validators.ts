import { z } from "zod";

export const ptwTypeOptions = [
  { value: "hot_work", label: "Hot work" },
  { value: "confined_space", label: "Confined space" },
  { value: "working_at_height", label: "Working at height" },
  { value: "lifting", label: "Lifting" },
  { value: "excavation", label: "Excavation" },
  { value: "electrical", label: "Electrical / LOTO" },
  { value: "radiography", label: "Radiography" },
];

export const ptwSchema = z.object({
  ptw_type: z.string().min(1, "Select work type"),
  work_description: z
    .string()
    .min(5, "Describe the work")
    .max(2000),
  location: z.string().min(2, "Location required").max(200),
  start_time: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Use YYYY-MM-DDTHH:MM"),
  end_time: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Use YYYY-MM-DDTHH:MM"),
});

export type PtwInput = z.infer<typeof ptwSchema>;
