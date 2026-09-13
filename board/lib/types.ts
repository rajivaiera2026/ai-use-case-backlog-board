export const STAGES = ["Idea", "Scored", "Building", "Live"] as const;

export type Stage = (typeof STAGES)[number];

export type UseCase = {
  id: string;
  created_at: string;
  title: string;
  owner: string;
  customer: string | null;
  impact: string | null;
  stage: Stage;
  stage_changed_at: string;
};

export type NewUseCase = {
  title: string;
  owner: string;
  customer: string;
  impact: string;
  stage: Stage;
};

export const STUCK_DAYS = 14;

export function daysInStage(iso: string): number {
  const elapsed = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(elapsed)) return 0;
  return Math.max(0, Math.floor(elapsed / 86_400_000));
}

export function isStuck(
  row: Pick<UseCase, "stage" | "stage_changed_at">,
): boolean {
  if (row.stage === "Live") return false;
  return daysInStage(row.stage_changed_at) >= STUCK_DAYS;
}

export function countByStage(rows: UseCase[]): Record<Stage, number> {
  const counts: Record<Stage, number> = {
    Idea: 0,
    Scored: 0,
    Building: 0,
    Live: 0,
  };
  for (const row of rows) {
    if (row.stage in counts) counts[row.stage] += 1;
  }
  return counts;
}
