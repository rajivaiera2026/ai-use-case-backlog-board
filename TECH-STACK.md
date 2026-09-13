# TECH STACK - AI Use Case Backlog Board

**Status: DRAFT**
**Answers one question only: what do we build it with, and why that?**

Two inputs decide everything in this document:

1. **The PRD** (`PRD.md`). One board, one screen, all rows visible. Four fields per row (use case, owner, source customer, impact). Four stages (Idea, Scored, Building, Live). Stage change updates the counts at the top. Opens on the board with nothing behind a login. The founder must be able to see what is live and what is stuck (C5 unresolved - "stuck" needs time, see 1.5).
2. **The scale: 100 users.** Not a million. This is the number every choice below is tested against.

---

## 0. WHAT 100 USERS ACTUALLY MEANS

Stated plainly, because it rules most of this document out before we start:

- **Concurrent users at peak:** under 5.
- **Total accounts:** 100, of which perhaps 20 are weekly.
- **Rows on the board:** tens, at most a few hundred (PRD C3).
- **Total data:** under 10 MB, including stage history.
- **Writes:** a few dozen stage changes a day. This is not a load problem.
- **Reads:** maybe 2,000 board loads a day.

Nothing here is hard. The engineering risk in this project is **not** scale - it is the unresolved contradictions (C1-C7) and the human habit of keeping the board current. Every choice below optimises for **cheapest and least operational work**, and deliberately gives up scale it will never need.

The one thing that does change behaviour: **a browser tab left open all day plus an expectation of "live" counts.** That is a realtime-shape problem at 100 users, and section 1.4 rejects the realtime answer.

---

## 1. DECISIONS BY LAYER

Each choice is paired with the constraint that forced it. Rejected options are listed with the reason, so this does not get re-litigated in three months.

### 1.1 Frontend framework

**Choice:** Next.js (App Router), TypeScript, one application.

**Constraint that forced it:** The PRD wants one screen that is also the whole product, and the board needs server-side reads (counts, rows) plus writes (stage changes). Next.js lets the screen and its server functions ship as a single deployable thing, so there is one artifact to host, one thing to roll back, and one place where the login wall (1.6) will eventually go. It also assumes React, which is the most available skill in Bengaluru product teams - relevant because a team of this size will maintain it themselves.

**Rejected:**
- **Plain HTML + a small server (HTMX-style).** Genuinely the cheapest fit for one screen, and I would not argue against it as a prototype. Rejected because a login wall, roles, and an editable table of rows all have to be hand-built later, and there is no component ecosystem to lean on when the board grows slightly. It trades a little day-one speed for a lot of week-six work.
- **A separate React single-page app plus a separate API.** Two deploys, CORS, and two sets of environment variables for one screen. The separation buys nothing at 100 users.
- **SvelteKit / Vue / Nuxt.** Technically fine, arguably nicer. Rejected on hiring and maintenance: the client's own team is more likely to find React help.
- **Angular.** Enterprise-shaped, heavy, wrong for one screen.

**MVP vs production:** identical. No change.

---

### 1.2 Hosting

**Choice:** Vercel. Hobby tier while it is a prototype, Pro in production.

**Constraint that forced it:** Single-deploy hosting for a Next.js app with zero server administration, on a free tier, with a URL the founder can open. There is no ops person on this project.

**Rejected:**
- **AWS (ECS, Lambda, S3, CloudFront) or GCP equivalent.** Every one of those services needs configuration, IAM, and someone to look after it. That cost is real and buys capacity for a million users we do not have.
- **A plain virtual server.** Cheapest line item, but now you patch it, secure it, and deploy to it. That is a part-time job, and at 100 users it is all cost.
- **Fly.io / Render / Railway.** Fine, container-shaped. Rejected only because there is nothing to containerise that Vercel does not already host.
- **Cloudflare Pages / Workers.** This is the real alternative, and the honest reason to consider it: Cloudflare's free tier permits commercial use and Vercel's does not (see section 3). Rejected because running Next.js server functions there needs an adapter, and the $20/month saved is not worth an adapter between the client and the framework.

**MVP vs production:** Same host. **Hobby to Pro is a billing switch, not a rewrite** - but you will have to make it, because Hobby forbids commercial use. See section 3.

---

### 1.3 Server functions

**Choice:** Next.js route handlers and server actions, deployed with the app. A single write path per action (create row, change stage).

