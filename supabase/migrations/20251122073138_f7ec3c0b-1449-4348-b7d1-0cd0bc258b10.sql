-- Create withdrawal requests table
create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  upi_id text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  transaction_id text,
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.withdrawal_requests enable row level security;

-- Users can view their own withdrawal requests
create policy "Users can view their own withdrawal requests"
  on public.withdrawal_requests
  for select
  using (auth.uid() = user_id);

-- Users can create their own withdrawal requests
create policy "Users can create withdrawal requests"
  on public.withdrawal_requests
  for insert
  with check (auth.uid() = user_id);

-- Admins can view all withdrawal requests
create policy "Admins can view all withdrawal requests"
  on public.withdrawal_requests
  for select
  using (has_role(auth.uid(), 'admin'));

-- Admins can update withdrawal requests
create policy "Admins can update withdrawal requests"
  on public.withdrawal_requests
  for update
  using (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
create trigger update_withdrawal_requests_updated_at
  before update on public.withdrawal_requests
  for each row
  execute function public.update_updated_at_column();

-- Create tournaments table
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  game_type text not null check (game_type in ('FF', 'BGMI')),
  mode text not null,
  prize_pool numeric not null,
  entry_fee numeric not null default 0,
  total_slots integer not null,
  filled_slots integer not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  scheduled_at timestamp with time zone not null,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.tournaments enable row level security;

-- Everyone can view tournaments
create policy "Anyone can view tournaments"
  on public.tournaments
  for select
  using (true);

-- Admins can manage tournaments
create policy "Admins can manage tournaments"
  on public.tournaments
  for all
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- Create tournament participants table
create table public.tournament_participants (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamp with time zone default now(),
  unique(tournament_id, user_id)
);

-- Enable RLS
alter table public.tournament_participants enable row level security;

-- Users can view participants
create policy "Anyone can view tournament participants"
  on public.tournament_participants
  for select
  using (true);

-- Users can join tournaments
create policy "Users can join tournaments"
  on public.tournament_participants
  for insert
  with check (auth.uid() = user_id);

-- Admins can manage participants
create policy "Admins can manage participants"
  on public.tournament_participants
  for all
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- Add trigger for tournaments updated_at
create trigger update_tournaments_updated_at
  before update on public.tournaments
  for each row
  execute function public.update_updated_at_column();