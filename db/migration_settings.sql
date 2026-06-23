-- Run this in Supabase SQL Editor (in addition to schema.sql, which you should
-- have already run). This adds a tiny settings table so the admin panel can
-- store Discord webhook URLs and search keywords without touching Vercel.

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into app_settings (key, value) values
  ('discord_webhook_urls', ''),
  ('search_keywords', 'clearance,deal of the day,lightning deal'),
  ('min_saving_percent', '25')
on conflict (key) do nothing;
