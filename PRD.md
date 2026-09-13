# PRD - AI Use Case Backlog Board

**Status: DRAFT**
**Answers one question only: what are we building, and for whom? (No technology decisions in this document.)**

---

## READ THIS FIRST - UNRESOLVED CONTRADICTIONS

This document does not resolve the contradictions below. Each one is a decision that belongs to the client, not to us. Read this list before anything else, because the rest of the document changes depending on how these land. Full detail in section 2.

- **[C1] Open to anyone vs. commercially sensitive content.** The board is meant to open with nothing behind a login, and every row names the customer it came from. Those two cannot both be true without exposing customer names and internal priorities.
- **[C2] No login vs. "each row with an owner".** No identity means "owner" is a typed label and nobody can be held to a stage change.
- **[C3] "One screen" vs. "every AI use case".** One screen is a shortlist; every use case is an unbounded list. Which is it?
- **[C4] One stage per row vs. work that runs in parallel.** A single Idea-to-Live position cannot express a use case that is scored, re-opened, or being built before it is live.
- **[C5] "Counts" vs. "what is stuck".** Counting rows per stage does not tell the founder what is stuck; stuck is about time, not count. The phrase promises more than the described behaviour delivers.
- **[C6] Anyone can move a stage vs. a founder who trusts the view.** If everyone edits, the founder's roll-up is only as reliable as the least careful person.
- **[C7] An outcome for "we are not doing this".** The four named stages have nowhere for a dropped or rejected use case to go, yet "what is stuck" implies work does stall.

---

## SOURCE NOTE - WHAT I WAS ACTUALLY GIVEN

Your message described this as "my answers from an interview", but the only raw material included was the one-paragraph description of the idea that begins "AI use case backlog board". No interview questions or answers were attached.

Consequence: **every quote in section 1 is drawn from that single paragraph**, and almost everything else in this document is an assumption about what a real client would have told us. Those are marked `[A#]` inline and collected at the end. If a transcript or call notes exist, send them and I will replace assumptions with the client's own words.

---

## 1. WHAT WAS SAID, AND WHAT IT MEANS FOR THE BUILD

Each quote is the client's phrasing. The translation is what that word actually commits us to. "What it costs" is the work or the risk that hides inside it - not a price.

