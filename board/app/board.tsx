"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  countByStage,
  daysInStage,
  isStuck,
  STAGES,
  STUCK_DAYS,
  type NewUseCase,
  type Stage,
  type UseCase,
} from "@/lib/types";
import {
  isConfigured,
  missingSettings,
  type MissingSetting,
} from "@/lib/env";
import {
  createUseCase,
  deleteUseCase,
  describeError,
  listUseCases,
  moveStage,
  type AppError,
} from "@/lib/data";

const STAGE_DOT: Record<Stage, string> = {
  Idea: "bg-zinc-400",
  Scored: "bg-amber-500",
  Building: "bg-blue-500",
  Live: "bg-emerald-500",
};

const STAGE_CHIP: Record<Stage, string> = {
  Idea: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  Scored: "bg-amber-50 text-amber-700 ring-amber-200",
  Building: "bg-blue-50 text-blue-700 ring-blue-200",
  Live: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const EMPTY_NEW_CASE: NewUseCase = {
  title: "",
  owner: "",
  customer: "",
  impact: "",
  stage: "Idea",
};

export default function Board() {
  const [rows, setRows] = useState<UseCase[] | null>(null);
  const [loadError, setLoadError] = useState<AppError | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    listUseCases()
      .then((data) => setRows(data))
      .catch((error) => setLoadError(describeError(error)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function retryLoad() {
    setRows(null);
    setLoadError(null);
    load();
  }

  const counts = useMemo(() => countByStage(rows ?? []), [rows]);
  const stuckRows = useMemo(
    () => (rows ?? []).filter((row) => isStuck(row)),
    [rows],
  );

  async function handleStageChange(row: UseCase, next: Stage) {
    if (next === row.stage || !rows) return;
    const previous = rows;
    setActionError(null);
    setBusyId(row.id);
    setRows(
      previous.map((item) =>
        item.id === row.id
          ? { ...item, stage: next, stage_changed_at: new Date().toISOString() }
          : item,
      ),
    );

    try {
      await moveStage(row.id, next);
    } catch (error) {
      setRows(previous);
      setActionError(describeError(error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row: UseCase) {
    if (!rows) return;
    if (!window.confirm(`Remove "${row.title}" from the board?`)) return;
    const previous = rows;
    setActionError(null);
    setBusyId(row.id);
    setRows(previous.filter((item) => item.id !== row.id));

    try {
      await deleteUseCase(row.id);
    } catch (error) {
      setRows(previous);
      setActionError(describeError(error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(input: NewUseCase) {
    setActionError(null);
    const created = await createUseCase(input);
    setRows((current) => [...(current ?? []), created]);
  }

  if (!isConfigured) {
    return <MissingSettingsScreen missing={missingSettings} />;
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              AI Use Case Backlog
            </h1>
            <p className="text-sm text-zinc-500">
              Every AI use case the team is considering, on one board.
            </p>
          </div>
          <p className="text-xs text-zinc-400">
            FirstCut AI demo &middot; open link, no login
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <CountsBar
          counts={counts}
          total={rows?.length ?? 0}
          stuck={stuckRows.length}
        />

        {actionError ? (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>Could not save that change: {actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="shrink-0 font-medium underline"
            >
              dismiss
            </button>
          </div>
        ) : null}

        <section className="mt-5">
          {loadError ? (
            <ErrorPanel error={loadError} onRetry={retryLoad} />
          ) : rows === null ? (
            <LoadingPanel />
          ) : rows.length === 0 ? (
            <EmptyPanel />
          ) : (
            <BoardTable
              rows={rows}
              busyId={busyId}
              onStageChange={handleStageChange}
              onDelete={handleDelete}
            />
          )}
        </section>

        <AddCaseForm onCreate={handleCreate} />
      </main>
    </div>
  );
}

function CountsBar({
  counts,
  total,
  stuck,
}: {
  counts: Record<Stage, number>;
  total: number;
  stuck: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {STAGES.map((stage) => (
        <div
          key={stage}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
            <span className={`h-2 w-2 rounded-full ${STAGE_DOT[stage]}`} />
            {stage}
          </div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            {counts[stage]}
          </div>
        </div>
      ))}
      <div
        className={`rounded-xl border px-4 py-3 shadow-sm ${
          stuck > 0
            ? "border-amber-300 bg-amber-50"
            : "border-zinc-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Stuck
        </div>
        <div
          className={`mt-1 text-3xl font-semibold tracking-tight ${
            stuck > 0 ? "text-amber-700" : "text-zinc-900"
          }`}
        >
          {stuck}
        </div>
        <div className="text-xs text-zinc-500">
          not Live, {STUCK_DAYS}+ days in a stage
        </div>
      </div>
      <div className="col-span-2 text-xs text-zinc-400 sm:col-span-3 lg:col-span-5">
        {total} use case{total === 1 ? "" : "s"} on the board
      </div>
    </div>
  );
}

function BoardTable({
  rows,
  busyId,
  onStageChange,
  onDelete,
}: {
  rows: UseCase[];
  busyId: string | null;
  onStageChange: (row: UseCase, next: Stage) => void;
  onDelete: (row: UseCase) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="hidden border-b border-zinc-200 bg-zinc-50/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.5fr)_150px_90px_32px] md:gap-3">
        <span>Use case</span>
        <span>Owner</span>
        <span>Customer</span>
        <span>Impact</span>
        <span>Stage</span>
        <span>Age</span>
        <span />
      </div>

      <ul className="divide-y divide-zinc-100">
        {rows.map((row) => {
          const stuck = isStuck(row);
          const age = daysInStage(row.stage_changed_at);
          const busy = busyId === row.id;
          return (
            <li
              key={row.id}
              className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.5fr)_150px_90px_32px] md:items-center md:gap-3 ${
                stuck ? "bg-amber-50/50" : ""
              } ${busy ? "opacity-60" : ""}`}
            >
              <Cell label="Use case">
                <div className="flex items-start gap-2">
                  {stuck ? (
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500"
                      title={`Stuck: no stage change in ${age} days`}
                    />
                  ) : null}
                  <span className="text-sm font-medium text-zinc-900">
                    {row.title}
                  </span>
                </div>
              </Cell>

              <Cell label="Owner">
                <span className="text-sm text-zinc-700">{row.owner}</span>
              </Cell>

              <Cell label="Customer">
                <span className="text-sm text-zinc-700">
                  {row.customer || "—"}
                </span>
              </Cell>

              <Cell label="Impact">
                <span className="text-sm text-zinc-600">{row.impact || "—"}</span>
              </Cell>

              <Cell label="Stage">
                <div className="flex items-center gap-2">
                  <span
                    className={`hidden h-2 w-2 shrink-0 rounded-full lg:inline-block ${STAGE_DOT[row.stage]}`}
                  />
                  <select
                    value={row.stage}
                    disabled={busy}
                    onChange={(event) =>
                      onStageChange(row, event.target.value as Stage)
                    }
                    className={`w-full rounded-md px-2 py-1.5 text-sm font-medium ring-1 outline-none ${STAGE_CHIP[row.stage]}`}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </Cell>

              <Cell label="Age">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    stuck
                      ? "bg-amber-100 text-amber-800"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {age}d in stage
                </span>
              </Cell>

              <Cell label="">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(row)}
                  title="Remove use case"
                  className="rounded-md px-1.5 py-1 text-sm text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </Cell>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      {label ? (
        <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 md:hidden">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function AddCaseForm({
  onCreate,
}: {
  onCreate: (input: NewUseCase) => Promise<void>;
}) {
  const [draft, setDraft] = useState<NewUseCase>(EMPTY_NEW_CASE);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.owner.trim()) {
      setError("A title and an owner are required. Nothing was saved.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onCreate(draft);
      setDraft(EMPTY_NEW_CASE);
    } catch (err) {
      setError(describeError(err).message);
    } finally {
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400";

  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-zinc-800">Add a use case</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          className={`${field} md:col-span-2`}
          placeholder="Use case (required)"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <input
          className={field}
          placeholder="Owner (required)"
          value={draft.owner}
          onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
        />
        <input
          className={field}
          placeholder="Customer it came from"
          value={draft.customer}
          onChange={(e) => setDraft({ ...draft, customer: e.target.value })}
        />
        <input
          className={field}
          placeholder="Impact"
          value={draft.impact}
          onChange={(e) => setDraft({ ...draft, impact: e.target.value })}
        />
        <select
          className={`${field} md:col-span-1`}
          value={draft.stage}
          onChange={(e) =>
            setDraft({ ...draft, stage: e.target.value as Stage })
          }
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 md:col-span-1"
        >
          {saving ? "Saving…" : "Add to board"}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}

function MissingSettingsScreen({ missing }: { missing: MissingSetting[] }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-5">
      <div className="w-full max-w-xl rounded-xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Setup problem
        </p>
        <h1 className="mt-1 text-lg font-semibold text-amber-900">
          A setting is missing
        </h1>
        <p className="mt-2 text-sm text-amber-900/80">
          The board cannot reach Supabase because{" "}
          {missing.length === 1 ? "this setting is" : "these settings are"} not
          set in <code className="font-mono">.env.local</code>:
        </p>
        <ul className="mt-3 space-y-1">
          {missing.map((name) => (
            <li
              key={name}
              className="rounded-md bg-white px-3 py-2 font-mono text-sm text-amber-900 ring-1 ring-amber-200"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-amber-900/80">
          Add the value, then restart the dev server. No data was requested.
        </p>
      </div>
    </div>
  );
}

function ErrorPanel({
  error,
  onRetry,
}: {
  error: AppError;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
        Connection problem
      </p>
      <h2 className="mt-1 text-lg font-semibold text-red-800">
        The call to Supabase failed
      </h2>
      <p className="mt-2 text-sm text-red-700">
        {error.hint ?? "Supabase returned an error."}
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md bg-white px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
        {error.code ? `${error.code}: ` : ""}
        {error.message}
      </pre>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Connected
      </p>
      <h2 className="mt-1 text-lg font-semibold text-zinc-800">
        The board is empty
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
        Supabase answered and the table exists, but there are no use cases yet.
        Add one below, or run the demo-data SQL block to fill the board.
      </p>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
      <p className="text-sm text-zinc-500">Loading the board…</p>
    </div>
  );
}
