# REPORT - n8n FAQ chatbot for FirstCut AI

## Status per part
Build workflow (Chat Trigger -> AI Agent -> DeepSeek Chat Model + Simple Memory, full faq.txt in system message): DONE
  evidence: `validate_workflow` -> `{"valid":true,"nodeCount":4}`; `create_workflow_from_code` -> `{"workflowId":"kHz8t5r7FWe6sedr","nodeCount":4}`
Attach DeepSeek credential: DONE
  evidence: `update_workflow setNodeCredential` -> `appliedOperations: 1`; credential id `bwUNPPSTABQEQtUn` ("DeepSeek account", type `deepSeekApi`)
Make chat public: DONE
  evidence: `publish_workflow` -> `{"success":true,"activeVersionId":"c14c7587-f20a-4741-a6be-19e4d0b86ad6"}`; `get_workflow_details` -> `"active":true,"triggerCount":1`
Public link verified: DONE
  evidence: `webfetch https://rajivranjan.app.n8n.cloud/webhook/895faef8-4f5c-4184-9db0-3844f6b66e7c/chat` -> page served (content `Chat`)
Bot answers from the FAQ: DONE
  evidence: `execute_workflow` manual, input "How much does a FirstCut Sprint cost and how long does it take?" -> execution `2`, `status: success`, output "A FirstCut Sprint costs Rs 4,50,000 - Rs 7,50,000 ... takes 4 weeks ... 5-7 weeks ... Discovery-only week is Rs 1,25,000" (matches FAQ), `llm.tokens.in: 2223, llm.tokens.out: 105`, `ai.agent.memory.loads: 1`

## What broke and how I fixed it
- First publish refused: `Missing required credential: deepSeekApi`. Cause: the instance had zero credentials, and the MCP tool surface has no create-credential operation. Fixed by the user creating the DeepSeek credential in the n8n UI, after which `setNodeCredential` attached it by id and publish succeeded.
- The API key the user pasted in chat was never stored (not in a file, node parameter, or log). Recommended rotating it, since chat is not a safe transport for secrets.

## Claims ledger
- Workflow `kHz8t5r7FWe6sedr` exists, 4 nodes, DeepSeek credential attached -> `get_workflow_details`
- Workflow is active/published -> `get_workflow_details` -> `"active":true`; `publish_workflow` -> `success: true`
- Public chat URL serves a page -> `webfetch` returned `Chat`
- Agent replies correctly from embedded faq.txt -> execution `2`, `status: success`, output matches FAQ statements
- Conversation memory works -> execution `2`, `ai.agent.memory.loads: 1`, `saves: 1`

## What I would tell the next person
- Public chat link: https://rajivranjan.app.n8n.cloud/webhook/895faef8-4f5c-4184-9db0-3844f6b66e7c/chat
- Edit workflow: https://rajivranjan.app.n8n.cloud/workflow/kHz8t5r7FWe6sedr
- The existing "My workflow" (id DsZjLNUlpq3hqMF5) was left untouched.
- To change the FAQ, edit the AI Agent system message (it holds the whole faq.txt text), then republish to update production.

---

# REPORT - AI Use Case Backlog Board (Next.js + Supabase)

App lives in `board/`. Plan documents it follows: `PRD.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`.

## Status per part
Scaffold Next.js app + install Supabase client: DONE
  evidence: `create-next-app` -> "Success! Created board"; `npm install @supabase/supabase-js` -> "added 8 packages"
Type-check and lint: DONE
  evidence: `npx tsc --noEmit` -> `TSC_OK`; `npm run lint` -> `LINT_OK`
App runs locally: DONE
  evidence: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001` -> `200`; dev log `Environments: .env.local`, `GET / 200`
Supabase reachable with the given browser key: DONE
  evidence: REST probe returned a structured PostgREST error (so auth succeeded and the request reached the schema): `{"code":"PGRST205","message":"Could not find the table 'public.use_cases' in the schema cache"}`, HTTP `404`
Table + demo data created: DONE (user ran the SQL blocks)
  evidence: `curl .../rest/v1/use_cases` -> HTTP `200`, `content-range: 0-13/14` (14 rows), all 14 demo titles present
Counts and stuck flags derived from live data: DONE
  evidence: node script over the live REST response -> `HTTP 200 | rows: 14`, `counts: Idea=4 Scored=4 Building=3 Live=3`, `stuck: 3` (Churn-risk Scored 23d, Sales-call objection Idea 19d, Usage-based upsell Idea 16d)
Write path and input validation: DONE
  evidence: insert `201` (14->15 rows), stage update `200`, invalid stage rejected `400 {"code":"23514",...}` by the CHECK constraint, delete `204` (restored to 14 rows)
Board rendered in a real browser: NOT OBSERVED
  reason: no browser in this environment; the data, the derived values and the write path are verified, the pixels are not

## What broke and how I fixed it
- `npm run lint` failed with `react-hooks/set-state-in-effect`: the mount effect called a helper that set state synchronously. Fixed by moving loading to the promise-callback pattern (`setState` only inside `.then`/`.catch`), which the rule accepts.
- Product bug caught while writing the demo data: `isStuck(iso)` would have flagged a **Live** use case as "stuck" once it aged past 14 days. Fixed by making `isStuck(row)` return `false` for `Live` rows, so "stuck" means *not yet shipped and not moving*.
- Port 3000 was already held by an unrelated `ruby` process (pid 7471). I did not touch it and ran the app on 3001.

## Claims ledger
- App serves locally: `curl` -> `200`; dev-server log `GET / 200` (three requests, no errors)
- Supabase URL + browser key are valid: REST probe authenticated and returned a PostgREST schema error, not an auth error
- `use_cases` table does not exist yet: probe -> `PGRST205 ... "Could not find the table 'public.use_cases' in the schema cache"`
- Three distinct states exist in code: missing setting (`MissingSettingsScreen`, names the env var), call failed (`ErrorPanel`, shows code + message + hint), empty (`EmptyPanel`) - all visually separate
- Board correct with data: DONE - 14 live rows, counts `Idea=4/Scored=4/Building=3/Live=3`, 3 stuck, all via live REST calls; UI write path (insert/update/delete) exercised with restore

## What I would tell the next person
- Local link: http://localhost:3001 (dev server running on port 3001; port 3000 belongs to another process)
- Run `board/SUPABASE-SETUP.sql` block 1 then block 2 in the Supabase SQL editor, then refresh the page
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` live in `board/.env.local`, which is gitignored; no secret key is present anywhere
- Divergence from `TECH-STACK.md` §1.5: that doc called for an append-only stage-history table; the user's explicit SQL spec was a single table, so "time in stage" is a single `stage_changed_at` timestamp. That is enough for the stuck flag but not for trends over time, which stay a Phase 2 item.
