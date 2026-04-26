-- Supabase SQL Editor で実行してください

-- 投稿テーブル
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text not null,
  content text not null check (char_length(content) <= 280),
  created_at timestamptz default now() not null
);

-- RLS（行レベルセキュリティ）を有効化
alter table public.posts enable row level security;

-- 全員が投稿を読める
create policy "誰でも投稿を読める"
  on public.posts for select
  using (true);

-- ログイン済みユーザーのみ投稿できる
create policy "ログイン済みユーザーのみ投稿できる"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- 自分の投稿のみ削除できる
create policy "自分の投稿のみ削除できる"
  on public.posts for delete
  using (auth.uid() = user_id);

-- リアルタイム機能を有効化
alter publication supabase_realtime add table public.posts;
