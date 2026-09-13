-- ============================================================
-- AI Use Case Backlog Board - Supabase setup
-- Run both blocks in the Supabase SQL editor, in order.
-- Project: https://ikghrcexkoeireoeglmz.supabase.co
-- ============================================================


-- ---------- BLOCK 1: table + Row Level Security ----------

create table if not exists public.use_cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  owner text not null,
  customer text,
  impact text,
  stage text not null default 'Idea'
    check (stage in ('Idea', 'Scored', 'Building', 'Live')),
  stage_changed_at timestamptz not null default now()
);

alter table public.use_cases enable row level security;

grant select, insert, update, delete on public.use_cases to anon, authenticated;

drop policy if exists "use_cases select anyone" on public.use_cases;
drop policy if exists "use_cases insert anyone" on public.use_cases;
drop policy if exists "use_cases update anyone" on public.use_cases;
drop policy if exists "use_cases delete anyone" on public.use_cases;

create policy "use_cases select anyone"
  on public.use_cases for select
  to anon, authenticated
  using (true);

create policy "use_cases insert anyone"
  on public.use_cases for insert
  to anon, authenticated
  with check (true);

create policy "use_cases update anyone"
  on public.use_cases for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "use_cases delete anyone"
  on public.use_cases for delete
  to anon, authenticated
  using (true);


-- ---------- BLOCK 2: realistic demo data (FirstCut AI niche) ----------

insert into public.use_cases (title, owner, customer, impact, stage, stage_changed_at) values
  ('Auto-triage inbound support tickets', 'Priya Nair', 'Fintrail (payments, Series A)', 'Cuts first-response time; ~12 hrs/week saved', 'Building', now() - interval '5 days'),
  ('Summarise customer calls into the CRM', 'Arjun Menon', 'Northwind Logistics', 'Reps stop writing call notes; ~6 hrs/week saved', 'Scored', now() - interval '9 days'),
  ('Onboarding copilot for setup questions', 'Sneha Kulkarni', 'Zeta Retail', 'Fewer "how do I start" tickets in week one', 'Idea', now() - interval '2 days'),
  ('Churn-risk scoring from usage signals', 'Rahul Iyer', 'Origami Health', 'Find at-risk accounts 30 days earlier', 'Scored', now() - interval '23 days'),
  ('AI-drafted release notes from merged PRs', 'Vikram Shetty', 'Internal', 'Saves the release ritual; ~3 hrs per release', 'Live', now() - interval '40 days'),
  ('Semantic search across the help centre', 'Priya Nair', 'Bluepeak SaaS', 'Deflects repeat questions without exact keyword luck', 'Live', now() - interval '31 days'),
  ('Invoice data extraction from PDFs', 'Farhan Qureshi', 'Ledgerly', 'Removes manual entry for ~2,000 invoices/month', 'Building', now() - interval '11 days'),
  ('Duplicate-account detection at signup', 'Arjun Menon', 'Internal', 'Stops double-trial abuse', 'Idea', now() - interval '1 day'),
  ('Sales-call objection summariser', 'Nikhil Rao', 'Sundial Foods', 'Gives AEs a one-line objection history before the next call', 'Idea', now() - interval '19 days'),
  ('Auto-categorise expenses for finance', 'Sneha Kulkarni', 'Ledgerly', 'Cuts month-end coding from days to hours', 'Scored', now() - interval '6 days'),
  ('Support reply drafting with citations', 'Vikram Shetty', 'Fintrail (payments, Series A)', 'Faster replies, every claim linked to a help doc', 'Building', now() - interval '8 days'),
  ('Meeting notes to action items', 'Rahul Iyer', 'Internal', 'No more lost follow-ups after customer calls', 'Live', now() - interval '27 days'),
  ('Usage-based upsell recommendations', 'Nikhil Rao', 'Bluepeak SaaS', 'Surface expansion moments to CS before renewal', 'Idea', now() - interval '16 days'),
  ('Deflection chatbot for pricing questions', 'Farhan Qureshi', 'Origami Health', 'Answers pricing without a sales call', 'Scored', now() - interval '4 days');
