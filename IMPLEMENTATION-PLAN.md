# IMPLEMENTATION PLAN - AI Use Case Backlog Board

**Status: DRAFT**
**Answers one question only: in what order, and what is demonstrable at each step?**

Inputs: `PRD.md` (what and who) and `TECH-STACK.md` (what with). This document is the order.

---

## THE ORDERING RULE

**Every step ends in something you can open on a phone and look at.**

Not "the schema is migrated". A screen. If a step cannot end that way, it is two steps, or it is in the wrong place.

Two consequences, stated up front because they shape the whole plan:

- **Minimal phone legibility is pulled into step 0**, and every step after it must stay legible on a phone. `TECH-STACK.md` originally deferred phone work (A21); its 1.9 has been amended to record that this plan overrides that. Phone *polish* is still deferred; phone *viewability* is a standing requirement of every step.
- **Nothing is built bottom-up.** The database tables are created in the same step as the screen that shows them, so the tables are never more than half a day ahead of something visible.

---

## DECISIONS MOST EXPENSIVE TO REVERSE, AND WHERE THEY HAPPEN

The expensive-to-undo decisions are **decided on Day 0 and encoded in step 1**, before there is any data to migrate. Implementation of the access answer lands at step 5, but the decision and the data shape that keeps it reversible happen first. This is deliberate: the cost of reversing these grows with every row entered.

| # | Decision | Decided | Encoded in the build | Why it must be early |
|---|---|---|---|---|
| D1 | **Open link vs. limited access** (PRD C1/C6) - the most expensive to reverse per `TECH-STACK.md` §5 | **Day 0, written answer** | Step 1 (data shape), step 5 (enforcement) | Undoing it later means sign-in, backfilling owners, permissions on every write, after rows exist |
| D2 | **Owner is a label or a real account** (C2) | **Day 0** | Step 1 (owner stored as a label plus a nullable account link) | Same reason; the nullable link is what makes step 5 cheap instead of a rewrite |
| D3 | **Stage history is recorded from day one** (C5, PRD §7) | **Day 0** | Step 1 (append-only stage history table) | "Stuck" and the 14-day metric are facts about time; a stage column alone cannot answer them, and adding history later loses the past |
| D4 | **The stage set, including an outcome for "not doing this"** (C7) | **Day 0** | Step 1 (stages as a text list, not a database enum) | A database enum makes every future stage a migration; text keeps it a one-line change |
| D5 | **What "impact" is** (PRD A7) | **Day 0** (or accept "text for now") | Step 1 (impact as text) | A typed column now is a migration when the definition arrives |
| D6 | **One board, not many** (PRD A20) | **Day 0, confirm** | Step 1 (no board/workspace key) | Splitting one board into many is a rewrite; confirm before the schema exists |
| D7 | **Customer names on an open board** (C1) | **Day 0** | Step 1 (customer stored as a short label, no PII) | A label is reversible; stored names and contacts are a leak to remove |

**Day 0 is not a build day.** It is a 30-minute conversation that produces written answers to D1-D7, or an explicit "leave it open / text for now" so the reversible default is chosen on purpose. The reversible defaults are already baked into `TECH-STACK.md` §1.5. If the answers are not available by the end of Day 0, the plan proceeds on those defaults and step 5 is where the open questions land - not the schema.

---

## PHASE 1 - THE MVP PROMISE

**Estimate: 12 half-days base (6 days), 15 half-days if access is limited (7.5 days). One builder, working full-time, assuming Day 0 answers exist.** `[P1]`

Both figures exceed one calendar week, and that is stated on purpose: the plan below fits one week only if the cut list is applied, and the cut list is in this document so you are not deciding it at 2am. The numbered steps are the order; the cut list decides what leaves if the week is fixed.

### Step 0 - A page you can open on your phone (1 half-day)

**What gets built:** the application skeleton, a single board screen with the counts row at the top (all zeros) and an empty board below it, deployed to a real public URL. Minimal responsive layout so it does not overflow on a phone.

**What you can see at the end:** you open the deployed URL on your phone, not a local server. The four stage counts read 0 and the board says there is nothing yet.

**Verification (run before marking complete):**
- Open the URL on a phone and on a laptop; confirm both render and neither scrolls sideways.
- Confirm the URL is the deployed one, not a development server.
- Confirm there is no login prompt (PRD requirement, and the first check of D1).
- If this step surfaces the hosting terms problem (Hobby forbids commercial use), record it now - it is a Day-0-cost decision, not a week-3 surprise.

