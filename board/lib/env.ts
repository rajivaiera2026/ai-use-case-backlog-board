export type MissingSetting =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

function looksSet(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.includes("[") && !trimmed.includes("]");
}

export const missingSettings: MissingSetting[] = [];
if (!looksSet(rawUrl)) missingSettings.push("NEXT_PUBLIC_SUPABASE_URL");
if (!looksSet(rawKey)) missingSettings.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

export const isConfigured = missingSettings.length === 0;
export const SUPABASE_URL = rawUrl.trim();
export const SUPABASE_PUBLISHABLE_KEY = rawKey.trim();
