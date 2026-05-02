import { z } from "zod";

// Username-based login (a username is converted to <username>@wtetracker.local under the hood)
export const USERNAME_DOMAIN = "@wtetracker.local";

export const signInSchema = z.object({
  email: z
    .string()
    .min(2, "Username required")
    .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dot, underscore, dash only"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, "Please enter your full name"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export function usernameToEmail(input: string): string {
  const u = input.trim().toLowerCase();
  if (u.includes("@")) return u; // already an email
  return `${u}${USERNAME_DOMAIN}`;
}
