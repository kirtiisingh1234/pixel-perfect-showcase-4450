create type public.app_role as enum ('admin','student');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  college text,
  course text,
  year text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.students to authenticated;
grant all on public.students to service_role;
alter table public.students enable row level security;
create policy "students read own or admin" on public.students for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "students update own or admin" on public.students for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin delete students" on public.students for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  category text not null,
  proficiency text not null check (proficiency in ('Beginner','Intermediate','Advanced','Expert')),
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  organization text not null,
  issue_date date,
  credential_id text,
  url text,
  created_at timestamptz not null default now()
);
create table public.internships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  company text not null,
  role text not null,
  start_date date,
  end_date date,
  internship_type text not null default 'Remote',
  status text not null default 'Ongoing',
  description text,
  created_at timestamptz not null default now()
);
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  company text not null,
  role text not null,
  applied_date date not null default current_date,
  status text not null default 'Applied' check (status in ('Applied','Shortlisted','Interview','Selected','Rejected')),
  notes text,
  created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['skills','certificates','internships','applications'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "read own or admin" on public.%I for select to authenticated using (student_id = auth.uid() or public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "insert own" on public.%I for insert to authenticated with check (student_id = auth.uid())', t);
    execute format('create policy "update own" on public.%I for update to authenticated using (student_id = auth.uid())', t);
    execute format('create policy "delete own or admin" on public.%I for delete to authenticated using (student_id = auth.uid() or public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email = 'admin@skilltrack.edu' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
    return new;
  end if;
  insert into public.students (id, full_name, email, phone, college, course, year)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''), new.email,
    new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'course', new.raw_user_meta_data->>'year');
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "avatar read" on storage.objects for select to authenticated using (bucket_id = 'avatars');
create policy "avatar own upload" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar own update" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);