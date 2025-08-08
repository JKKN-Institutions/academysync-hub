-- Create news_feed table for application posts
create table if not exists public.news_feed (
  id uuid primary key default gen_random_uuid(),
  author_id uuid,
  title text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.news_feed enable row level security;

-- Keep updated_at in sync
drop trigger if exists update_news_feed_updated_at on public.news_feed;
create trigger update_news_feed_updated_at
before update on public.news_feed
for each row execute function public.update_updated_at_column();

-- Policies per request
drop policy if exists "Only permanent users can post to the news feed" on public.news_feed;
create policy "Only permanent users can post to the news feed"
on public.news_feed as restrictive for insert
to authenticated
with check (((auth.jwt()->>'is_anonymous')::boolean is not true));

drop policy if exists "Anonymous and permanent users can view the news feed" on public.news_feed;
create policy "Anonymous and permanent users can view the news feed"
on public.news_feed for select
to authenticated
using (true);