**Constraint that forced it:** The whole backend is roughly five operations - list rows, count by stage, create, edit, change stage. It lives in the same repository as the one screen and is called by nobody except that screen. There is no second consumer, so there is no reason to expose an API.

**Rejected:**
- **A separate Node service (Express/Fastify).** Extra deploy, extra monitoring, network hop, for five functions.
- **GraphQL.** A query language and schema layer to serve one fixed screen.
- **tRPC / a typed API layer.** Pleasant, and defensible if the client loves it. Rejected as an unnecessary concept for one caller.
- **Raw AWS Lambda or edge functions.** Configuration without benefit. The default serverless runtime is fast enough; edge adds constraints (no long-lived connections) we do not need.
- **Microservices, queues, workers.** There is no asynchronous work in this product. Every operation is a person clicking something and waiting under a second.

**MVP vs production:** identical.

---

### 1.4 The database

**Choice:** PostgreSQL, hosted on a managed free tier. **Supabase** in MVP (it bundles the auth we know is coming in 1.6), with the understanding that it is plain Postgres and can move.

**Constraint that forced it:** The board is relational and boring: rows with a stage, and a `GROUP BY stage` for the counts. Stage changes must be atomic (write the new stage and record the change together). Postgres is the default-shaped answer, its free tiers at this scale are effectively infinite, and - critically - **choosing Postgres now means the engine is never the thing you rewrite later.**

**Rejected:**
- **SQLite as a file in the project.** The host's filesystem is ephemeral. The board would reset. This is the single most tempting and most wrong shortcut here.
- **Turso / libSQL.** Excellent free tier, and SQLite is a fine fit for this data. Rejected because it is a different dialect: the day you outgrow it or want managed backups you are converting, and "convert the database" is a rewrite (see section 5).
- **Airtable or Google Sheets as the database.** Free, visible, and you can build this in an afternoon. Rejected on three counts: it becomes the product (leaving is a rewrite), the row limits and request rate caps are exactly the kind of thing you hit with an open tab refreshing, and there is no transaction around a stage change. It is a prototype that impersonates a stack.
- **Firebase Firestore.** Counting by stage means aggregation queries, and the whole thing is a vendor with a proprietary query model. No relational benefit lost, but no SQL to fall back on either.
- **MongoDB.** Nothing here is document-shaped. Relational data in a document store is a preference, not a constraint.
- **MySQL / PlanetScale.** No advantage over Postgres, and PlanetScale's free tier is gone - a reminder that free tiers are a business decision someone else can reverse.

**MVP vs production:** **Supabase free to Supabase Pro, or to Neon, is a connection-string change.** That is the entire point of picking the portable engine. No rewrite.

---

### 1.5 Data shape - the part the PRD's features specifically force

This is the only layer where a wrong call is expensive, so it gets its own section.

**(a) Row table.** One table for use cases: id, title, owner label, customer label, impact, current stage, created-at, updated-at.

**Constraint:** the four fields and four stages in PRD §4. Nothing more.

**Rejected:** a column per assumption the client has not defined (a numeric score, a separate customer record, an owner record). Each of those is a schema guess about an unresolved question, and every guess is a future migration. Keep them as labels until the definitions land.

**(b) Stage history table, built on day one.** Append-only: use-case id, from-stage, to-stage, timestamp, actor label (nullable while there is no login).

**Constraint that forced it:** C5 and PRD §7. "Stuck" and the 14-day freshness metric are facts about **time**, and a single mutable `stage` column cannot answer "how long has this been sitting here?" The PRD lists trends and stuck-detection as waiting items, and they are only cheap if the history exists from the beginning. Writing one extra row per stage change is free.

**Rejected:** current-stage-only (this is the rewrite the client would pay for in month three); full event sourcing for every field (overkill - only stage needs history).

**(c) Stage values as text with an application-side list, not a database enum.**

**Constraint that forced it:** C7 and C4 are unresolved. It is likely a "Rejected"/"Parked" value or a parallel "Scored" judgement appears. Adding a value to a database enum is a migration; adding one to a list is a one-line change. The board also has to render whatever set is agreed, so the list has to live somewhere editable.

**Rejected:** a database enum (rigid, and painful to amend); hard-coded stage names in the screen (the client will change a word and it becomes a deploy).

**(d) Impact stored as text with an optional structured payload, never a typed number.**