**Why it is first:** a hosting, domain, or phone-rendering mistake found here costs half a day. The same mistake found at step 7 costs the deploy of everything.

---

### Step 1 - Real rows on the board, from a real database (2 half-days)

**What gets built:** the database, the use-case table, the stage-history table, and the read path. Seed about four rows spread across the four stages. Render the rows and the counts from real data. The schema follows `TECH-STACK.md` §1.5: owner and customer as labels, impact as text, stage as text, an append-only history table, and a nullable account link on owner (D2).

**What you can see at the end:** the board shows four real use cases in their stages, with non-zero counts at the top, on your phone.

**Verification:**
- Change one seeded row's stage directly in the database; reload the board; confirm the counts move. This proves the counts are derived, not hardcoded - the test fails if they are hardcoded.
- Confirm the same four rows appear on phone and laptop.
- Confirm a seeded row that has never changed stage still produces a sensible "days in stage" value later (seed the history correctly now; this is what step 4 depends on).

**Why here:** this is the expensive-to-reverse schema (D2-D7). It lands before anything is built on top of it, and it ends visible, so the ordering rule holds.

---

### Step 2 - Changing a stage from the board, and the counts changing with it (2 half-days)

**What gets built:** the one correctness-critical write path. Changing a stage writes the new stage **and** the history row in a single transaction, then updates the counts. The screen updates optimistically for the person who made the change and refetches when the tab regains focus.

**What you can see at the end:** you tap a row's stage on your phone, choose a new one, the row moves, the number at the top changes immediately, and it is still changed after a reload and on a second device.

**Verification (must be able to fail):**
- Move a row; assert the count changed; reload; assert it persisted; open on a second device; assert it matches.
- Assert exactly one history row was written, with the correct from-stage, to-stage, and timestamp.
- **Force the history write to fail and assert the stage change does not happen.** This is the atomicity test and it is the point of the step. If the stage changes while the history write fails, the "stuck" feature in step 4 becomes a lie and every later step inherits it.

**Why here:** this is the product's core and its only correctness-critical path. A wrong write model found at step 2 costs two half-days; found at step 7 it costs the feature built on top of it.

---

### Step 3 - Adding and editing a use case (2 half-days)

**What gets built:** create a use case (title, owner label, customer label, impact, starting stage); edit those fields; and required-field validation that rejects an empty title with a clear reason and saves nothing.

**What you can see at the end:** you add a use case from your phone; it appears at the stage you chose and the count increments; you edit its owner and impact and the change survives a reload.

**Verification:**
- Submit with an empty title: assert it is rejected, shows a reason, and **nothing is saved** (reload and confirm the row count is unchanged). A test that lets bad data be saved is the wrong test - fix the requirement, not the test.
- Submit valid: assert it appears, the count matches, and it persists.
- Edit a field: assert it persists and the history table is not polluted by a non-stage edit.

**Why here:** the field model is the second-most-likely thing to change. Building it before "stuck" means a field mistake is corrected before step 4 depends on it.

---

### Step 4 - "Stuck" made visible (2 half-days)

**What gets built:** for each row, how long it has been in its current stage, computed from the history table; a configurable threshold; and a visible flag on rows past it. The top of the board makes the answer to "what is stuck?" readable without doing arithmetic.

**What you can see at the end:** on your phone, every row shows its age in the current stage, and the ones that have stopped moving are visibly flagged, so you can answer "what is live and what is stuck?" in seconds.

**Verification:**
- Backdate a seeded row's most recent stage change in the database; reload; assert that row shows the old age and is flagged.
- Assert a row moved moments ago is **not** flagged (the test must be able to fail the other way).
- Change the threshold; assert the flagged set changes.

**Why here:** PRD C5 says "counts" and "stuck" cannot both be what the client thinks they are. This step is where that is confirmed or killed, with a real screen and real data - and it lands mid-week with room to change, not on the last day.

---

### Step 5 - The access answer, enforced (1 half-day if open / 4 half-days if limited)

**What gets built:**
- **If D1 is "stays open":** nothing to build beyond the screen already opening directly. Confirm the unlisted-URL state and add a short line on the board saying what it is. (1 half-day)
- **If D1 is "limited":** magic-link sign-in, an allowlist of named people, viewer vs. editor roles, and every stage change recording who did it (the history table already has the column). (4 half-days)

