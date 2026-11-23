-- StudyMate AI — Supabase (PostgreSQL) schema
-- Supabase Dashboard → SQL Editor дээр бүтнээр нь ажиллуулна.

-- 1. PROFILES — auth.users-тэй 1:1 холбоотой
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text,
  created_at  timestamptz not null default now()
);

-- 2. SUBJECTS — оюутны хичээлүүд
create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name        text not null check (char_length(name) >= 2),
  instructor  text default '',
  color       text not null default '#4F46E5',
  created_at  timestamptz not null default now()
);

-- 3. TASKS — даалгавар ба хугацаа
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade default auth.uid(),
  subject_id    uuid references public.subjects (id) on delete set null,
  title         text not null check (char_length(title) >= 3),
  description   text default '',
  due_at        timestamptz not null,
  priority      text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  is_completed  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- 4. QUIZ_ATTEMPTS — quiz-ийн үр дүн
create table if not exists public.quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade default auth.uid(),
  quiz_title       text not null,
  score            int not null check (score >= 0),
  total_questions  int not null check (total_questions > 0),
  completed_at     timestamptz not null default now(),
  check (score <= total_questions)
);

-- 5. STUDY_SESSIONS — суралцсан хугацааны бүртгэл (Pomodoro)
create table if not exists public.study_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade default auth.uid(),
  subject_id        uuid references public.subjects (id) on delete set null,
  duration_minutes  int not null check (duration_minutes > 0),
  studied_at        timestamptz not null default now()
);

-- Индексүүд (хэрэглэгчээр шүүх query-г хурдасгана)
create index if not exists tasks_user_due_idx       on public.tasks (user_id, due_at);
create index if not exists subjects_user_idx        on public.subjects (user_id);
create index if not exists quiz_attempts_user_idx   on public.quiz_attempts (user_id, completed_at desc);
create index if not exists study_sessions_user_idx  on public.study_sessions (user_id, studied_at);

-- ============ ROW LEVEL SECURITY ============
-- Хэрэглэгч зөвхөн өөрийн өгөгдлийг харах/засах эрхтэй.
alter table public.profiles        enable row level security;
alter table public.subjects        enable row level security;
alter table public.tasks           enable row level security;
alter table public.quiz_attempts   enable row level security;
alter table public.study_sessions  enable row level security;

create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "subjects: own rows" on public.subjects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks: own rows" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "quiz_attempts: own rows" on public.quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_sessions: own rows" on public.study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Шинэ хэрэглэгч бүртгүүлэхэд profile автоматаар үүсгэх trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