**Constraint that forced it:** PRD A7 - "impact" is undefined. Storing a number today means the definition arrives as a migration tomorrow, with data that has to be reinterpreted.

**(e) Customer stored as a short label, not a customer record with names and contact details.**

**Constraint that forced it:** C1 is unresolved and the board is open. A label satisfies "traceable to the customer it came from" without turning the open link into a customer-data leak. If C1 resolves toward privacy, nothing has to be removed.

**Rejected:** a customer table with PII (creates the exact exposure C1 warns about, and needs access control that does not exist yet).

**MVP vs production:** the shape is identical. Production adds a real user identity for `owner`, which is a backfill (1.6), not a new design.

---

### 1.6 Authentication and identity

**Choice:** **None at MVP** - that is the PRD's literal requirement (A12). **Production:** email magic-link sign-in via the managed auth that comes with the database host (**Supabase Auth**), chosen over a separate auth vendor.

**Constraint that forced it:** The brief says the link opens with nothing behind a login, so the MVP does not build auth. But the moment C1 (customer names), C2 (real owners) or C6 (trusted edits) is decided the safe way, identity is required - and it needs to be addable without redesigning the board. Bundling auth with the database means one vendor, one bill, one free tier, at 100 users. Magic links mean no passwords to store or reset, which matters with no ops team.

**Rejected:**
- **Auth0 / Okta.** Enterprise auth priced and shaped for many thousands of users and complex policies. Wrong size.
- **Custom-built auth.** Storing credentials and sessions yourself, with no security owner, is the classic way a small internal tool becomes an incident.
- **Passwords.** Support burden and password-reset surface that magic links remove.
- **Google sign-in only.** Attractive if the client is on Google Workspace, and worth revisiting then. Rejected as the default because it assumes a Workspace decision the client has not told us.
- **A separate auth vendor (Clerk) purely for developer experience.** Fine product, but it is a second vendor and a second free tier for something the chosen database already includes.

**Change classification (important):**
- Adding the login wall in front of the board: **additive** (middleware plus a sign-in screen). Cheap.
- Turning `owner` from a typed label into a real person: **migration plus a rewrite of the write paths.** Every row's owner has to be matched to an account, and permissions have to be added to each mutation. This is the change to plan for, not fear - see section 5.
- Adding audit (who changed what): **additive**, because the stage history table already records it and only needs an actor filled in.

---

### 1.7 Access model

**Choice:** MVP: unlisted link, no restrictions, exactly as described. Production: the link plus an allowlist of named people, and two roles - viewer and editor.

**Constraint that forced it:** C1 and C6. An open link carrying customer names and internal priorities is the highest-risk item in the PRD. An allowlist plus viewer/editor is the smallest thing that closes it and does not require a permission matrix.

**Rejected:** a full role/permission system (overkill at 100 users); IP allowlisting (an operational burden, and the founder checks from wherever they are); no restriction forever (the thing a customer or a security review will force you to undo - see section 5).

**MVP vs production:** **additive** if 1.6's identity exists; **impossible** without it. This is why 1.6 is the expensive decision.

---

### 1.8 "Live" counts, and the temptation of realtime

**Choice:** Counts computed in the database and rendered on each board load, plus an optimistic update in the screen when a stage changes (the number moves instantly for the person who moved it), plus a light refetch when the tab regains focus.

**Constraint that forced it:** 100 users, under 5 concurrent, and stage changes that happen a handful of times a day. A `GROUP BY` over a few hundred rows is effectively instant. A user reopening a tab sees fresh numbers; nobody else's edit needs to appear on someone's screen in milliseconds for this product to work.

**Rejected:**
- **WebSockets, server-sent events, Pusher, Ably, Supabase Realtime.** Each adds a connection to manage, a subscription to leak, and a bill, to deliver an update that matters seconds later at most. At 100 users the honest calculation is: this is 100 idle connections to avoid a page refresh.
- **Collaborative editing (CRDT/OT).** Multiple people editing the same cell is not a described requirement. Last-write-wins on a rare click is correct here.
- **A background job or cache to precompute counts.** The query is trivially cheap. Cache invalidation would be the only bug this introduces.
- **Client state library (Redux/Zustand) or a data-fetching library.** One fetch of a few hundred rows does not need a cache manager.

**MVP vs production:** identical. If the client later insists on seeing others' changes live, it is **additive** (subscribe to stage changes), not a re-architecture. Do not pre-build it.