**What you can see at the end:**
- Open: the board opens directly, as described.
- Limited: you sign in from your phone, you see the board, a non-allowlisted account is refused, and each row shows who last moved it.

**Verification:**
- Open: assert there is no auth prompt and the write path still works.
- Limited: assert a non-allowlisted account cannot open the board; assert a viewer cannot change a stage; assert an editor can, and the actor is recorded on the history row.

**Why here:** this is the most expensive decision to reverse (`TECH-STACK.md` §5), so it is deliberately not last. It sits before legibility polish so that if the week slips, the thing that leaves is polish, not access.

---

### Step 6 - Legibility and the cold read (1 half-day)

**What gets built:** empty and sparse states, labels that explain themselves without a manual, and a phone layout where the columns do not wrap into mush.

**What you can see at the end:** you hand your phone to someone who has never seen the board.

**Verification (a person test, not a code test):** an unprimed colleague reads the board and answers "what is live?" and "what is stuck?" without you explaining anything. Write down anything they got wrong; that is the defect list.

**Why here:** PRD A11 says users arrive cold. This is the only way to test it, and it must happen while there is still time to change words.

---

### Step 7 - Instrument the metrics and run the whole verification once more (1 half-day)

**What gets built:** whatever is needed to read the PRD §7 numbers off the board (per-row freshness already exists from step 4; stage-change counts and coverage are read directly). Then a single end-to-end pass of every verification above, against the **deployed** URL, not local.

**What you can see at the end:** the board on your phone at the real URL, passing the exit criteria below in one sitting.

**Verification:** re-run every step's verification on the deployed URL and record the output. Anything not re-run on the deployed URL is not done.

---

### The week at a glance

| Day | Half-days | Steps | Ends with |
|---|---|---|---|
| Day 0 | - | Decision checkpoint (D1-D7) | Written answers, or explicit reversible defaults |
| Day 1 | 2 | Step 0, Step 1 | A phone-viewable board showing real seeded rows |
| Day 2 | 2 | Step 1 finish, Step 2 start | Rows and counts from the database; stage-change write path in progress |
| Day 3 | 2 | Step 2 finish, Step 3 | A stage you can change on your phone; a use case you can add |
| Day 4 | 2 | Step 3 finish, Step 4 | Add/edit working; "stuck" rows flagged |
| Day 5 | 2 | Step 4 finish, Step 5 | Access answer enforced (if it fits), then legibility |
| Week 2 head | 2 | Step 5/6/7 | Cold-read test and the full deployed verification pass |

Base estimate (open access) fits in roughly 12 half-days; limited access is 15. The week fits only with cuts - see below.

---

## EXIT CRITERIA FOR PHASE 1 (tickable)

- [ ] The board opens on a phone at a public URL with **no login prompt** (if D1 is "open") or after sign-in for allowlisted people only (if D1 is "limited").
- [ ] All rows are visible together on one screen, on a phone, without sideways scrolling.
- [ ] Each row shows all four fields: use case, owner, customer, impact.
- [ ] Each row is in exactly one of the agreed stages.
- [ ] Changing a stage from the board persists, and the counts at the top reflect it, within the interaction.
- [ ] A stage change writes a stage-history row, verified by inspection. Stage and history are written together: a failed history write leaves the stage unchanged (the atomicity test).
- [ ] A use case can be created from a phone and edited afterwards, and the changes survive a reload.
- [ ] An empty title is rejected with a clear reason and **nothing is saved**.
- [ ] Every row shows time in its current stage, and rows past the agreed threshold are visibly flagged.
- [ ] The founder can state what is live and what is stuck from the phone screen alone, with no explanation from the builder.
- [ ] An unprimed person can read the board and answer those two questions without help.
- [ ] Every PRD §7 metric is readable from the board or measurable by hand, with the 14-day freshness threshold configurable in one place.
- [ ] Every step's verification above has been re-run against the deployed URL and the output recorded.
- [ ] No secret reaches the browser: every key lives in server-side environment configuration only.

---

## WHAT GETS CUT IF THE WEEK SLIPS

Decided now, in this order, so nobody decides it at 2am. Cut from the bottom; the top of the list goes first.

