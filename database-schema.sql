-- ==============================================================
-- LOMBOK TECH HUB  ·  Database Schema  (PostgreSQL / Supabase)
-- ==============================================================
-- How to use: copy-paste into Supabase SQL Editor and run.
-- All tables include `created_at` so you can sort by "newest".
-- ==============================================================

-- ===== 1. PROFILES (extends Supabase Auth) =====
-- Every user who signs up via email/Google gets a row here.
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  avatar_url  text,
  bio         text,
  interest    text,            -- e.g. "Web Dev", "AI", "Mobile"
  level       text,            -- "Pemula" / "Menengah" / "Mahir"
  github      text,
  linkedin    text,
  whatsapp    text,
  is_public   boolean default true,
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

-- automatically create a profile row when someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===== 2. EVENTS =====
create table events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null,
  event_type    text not null default 'meetup',   -- meetup | workshop | hackathon | social
  location      text not null,                     -- online link or physical address
  start_at      timestamptz not null,
  end_at        timestamptz,
  max_attendees integer,
  poster_url    text,
  published     boolean default false,             -- draft vs published
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
);

-- ===== 3. RSVPs (who is coming to which event) =====
create table rsvps (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references events(id) on delete cascade,
  profile_id  uuid references profiles(id) on delete cascade,
  status      text not null default 'going',       -- going | maybe | not_going
  created_at  timestamptz default now(),
  unique(event_id, profile_id)                     -- one RSVP per person per event
);

-- ===== 4. ACTIVITIES (the cards on the homepage) =====
create table activities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  icon        text default '💻',                    -- emoji icon
  sort_order  integer default 0,                    -- drag-to-reorder
  published   boolean default true,
  created_at  timestamptz default now()
);

-- ===== 5. POSTS (blog / announcements) =====
create table posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,                 -- URL-friendly: "mini-hackathon-recap"
  content     text not null,                        -- markdown or plain text
  excerpt     text,                                 -- short preview for cards
  cover_url   text,
  author_id   uuid references profiles(id),
  published   boolean default false,
  published_at timestamptz,
  created_at  timestamptz default now()
);

-- ===== 6. JOIN REQUESTS (from the "Gabung" form) =====
create table join_requests (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  interest    text,
  level       text,
  message     text,
  status      text default 'pending',              -- pending | contacted | approved | rejected
  created_at  timestamptz default now()
);

-- ===== 7. GALLERY (photo documentation of events) =====
create table gallery (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references events(id) on delete set null,
  image_url   text not null,
  caption     text,
  uploaded_by uuid references profiles(id),
  created_at  timestamptz default now()
);

-- ==============================================================
-- INDEXES  (keep queries fast as the community grows)
-- ==============================================================
create index idx_events_start     on events(start_at);
create index idx_events_published on events(published) where published = true;
create index idx_rsvps_event      on rsvps(event_id);
create index idx_posts_slug       on posts(slug);
create index idx_posts_published  on posts(published) where published = true;

-- ==============================================================
-- ROW-LEVEL SECURITY (basic rules for a community site)
-- ==============================================================
-- Supabase RLS: anyone can read published data; only authenticated users can write.

alter table events enable row level security;
alter table rsvps  enable row level security;
alter table posts  enable row level security;
alter table join_requests enable row level security;

-- Public read, authenticated insert / admin edit
create policy "Everyone can read published events"
  on events for select using (published = true);

create policy "Authenticated users can RSVP"
  on rsvps for insert with check (auth.role() = 'authenticated');

create policy "Anyone can submit a join request"
  on join_requests for insert with check (true);

-- ==============================================================
-- SAMPLE DATA  (remove these insert lines in production)
-- ==============================================================
-- insert into events (title, description, event_type, location, start_at, max_attendees, published)
-- values
--   ('Intro to Tailwind CSS', 'Hands-on workshop: build a landing page from scratch.', 'workshop', 'Online', '2026-06-28 15:00+08', 30, true),
--   ('Open Source Night', 'Bring your laptop and make your first PR.', 'meetup', 'Co-working Mataram', '2026-07-12 18:00+08', 25, true);
