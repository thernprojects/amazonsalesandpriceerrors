-- Run this in your Supabase SQL editor (or any Postgres instance).

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  source text not null check (source in ('amazon', 'manual', 'twitter_queue')),
  source_ref text,                  -- ASIN, tweet URL, etc.
  original_price numeric(10, 2),
  sale_price numeric(10, 2) not null,
  discount_pct numeric(5, 2),       -- computed, kept in sync on insert/update
  affiliate_url text not null,      -- your tag already applied, ready to click
  category text,
  status text not null default 'live' check (status in ('live', 'expired', 'pending_review')),
  posted_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists deals_status_posted_idx on deals (status, posted_at desc);
create index if not exists deals_discount_idx on deals (discount_pct desc);
create index if not exists deals_price_idx on deals (sale_price);

-- Pending-review rows are for the Twitter submission queue (see brief notes in README):
-- you approve a row by flipping status from 'pending_review' to 'live', which is what
-- triggers the Discord webhook post.