1. **Phone polish** (step 6). The board stays viewable on a phone - that is the ordering rule - but the layout is left rough.
2. **The threshold flag's visual treatment** (step 4). Keep the raw "days in stage" number on every row; drop the colour/flag. The information survives; the decoration does not.
3. **Edit-after-create** (step 3). Keep create and keep stage changes; a typo in an owner or an impact note waits.
4. **The cold-read person test** (step 6 verification). Do it the following week rather than skipping it, and do not count the phase as done until it happens.
5. **Viewer vs. editor roles** (step 5, limited case). Ship the allowlist and sign-in, and let allowlisted people edit for now. A coarse rule now beats no rule.
6. **Metrics instrumentation** (step 7). Read the numbers by hand for a week.

**Never cut, under any pressure:**
- The atomic stage-change-plus-history write, and its atomicity test (step 2).
- The counts updating from real data (step 1).
- Required-field validation that saves nothing on bad input (step 3).
- The board being openable on a phone (the ordering rule).
- The written Day 0 decisions (D1-D7). Cutting these does not save time; it moves the cost to month three.

If cuts 1-6 are applied and the week still slips, the honest move is to ship steps 0-4 (a board the founder can read) and treat step 5 as the first thing in week two. A board with no correct "stuck" signal is worse than a board with no access rules, because the founder will trust the wrong number.

---

## PHASE 2 - WHAT WAITS ON DECISIONS (each step still ends visible)

Ordered so the riskiest unresolved item is proven first. Each step ends in something openable on a phone, per the standing rule.

1. **The outcome for "not doing this"** (PRD C7). Add the rejected/parked value(s) and decide whether those rows stay on the board or leave it. **See:** parked rows visibly distinguished from active work. **Test:** park a row; assert it is excluded from the active counts and that its history is intact. (1 half-day)
2. **Owners as real people** (C2/D2). Link owners to accounts, backfill from the labels, fill the actor on new history rows. **See:** each row shows a real person, and each stage change shows who did it. **Test:** an old label resolves to the right account, or is explicitly unassigned. (2 half-days)
3. **A typed impact** (A7). Only if the client defines it as a number; backfill. **See:** impact shown in its agreed unit and sortable. **Test:** the backfill maps every existing text value. (2 half-days)
4. **Trends over time** (PRD §5, A18). Now cheap because the history exists from step 1. **See:** how long things sit and how much moved this month. **Test:** the numbers reconcile against the history rows. (2 half-days)
5. **A board too large for one screen** (C3). Search, filter, or a bounded active view. **See:** a way to find a row when there are two hundred. **Test:** filtering to a stage shows exactly the rows in it. (2 half-days)

---

## PHASE 3 - PRODUCTION READINESS (still visible where possible)

These are the config-grade items from `TECH-STACK.md` §2 and the free-tier cliffs from §3. Most are not user-visible; where a step cannot end on a phone, it is because it is an operational switch, and it is listed here rather than as a build step.

- Move hosting to the paid tier, because the free tier forbids commercial use (`TECH-STACK.md` §3.1). Config.
- Remove the database host's inactivity pause, or move to a host that scales to zero (`§3.2`). Config.
- Point sign-in email at a transactional provider before more than a handful of people sign in (`§3.3`). Config plus DNS.
- Use the database connection pooler (`§3.4`). Config.
- Add error tracking (`§1.11`). Additive.
- Nightly backup of the database. Config.
- The client's own domain. Config plus DNS.

---

## OPEN DEPENDENCIES ON THE CLIENT

These block the steps named, and are the same list as PRD §8, narrowed to what this plan needs:

1. **Answers to D1-D7 by Day 0.** Without them, the plan proceeds on the reversible defaults in `TECH-STACK.md` §1.5, and step 5 carries the risk.
2. **The real list of use cases**, however messy, for the step 1 seed and for the coverage metric in step 7. (PRD §8.1)
3. **The definitions of "impact", "Scored", and "stuck"**, or an explicit "text and time-in-stage for now". Steps 1 and 4. (PRD §8.2-8.4)
4. **A named person to maintain the board** for the first month, and a review rhythm. Not a step, but it is the difference between a board and an empty board. (PRD §8.10)
5. **The founder's definition of "Live"** before step 4's flag is tuned. (PRD §8.9)

---

## ASSUMPTIONS I HAD TO SUPPLY

- **`[P1]`** This plan assumes one builder working full-time for the stretch described, an existing code repository, and Day 0 answers delivered as written text rather than in conversation.
- **`[P2]`** The half-day estimates assume the stack in `TECH-STACK.md` is followed as written, in particular Postgres from day one and Supabase's bundled auth for step 5.
- **`[P3]`** The week is assumed to be five working days with the decision checkpoint on Day 0, not a build day.