---

### 1.9 Styling and the screen

**Choice:** Tailwind CSS, a plain table, no component library at MVP. A single board layout with the counts as a row of figures at the top.

**Constraint that forced it:** One screen, must be legible cold (A11), and the entire design surface is one table and a handful of controls. A component library would be most of the bundle for none of the benefit.

**Rejected:** MUI / Ant Design / Chakra (weight and an enterprise look, for four fields); a bespoke CSS architecture (time for no gain); a design system (premature for one screen).

**MVP vs production:** the phone layout is **additive UI work**, deferred (A21), and should stay deferred until the founder confirms they check it between meetings.

*Amended after the implementation plan:* the plan's ordering rule is that every step ends in something viewable on a phone, so **minimal phone legibility is pulled into Phase 1 from the first step** (the board must render and the counts must be readable on a phone at every step). What stays deferred is phone *polish* - not phone *viewability*. Edit reason: the implementation plan's ordering rule overrides the softer deferral here, and the two documents disagreed on this one point.

---

### 1.10 Email

**Choice:** MVP: the database host's built-in auth email, for testing with one or two accounts. Production: a dedicated transactional email provider on its free tier (e.g. Resend) wired as the custom SMTP sender.

**Constraint that forced it:** Email exists in this product for exactly one reason - magic-link sign-in (1.6). The free built-in sender is rate-limited to a handful of messages per hour and is explicitly not for production, so it is fine while testing and fails the day 100 people sign in. That is a concrete free-tier ceiling (see section 3).

**Rejected:** a notification or digest system - PRD §5 explicitly excludes notifications, so no email beyond auth; a paid provider from day one (unnecessary); Postmark/SendGrid (fine, just not chosen; any of them works).

**MVP vs production:** **a configuration change plus DNS records**, not code.

---

### 1.11 Error monitoring and operations

**Choice:** MVP: the host's logs and a trivial health check. Production: an error tracker on its free tier (e.g. Sentry), added when the board is used daily.

**Constraint that forced it:** No ops person. The point is to learn about a failure before the founder does, without building dashboards for a system with five operations.

**Rejected:** Datadog, New Relic, Grafana, a metrics pipeline - enterprise observability for a one-screen internal tool.

**MVP vs production:** **additive configuration.**

---

### 1.12 Testing and delivery

**Choice:** type checking, a handful of integration tests around the one thing that must not break (**the stage change writes the new stage and the history row together, and the count reflects it**), and CI on the free tier of the repository host.

**Constraint that forced it:** Small team, low ceremony, and exactly one correctness-critical path. Test that path; do not build a pyramid for a five-operation tool.

**Rejected:** full end-to-end suites at MVP (slow, brittle, and no user journey beyond one screen); heavy coverage targets (the wrong goal here).

---

## 2. MVP VS PRODUCTION, AND WHAT KIND OF CHANGE EACH IS

Types of change: **config** (a setting or a line), **additive** (new code, existing behaviour untouched), **migration** (data has to be carried across), **rewrite** (the design changes).

| Layer / decision | MVP | Production | Change type |
|---|---|---|---|
| Hosting | Vercel Hobby (prototype) | Vercel Pro | **config** (billing) - see section 3 |
| Domain | Hosted preview URL | Client's own domain | **config** (DNS) |
| Database engine | PostgreSQL | PostgreSQL | **none** - this is deliberate |
| Database host | Supabase free | Supabase Pro, or Neon | **config** (connection string) |
| Frontend framework | Next.js / TypeScript | Same | **none** |
| Server functions | Next.js handlers | Same | **none** |
| Stage history | Built, recording from day one | Same | **none** - the avoided rewrite |
| Stage values | List in the app | Same list, extended | **config / data** |
| Counts | Server roll-up, optimistic update | Same | **none** |
| Live updates for others | Not built | Optional subscribe | **additive** |
| Auth | None (per PRD) | Magic-link sign-in | **additive**, then a **migration** for owners |
| Owner field | Typed label | Linked to a real account, backfilled | **migration + write-path rewrite** |
| Access | Open link | Allowlist, viewer/editor roles | **additive** (needs auth first) |
| Customer on the row | Short label, no PII | Names only if C1 is decided that way | **config / data** |
| Impact | Text (+ optional payload) | Typed only once defined | **migration** (backfill) |
| Email | Built-in sender, testing only | Transactional provider via SMTP | **config + DNS** |
| Error tracking | Host logs | Error tracker free tier | **additive** |
| Phone layout | Deferred | Additive UI work | **additive** |
| One board | One board | Still one board | **rewrite if this ever changes** (see 5) |

