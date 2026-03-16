=-- ============================================================
-- VidCrews v2 — Full Schema
-- Run this in Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────
create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  username        text unique not null,
  full_name       text,
  avatar_url      text,
  user_type       text not null default 'creative' check (user_type in ('creative','client')),
  role            text,
  bio             text,
  city            text,
  country         text default 'Ghana',
  day_rate        numeric(10,2),
  currency        text default 'GHS' check (currency in ('GHS','USD','NGN','KES','ZAR')),
  availability    text default 'available' check (availability in ('available','soon','busy')),
  recovery_email  text,
  calendly_url    text,
  is_admin        boolean default false,
  status          text default 'pending' check (status in ('pending','active','flagged','banned')),
  points          integer default 0,
  -- verification: true when profile is complete
  is_verified     boolean generated always as (
    full_name is not null and
    role is not null and
    bio is not null and
    city is not null and
    day_rate is not null and
    avatar_url is not null
  ) stored,
  initials        text generated always as (
    upper(left(coalesce(full_name, username), 1)) ||
    coalesce(upper(split_part(coalesce(full_name,''), ' ', 2)), '')
  ) stored
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- ── EQUIPMENT ─────────────────────────────────────────────
create table public.equipment (
  id          bigserial primary key,
  profile_id  uuid references public.profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz default now()
);

-- ── EARNINGS ──────────────────────────────────────────────
create table public.earnings (
  id            bigserial primary key,
  profile_id    uuid references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  client_name   text not null,
  booking_date  date not null default current_date,
  day_rate      numeric(10,2) not null,
  amount_paid   numeric(10,2) not null,
  currency      text default 'GHS',
  note          text
);

-- ── REVIEWS ───────────────────────────────────────────────
create table public.reviews (
  id            bigserial primary key,
  created_at    timestamptz default now(),
  creative_id   uuid references public.profiles(id) on delete cascade,
  reviewer_id   uuid references public.profiles(id) on delete cascade,
  rating        integer not null check (rating between 1 and 5),
  comment       text,
  unique(creative_id, reviewer_id)
);

-- ── REPORTS ───────────────────────────────────────────────
create table public.reports (
  id            bigserial primary key,
  created_at    timestamptz default now(),
  reporter_id   uuid references public.profiles(id) on delete cascade,
  reported_id   uuid references public.profiles(id) on delete cascade,
  reason        text not null,
  details       text,
  status        text default 'pending' check (status in ('pending','reviewed','dismissed'))
);

-- ── SHORTLISTS ────────────────────────────────────────────
create table public.shortlists (
  id          bigserial primary key,
  profile_id  uuid references public.profiles(id) on delete cascade,
  saved_id    uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(profile_id, saved_id)
);

-- ── MESSAGES ──────────────────────────────────────────────
create table public.messages (
  id          bigserial primary key,
  created_at  timestamptz default now(),
  sender_id   uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  body        text not null,
  read        boolean default false
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles   enable row level security;
alter table public.equipment  enable row level security;
alter table public.earnings   enable row level security;
alter table public.reviews    enable row level security;
alter table public.reports    enable row level security;
alter table public.shortlists enable row level security;
alter table public.messages   enable row level security;

-- PROFILES
create policy "public_read_active" on public.profiles for select using (status = 'active');
create policy "insert_own" on public.profiles for insert with check (id = auth.uid());
create policy "update_own" on public.profiles for update using (id = auth.uid());
create policy "admin_all" on public.profiles for all
  using ((select is_admin from public.profiles where id = auth.uid()) = true);

-- EQUIPMENT
create policy "public_read_equipment" on public.equipment for select using (true);
create policy "own_equipment" on public.equipment for all using (profile_id = auth.uid());

-- EARNINGS (private)
create policy "own_earnings" on public.earnings for all using (profile_id = auth.uid());

-- REVIEWS
create policy "public_read_reviews" on public.reviews for select using (true);
create policy "insert_review" on public.reviews for insert with check (reviewer_id = auth.uid());
create policy "own_review" on public.reviews for delete using (reviewer_id = auth.uid());

-- REPORTS
create policy "insert_report" on public.reports for insert with check (reporter_id = auth.uid());
create policy "own_report" on public.reports for select using (reporter_id = auth.uid());
create policy "admin_reports" on public.reports for all
  using ((select is_admin from public.profiles where id = auth.uid()) = true);

-- SHORTLISTS
create policy "own_shortlist" on public.shortlists for all using (profile_id = auth.uid());

-- MESSAGES
create policy "own_messages" on public.messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "send_message" on public.messages for insert with check (sender_id = auth.uid());

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, full_name, user_type, role, city, country, currency, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'user_type', 'creative'),
    coalesce(new.raw_user_meta_data->>'role', null),
    coalesce(new.raw_user_meta_data->>'city', null),
    coalesce(new.raw_user_meta_data->>'country', 'Ghana'),
    coalesce(new.raw_user_meta_data->>'currency', 'GHS'),
    'active'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ADD POINTS AFTER REVIEW
-- ============================================================
create or replace function public.add_points_on_review()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set points = points + 10 where id = new.creative_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute function public.add_points_on_review();

-- ============================================================
-- MAKE YOURSELF ADMIN (run after signing up)
-- update public.profiles set is_admin = true where username = 'your_username';
-- ===========================================================