**"every AI use case the team is considering"**
- Means: the board is meant to be the single, complete list. Not a sample, not a shortlist - everything anyone is thinking about. `[A1]`
- What it costs: completeness is a discipline, not a feature. Someone has to gather the scattered ideas (some in chats, some in people's heads) and keep putting them in. An empty or half-full board is the default failure. The tool can hold a list; it cannot make a team fill it. `[A2]`

**"One screen holding"**
- Means: no scrolling through pages, no navigation, no drill-down to understand the state of play. The board is the product. `[A3]`
- What it costs: a hard ceiling on how much detail fits. Once there are many rows, either the screen breaks or the detail has to live somewhere else - and "somewhere else" is out of the idea as described.

**"each row with an owner"**
- Means: every use case has a named human accountable for it. `[A4]`
- What it costs: ownership must be real, which means real people agreeing to it and a way to tell them apart. With nothing behind a login (see C2), "owner" can only be text. An owner who cannot be identified cannot be chased.

**"the customer it came from"**
- Means: every idea is traceable back to real demand, so prioritisation is defensible (we are building this because this customer asked). `[A5]`
- What it costs: we are now storing customer names, and possibly linking them to what they asked for. That is commercially sensitive and sometimes contractually restricted. It also presumes the team records which customer asked - they may not today. `[A6]`

**"the impact"**
- Means: a way to compare use cases and justify order. `[A7]`
- What it costs: "impact" is undefined. Revenue? Time saved? Customer retention? A score? A sentence? Until it is defined, this column is decoration and the board cannot answer "which of these matters most". Defining it is a decision, not a build task.

**"a stage that moves from Idea to Scored to Building to Live"**
- Means: a fixed, shared lifecycle that everyone understands, with exactly one position per use case. `[A8]`
- What it costs: each transition needs a rule. What must exist before something is "Scored"? Who may move it to "Building"? What does "Live" mean - released to everyone, or to one customer? Without these rules the stages become opinion, and the board loses its authority.

**"Changing a stage updates the counts at the top"**
- Means: the top of the screen is a live roll-up by stage, and moving a row is the core interaction of the tool. `[A9]`
- What it costs: the counts are only as meaningful as the definitions behind the stages. If two people disagree on what "Scored" means, the number at the top is confidently wrong. This also presumes the counts are by stage - see C5 for the other reading.

**"the founder sees what is live and what is stuck"**
- Means: the founder's five-second question is "what have we shipped, and what is not moving?" `[A10]`
- What it costs: "live" is answerable by counting a stage. "Stuck" is not - a row sitting in "Scored" for a day and a row sitting there for two months look identical to a count. Delivering "stuck" needs a rule for what counts as stuck (usually time in stage, or an explicit flag). The idea describes the first and promises the second. This is C5.

**"It opens straight on the board"**
- Means: zero friction, no home screen, no setup ritual. The link is the tool. `[A11]`
- What it costs: there is no onboarding, so the board must be legible to someone seeing it cold, with no explanation. Every unclear label ("impact", "Scored") is now a support question rather than a tooltip.

**"with nothing behind a login"**
- Means: anyone with the link can open it; no accounts, no passwords. `[A12]`
- What it costs: no identity, no permissions, no record of who changed what, and no way to close the door later without changing who can see customer names. It is in direct tension with C1, C2 and C6. This is the single most decision-heavy phrase in the idea.

---

## 2. WHAT DOES NOT ADD UP

These are the contradictions. For each: what pulls against what, and the decision I need from the client. I am not resolving them and not quietly choosing one.

**[C1] Open access vs. customer names and internal priorities.**
The board is meant to be reachable by anyone with the link, and every row carries the customer it came from plus an impact judgement. Customer identities and the team's unfiltered view of what it is and is not prioritising are exactly the material companies keep internal.
- Decision required: does the board stay open to anyone with the link, or does it become limited to a named group? If it stays open, does it name customers at all?

**[C2] No login vs. "each row with an owner".**
"Owner" and "stage" carry accountability. Accountability needs identity - someone you can name, contact and ask. With nothing behind a login, an owner is a free-text word, and any anonymous passer-by can move a row.
- Decision required: is "owner" just a label recorded on the row, or a real accountable person the tool can distinguish?

**[C3] "One screen" vs. "every AI use case".**
Every use case is an ever-growing list. One screen is a deliberately small surface. At twenty rows, one screen is a strength. At two hundred, it is unreadable and the counts stop being something a person can sanity-check.
- Decision required: is this a full backlog, or a bounded board of active items with everything else filtered out? These produce different products.

**[C4] A single stage vs. parallel reality.**
Idea → Scored → Building → Live is a straight line. Real work is not: a use case can be scored and then sent back, or be half-built while not yet usable, or live for one customer only. A single position cannot hold that, and it quietly loses the history of how it got there.
- Decision required: is stage one fixed position that overwrites the past, or can a use case hold more than one state at once? And is "Scored" a stage or a separate judgement that sits beside the stage?

**[C5] "Counts at the top" vs. "what is stuck".**
The described behaviour is a count per stage. The promised outcome is knowing what is stuck. A count never shows stuck: five rows in "Building" could be five healthy days of work or five abandoned efforts. Stuck is a fact about time, and the idea contains no notion of time.
- Decision required: are the top-line numbers simply counts per stage, or indicators of attention (how long things have sat, what has not moved)? The idea's mechanics deliver the first; the idea's promise needs the second.

**[C6] Everyone can change a stage vs. a founder who trusts the board.**
An open board with open editing means any viewer can alter the numbers the founder relies on. The more open the access, the less the roll-up can be trusted.
- Decision required: can everyone who can see the board also change it, or can most people only look while a few move things?

**[C7] No home for "we are not doing this".**
The four stages assume every use case progresses. In practice some are rejected, parked or superseded, and the board needs to show that or the founder keeps seeing dead ideas counted as active work. The four named stages have no such position.
- Decision required: does a use case get an outcome that is not one of the four stages, and does it leave the board or stay on it as a record?

---

## 3. WHO THIS IS FOR

The humans who will actually open this, and what each is trying to get done. All five are assumed roles unless and until the client says otherwise. `[A13]`

**1. The founder / the person who asked for this**
- Trying to get done: answer "what is live?" and "what is stuck?" in seconds without chasing anyone, and feel confident the portfolio is moving.
- What good looks like: opens the link, understands the state of play without scrolling or asking a question.
- What makes it fail for them: numbers that are stale, or a board that is only half-filled, so they cannot trust it and go back to asking people directly.

**2. The product lead / the person who owns AI delivery**
- Trying to get done: keep one honest list, defend the order, and move things along without becoming the team's reminder service.
- What good looks like: can add a use case and move it in seconds, and the top numbers stay correct automatically.
- What makes it fail for them: having to keep a second list somewhere else because the board cannot hold the detail they need.

**3. The engineer or team lead who will build**
- Trying to get done: see what is decided and what is next, so they are not re-litigating priorities every week.
- What good looks like: the board is the agreed answer to "what should I be working on".
- What makes it fail for them: stages that change without explanation, or a "Building" column that does not match what they are actually doing.

**4. The person closest to customers (sales, customer success, support)**
- Trying to get done: make sure a request a customer made is not lost, and be able to point at it later.
- What good looks like: they can see their customer's use case on the board and where it stands.
- What makes it fail for them: rows that do not say which customer asked, so their request disappears into an anonymous list. `[A14]`

**5. The wider team / observers**
- Trying to get done: know what is happening with AI without attending a meeting.
- What good looks like: the board is the single place to look.
- What makes it fail for them: not knowing what a column means. `[A15]`

---

## 4. SCOPE, LOCKED

In scope, as described:

1. **A single board**, shown as one screen, that is the whole product surface. `[A3]`
2. **One row per AI use case**, covering every use case the team wants on the board. `[A1]`
3. **Four fields per row:** the use case itself, its owner, the customer it came from, and its impact. `[A16]`
4. **A stage per row**, moving through exactly these four positions: Idea, Scored, Building, Live. `[A8]`
5. **Stage changes made directly on the board**, as the main interaction.
6. **A live count per stage at the top of the screen**, recalculated when a stage changes.
7. **Direct opening with no account step** - the link opens on the board, nothing behind a login. `[A12]`
8. **All rows visible together** on that one screen.

Explicitly in scope because the phrasing demands it: the founder being able to tell, from this screen, what is live and what is stuck. `[A10]`

---

## 5. NOT BUILDING, AND WHY

This is the readback list. Each exclusion has a reason tied to the idea above.

- **A scoring or ranking engine.** "Scored" is named as a stage, not as a method. The idea says a use case can be marked as scored; it does not say the board decides the score. If the client wants the board to compute priority, that is a scope change, not a detail.
- **Detail pages or drill-down per use case.** Excluded by "one screen". If a use case needs a full document, notes or attachments, that lives outside this board. `[A17]`
- **Discussion, comments or activity history on a row.** Not described. It would also need identity (C2).
- **Notifications, reminders or chasing.** Tempting because of "what is stuck", but the idea only says the founder *sees* stuck items, not that the board acts on them. Acting on them is a different product and depends on C5.
- **Trends over time** (velocity, how long things sit, burn-down). The idea is a current-state board with counts; it has no notion of time. Trends are exactly what would make "stuck" measurable, so this is a candidate later, not now - and it depends on C5. `[A18]`
- **Access control, roles and permissions.** Excluded because the brief explicitly says nothing behind a login. If C1, C2 or C6 are decided the other way, this moves from "not building" to "required before launch".
- **A record of who changed a stage and when.** Removed by the no-login decision. This is the cost of C2 and C6; it cannot be added later without changing that decision.
- **Automatic import from other tools or lists.** Not described. The board assumes people put use cases in. `[A19]`
- **Search, filtering, grouping or sorting.** One screen with all rows is the stated design; filters imply a list too big for one screen, which is C3.
- **Multiple boards** (per team, per quarter, per business unit). "One screen holding every AI use case" describes one board. `[A20]`
- **A separate mobile experience.** Not described. One screen is the requirement; how it renders on a small screen is an open dependency, not a feature. `[A21]`
- **Any form of automatic decision-making about the use cases.** The board records human judgements; it does not make them.

---

## 6. PHASING

**Ships first (the thing that proves the idea):**
- The single board with all rows visible.
- The four row fields and the four stages.
- Stage change as the primary interaction, with the top counts updating immediately.
- Direct open, no account step.

This is the smallest version that lets the founder answer "what is live?" - and it is testable the day it lands. It does not yet answer "what is stuck" honestly (C5).

**Waits (cannot be built correctly until a decision lands):**
- Anything that makes "stuck" real - a time-based signal or an attention flag. Waits on C5.
- A home for rejected or parked use cases. Waits on C7.
- Ownership as a verified person rather than a label. Waits on C2.
- Any limitation on who can view or edit. Waits on C1 and C6.
- Historical views and trends. Waits on C5 and on the board proving it is used at all.
- Handling a board too large for one screen. Waits on C3.

---

## 7. SUCCESS METRICS

Numbers to agree before build. There is no baseline today, so the first job is to measure the current state for two weeks and then set targets against it. `[A22]`

1. **Time to answer "what is live and what is stuck?"** - the founder reaches a confident answer in under 60 seconds, ideally under 10, without asking anyone. Measured by observation, not by asking.
2. **Coverage of active use cases** - at least 90% of the AI use cases the team is actively considering appear on the board within one month of launch. Measured by comparing against what people mention in conversation.
3. **Freshness** - no active row goes untouched for more than 14 days without being flagged. This is the seed of "stuck" and can be tracked even before C5 is decided. `[A23]`
4. **Movement** - at least 3 stage changes per week across the team in the first month. A board nobody moves is a report, not a tool.
5. **Self-service use** - the product lead and engineers add and move use cases themselves, without the founder prompting them, within the first month. Measured by who performs the changes.
6. **Trust** - at the end of month one, the founder confirms they would use this instead of asking people for status. This is a yes/no, and it is the real verdict.
7. **No double bookkeeping** - the team is not maintaining a second list of the same use cases alongside this board. If a second list exists, this board has failed its main promise.

---

## 8. OPEN DEPENDENCIES

What I am waiting on from someone else before the board can be called correct:

1. **The actual list.** The real set of AI use cases the team is considering, however messy. Without it we cannot judge whether "one screen" is realistic (C3).
2. **A definition of "impact".** What unit, and who decides it. Without this the column is not usable by a stranger. `[A7]`
3. **A definition of "Scored".** Is it a stage or a judgement, and what has to be true to enter it. `[A8]`, C4.
4. **A definition of "stuck".** Time-based or a manual flag. `[A24]`, C5.
5. **A decision on access.** Open link vs. named group, and whether customers are named on rows. C1, C2, C6, C7. Nothing in section 5 about permissions can move until this lands.
6. **The customer naming policy.** Whether customers may be named, or must be referred to generically, and whether anyone has to consent. `[A6]`
7. **The owners.** Who they are, whether they have agreed to own a row, and whether they will keep it current. `[A4]`
8. **The single-source-of-truth agreement.** If a list already exists elsewhere, the client has to say that the board wins, or the board will be a copy. `[A25]`
9. **The founder's definition of "Live".** Released to all customers, released to one, or something else. `[A26]`
10. **A named person to maintain the board** for the first month, and an agreement that the board will be reviewed on a fixed rhythm. Tool or no tool, someone has to keep it honest. `[A2]`
11. **How the board is opened on a phone**, if the founder will check it between meetings. Not a feature decision here, but it affects whether the one-screen promise survives. `[A21]`

---

## ASSUMPTIONS A REAL CLIENT WOULD HAVE TOLD US

Every item below is something I had to supply myself. Each one should be confirmed or corrected by the client before this PRD is treated as the brief.

- **[A1]** "Every AI use case the team is considering" means a single, complete, authoritative list, not a curated shortlist.
- **[A2]** Someone on the team will be responsible for gathering and maintaining the list; the tool will not fill itself.
- **[A3]** The board is the entire product - no navigation, no drill-down, no other pages.
- **[A4]** "Owner" means a real, named, accountable person who has accepted ownership.
- **[A5]** The team expects to be able to defend prioritisation by pointing to which customer asked.
- **[A6]** The team currently records which customer asked, or is willing to start, and is permitted to store customer names in a board reachable by anyone with the link.
- **[A7]** "Impact" has, or will have, a single agreed definition; it is not just a free-text note.
- **[A8]** The four named stages are the complete lifecycle, in that order, with one position per use case.
- **[A9]** The counts at the top are per stage and are derived only from the rows on the board.
- **[A10]** "Live" means a use case is shipped and in use; "stuck" means a use case has stopped moving.
- **[A11]** Users will arrive from a shared link with no training, and the board must explain itself.
- **[A12]** "Nothing behind a login" means genuinely open to anyone with the link, with no identity and no restrictions - not merely "no signup friction for people who already have access".
- **[A13]** The five roles in section 3 exist; in a smaller team several may be the same person.
- **[A14]** People close to customers will use the board directly rather than going through the product lead.
- **[A15]** Observers outside the core team will be given the link and expected to self-serve.
- **[A16]** The four row fields (use case, owner, source customer, impact) are the complete set of information per row; nothing else needs to be shown.
- **[A17]** Detailed write-ups of individual use cases live outside this board and are not expected here.
- **[A18]** Understanding trends over time is not needed at launch.
- **[A19]** Use cases will be entered by hand; nothing needs to be pulled in from another list or tool automatically.
- **[A20]** One board for the whole company is enough; no per-team or per-quarter separation is needed.
- **[A21]** The primary use is on a full-size screen, and phone use is not a launch requirement.
- **[A22]** No reliable baseline of the current process exists, so it must be measured before targets are fixed.
- **[A23]** 14 days is a reasonable starting threshold for "untouched", to be adjusted once real behaviour is seen.
- **[A24]** "Stuck" will be defined as elapsed time in a stage, rather than a person manually flagging a row.
- **[A25]** This board is intended to become the single source of truth, replacing any existing list rather than sitting beside it.
- **[A26]** "Live" means released to all relevant customers, not to a single early customer.

---

*DRAFT - not agreed with the client. Contradictions C1-C7 and assumptions A1-A26 are open and must be closed before build.*
