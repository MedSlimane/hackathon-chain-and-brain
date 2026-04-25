-- AgriConnect Smart schema
-- Apply first, then supabase/policies.sql.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('farmer', 'industry', 'health_actor', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.listing_status as enum ('available', 'reserved', 'sold', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.transaction_status as enum ('pending', 'accepted', 'in_delivery', 'delivered', 'completed', 'cancelled', 'disputed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_severity as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  organization_name text,
  phone text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.biomass_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  biomass_type text not null,
  description text,
  quantity_kg numeric not null check (quantity_kg > 0),
  price_per_kg numeric not null check (price_per_kg >= 0),
  predicted_price_per_kg numeric,
  location text not null,
  latitude numeric,
  longitude numeric,
  image_url text,
  quality_score integer check (quality_score between 0 and 100),
  moisture_level numeric,
  status public.listing_status default 'available',
  carbon_saved_kg numeric default 0,
  health_risk_reduction_score integer default 0,
  blockchain_batch_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.biomass_transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.biomass_listings(id) on delete cascade,
  farmer_id uuid not null references public.profiles(id),
  industry_id uuid not null references public.profiles(id),
  quantity_kg numeric not null check (quantity_kg > 0),
  agreed_price_per_kg numeric not null check (agreed_price_per_kg >= 0),
  total_price numeric generated always as (quantity_kg * agreed_price_per_kg) stored,
  status public.transaction_status default 'pending',
  delivery_location text,
  delivery_date date,
  smart_contract_hash text,
  blockchain_transaction_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.pollution_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  region text not null,
  pollution_level integer not null check (pollution_level between 0 and 100),
  burned_waste_estimate_kg numeric default 0,
  respiratory_risk_score integer check (respiratory_risk_score between 0 and 100),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.health_indicators (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  respiratory_cases integer default 0,
  vulnerable_population_estimate integer default 0,
  air_quality_score integer check (air_quality_score between 0 and 100),
  risk_score integer check (risk_score between 0 and 100),
  created_at timestamptz default now()
);

create table if not exists public.security_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  severity public.alert_severity default 'low',
  ip_address text,
  user_agent text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.blockchain_records (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  hash text not null,
  previous_hash text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.ai_predictions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  prediction_type text not null,
  input jsonb not null,
  output jsonb not null,
  confidence numeric default 0,
  created_at timestamptz default now()
);

create index if not exists biomass_listings_status_idx on public.biomass_listings(status);
create index if not exists biomass_listings_farmer_idx on public.biomass_listings(farmer_id);
create index if not exists biomass_transactions_farmer_idx on public.biomass_transactions(farmer_id);
create index if not exists biomass_transactions_industry_idx on public.biomass_transactions(industry_id);
create index if not exists security_logs_severity_idx on public.security_logs(severity);
create index if not exists blockchain_records_entity_idx on public.blockchain_records(entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_biomass_listings_updated_at on public.biomass_listings;
create trigger set_biomass_listings_updated_at
before update on public.biomass_listings
for each row execute function public.set_updated_at();

drop trigger if exists set_biomass_transactions_updated_at on public.biomass_transactions;
create trigger set_biomass_transactions_updated_at
before update on public.biomass_transactions
for each row execute function public.set_updated_at();