**The rewrites worth naming:** (1) converting owners from labels to real accounts, (2) turning impact into a typed scoring field if the client defines it as a number, (3) splitting one board into many. Everything else is config or additive. All three are deferred on purpose, and none is caused by the database or hosting choice.

---

## 3. THE FREE-TIER CLIFFS, AND WHICH ONE ACTUALLY PUSHES YOU OFF

At 100 users you will not run out of storage, bandwidth, rows, or requests. The honest list of what forces a change:

1. **Vercel Hobby forbids commercial use.** This is the one that forces you off, and it has nothing to do with volume - it is a licensing term. A client's internal business tool is commercial. Budget for the entry paid tier (~$20/month) from the day it is used by the client for real work. **This is the answer to "which limit forces me off the free tier."**
2. **The database host's free tier pauses an inactive project** (Supabase free, after about a week of no use). A board that the team ignores for a quiet week can go dark exactly when someone finally opens it. Either expect daily use, or pay for the tier that removes pausing (~$25/month), or choose a host whose free tier scales to zero rather than pausing (Neon).
3. **The database host's built-in auth email is rate-limited to a few messages per hour.** Fine for testing, not for the day a bunch of people sign in. Switch to a transactional provider's free tier before launch. If sign-in volume ever exceeds that provider's daily free allowance, it is a small paid step.
4. **Serverless database connections can exhaust the free connection limit** under bursty concurrency. Not a paywall - use the connection pooler and cap concurrency. Worth knowing before it looks like a mystery outage.
5. **Repository CI minutes, error-tracker events, email volume:** all far above what 100 users generate. Not a real ceiling.

**Conclusion:** the free tier fails on **terms of use** and **inactivity pausing**, not on scale. Plan the $20-45/month that removes both, and treat everything else as free until proven otherwise.

---

## 4. THE ENTERPRISE SET I AM DELIBERATELY NOT BUYING

Named here so they do not creep in later, each rejected for the same reason: it serves a scale or a team this project does not have.

- Microservices, containers, Kubernetes, an orchestration layer.
- A message queue or background worker (there is no asynchronous work).
- A cache or Redis (the queries are already instant).
- A CDN configuration beyond the host's default (one board, one origin).
- GraphQL, an API gateway, or a public API (there is one consumer: the screen).
- A data warehouse, analytics pipeline, or BI tool (metrics in PRD §7 are readable from the board itself).
- Feature flags, A/B testing, a design system.
- A full identity provider with SSO and policy engines (until a security review says otherwise).
- Multi-region, high-availability configuration, disaster-recovery drills (a few hundred rows and a nightly backup is the right bar).

---

## 5. THE DECISION MOST EXPENSIVE TO REVERSE

**The open, identity-less board - "nothing behind a login" together with rows that name the customer and an "owner" who is just text.**

This is the choice that would hurt most to undo in six months, more than the database or the host, for four reasons:

1. **It is the decision most likely to be forced back on you.** Not by engineering - by a customer, a procurement form, or a security review that objects to internal priorities and customer names sitting on an open link. The PRD's own C1 says the two cannot both hold.
2. **Undoing it is not one change; it is four.** You would add sign-in, build an access rule, convert every `owner` from a typed label into a real person (with a data backfill and a rewrite of every write path), and add permissions to operations that currently assume anyone can do anything. The stage-history table is already ready for audit, but nothing else is.
3. **It changes the product's promise, not just its plumbing.** The whole appeal is "the link opens straight on the board". Adding a login wall is a product change, and it has to be communicated to everyone who already has the link.
4. **It cannot be deferred cheaply by accident.** Deferring it is fine - the PRD does defer it - but only if the client understands they are choosing it, because the cost of reversing grows with every row entered.

By contrast, the choices that feel scary are cheap: the database engine (Postgres from day one), the host (a billing switch), realtime (not built, additive later), and stage history (recorded from day one). **The identity and access decision is the one to get a written answer on before the first row is entered, even if that answer is "leave it open" - because the answer, not the code, is what is expensive to reverse.**
