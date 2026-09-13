import { getSupabase } from "./supabase";
import type { NewUseCase, Stage, UseCase } from "./types";

export type AppError = {
  message: string;
  code?: string;
  hint?: string;
};

export function describeError(error: unknown): AppError {
  if (typeof error === "object" && error !== null && "message" in error) {
    const err = error as {
      message: string;
      code?: string;
      hint?: string;
      details?: string;
    };
    let hint = err.hint ?? undefined;

    const code = err.code;
    const mentionsMissingTable =
      code === "42P01" || /does not exist|schema cache/i.test(err.message);

    if (mentionsMissingTable) {
      hint =
        "The table `use_cases` was not found. Run the first SQL block in the Supabase SQL editor, then press Retry.";
    } else if (code === "42501" || /permission denied|row-level security/i.test(err.message)) {
      hint =
        "Row Level Security blocked this. Check that all four policies from the SQL block exist.";
    } else if (code === "PGRST301" || /invalid api key|jwt/i.test(err.message)) {
      hint =
        "The Supabase URL or browser key looks wrong. Check .env.local and restart the dev server.";
    }

    return { message: err.message, code, hint };
  }

  return { message: error instanceof Error ? error.message : String(error) };
}

function requiredClient() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

export async function listUseCases(): Promise<UseCase[]> {
  const supabase = requiredClient();
  const { data, error } = await supabase
    .from("use_cases")
    .select(
      "id, created_at, title, owner, customer, impact, stage, stage_changed_at",
    )
    .order("stage_changed_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as UseCase[];
}

export async function moveStage(id: string, stage: Stage): Promise<void> {
  const supabase = requiredClient();
  const { error } = await supabase
    .from("use_cases")
    .update({ stage, stage_changed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function createUseCase(input: NewUseCase): Promise<UseCase> {
  const supabase = requiredClient();
  const { data, error } = await supabase
    .from("use_cases")
    .insert({
      title: input.title.trim(),
      owner: input.owner.trim(),
      customer: input.customer.trim() || null,
      impact: input.impact.trim() || null,
      stage: input.stage,
      stage_changed_at: new Date().toISOString(),
    })
    .select(
      "id, created_at, title, owner, customer, impact, stage, stage_changed_at",
    )
    .single();

  if (error) throw error;
  return data as UseCase;
}

export async function deleteUseCase(id: string): Promise<void> {
  const supabase = requiredClient();
  const { error } = await supabase.from("use_cases").delete().eq("id", id);
  if (error) throw error;
}
