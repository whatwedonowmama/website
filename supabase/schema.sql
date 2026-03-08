-- ─────────────────────────────────────────────────────────────────────────────
-- whatwedonowmama — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ── Users (extends Supabase auth.users) ──────────────────────────────────────
create table public.users (
  id                    uuid references auth.users(id) on delete cascade primary key,
  email                 text unique not null,
  first_name            text,
  role                  text not null default 'member' check (role in ('member', 'admin')),
  tier                  text not null default 'free' check (tier in ('free', 'plus')),
  stripe_customer_id    text,
  stripe_subscription_id text,
  subscription_status   text check (subscription_status in ('active', 'trialing', 'canceled', 'past_due', 'incomplete')),
  subscription_ends_at  timestamptz,
  beehiiv_subscriber_id text,
  created_at            timestamptz not null default now(),
  last_login_at         timestamptz
);

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, first_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update last_login_at on sign in
create or replace function public.handle_user_login()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.users set last_login_at = now() where id = new.id;
  return new;
end;
$$;

-- ── Resources ─────────────────────────────────────────────────────────────────
create table public.resources (
  id                 uuid primary key default uuid_generate_v4(),
  slug               text unique not null,
  title              text not null,
  excerpt            text,
  body               text,
  category           text not null check (category in ('sleep','feeding','development','activities','milestones','oc-guides')),
  access_level       text not null default 'free' check (access_level in ('free','plus')),
  status             text not null default 'draft' check (status in ('draft','published')),
  featured           boolean not null default false,
  read_time_minutes  integer default 5,
  hero_image_url     text,
  meta_title         text,
  meta_description   text,
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger resources_updated_at
  before update on public.resources
  for each row execute procedure public.set_updated_at();

-- ── Events (manually entered; scraper output handled as JSON files) ───────────
create table public.events (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  description    text,
  event_date     date not null,
  event_time     text,
  location_name  text,
  city           text,
  price          text default 'Free',
  is_free        boolean not null default true,
  source_url     text,
  is_pinned      boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

-- Users table RLS
alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Admins can read all users"
  on public.users for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Resources table RLS
alter table public.resources enable row level security;

create policy "Anyone can read published free resources"
  on public.resources for select using (
    status = 'published' and access_level = 'free'
  );

create policy "Plus members can read all published resources"
  on public.resources for select using (
    status = 'published' and (
      access_level = 'free'
      or exists (
        select 1 from public.users
        where id = auth.uid() and tier = 'plus'
      )
    )
  );

create policy "Admins can do everything with resources"
  on public.resources for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Events table RLS
alter table public.events enable row level security;

create policy "Anyone can read events"
  on public.events for select using (true);

create policy "Admins can manage events"
  on public.events for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index on public.resources (status, access_level);
create index on public.resources (slug);
create index on public.resources (category);
create index on public.events (event_date);
create index on public.events (is_pinned, event_date);
