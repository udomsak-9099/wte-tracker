import { z } from "zod";

export const incidentTypeOptions = [
  { value: "near_miss", label: "Near miss" },
  { value: "first_aid", label: "First aid" },
  { value: "lost_time", label: "Lost time" },
  { value: "fatal", label: "Fatal" },
  { value: "property_damage", label: "Property damage" },
  { value: "environmental", label: "Environmental" },
];

export const safetyIncidentSchema = z.object({
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  incident_type: z.string().min(1, "Select a type"),
  location: z.string().min(2, "Location required").max(200),
  description: z.string().min(5, "Describe the incident").max(2000),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export type SafetyIncidentInput = z.infer<typeof safetyIncidentSchema>;
