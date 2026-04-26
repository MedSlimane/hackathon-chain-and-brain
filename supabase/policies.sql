-- AgriConnect Smart RLS and Storage policies.
-- This keeps service_role keys out of client code and relies on Supabase Auth + RLS.

create schema if not exists app_private;

create or replace function app_private.get_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function app_private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'admin'::public.user_role from public.profiles where id = auth.uid()), false);
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.get_user_role() to authenticated;
grant execute on function app_private.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.biomass_listings enable row level security;
alter table public.biomass_transactions enable row level security;
alter table public.pollution_reports enable row level security;
alter table public.health_indicators enable row level security;
alter table public.security_logs enable row level security;
alter table public.blockchain_records enable row level security;
alter table public.ai_predictions enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or app_private.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using (id = auth.uid() or app_private.is_admin())
with check (id = auth.uid() or app_private.is_admin());

drop policy if exists "listings_read_available_or_owned_or_admin" on public.biomass_listings;
create policy "listings_read_available_or_owned_or_admin"
on public.biomass_listings for select to authenticated
using (
  status = 'available'::public.listing_status
  or farmer_id = auth.uid()
  or app_private.get_user_role() = 'health_actor'::public.user_role
  or app_private.is_admin()
);

drop policy if exists "listings_insert_own_farmer" on public.biomass_listings;
create policy "listings_insert_own_farmer"
on public.biomass_listings for insert to authenticated
with check (farmer_id = auth.uid() and app_private.get_user_role() = 'farmer'::public.user_role);

drop policy if exists "listings_update_own_farmer_or_admin" on public.biomass_listings;
create policy "listings_update_own_farmer_or_admin"
on public.biomass_listings for update to authenticated
using (farmer_id = auth.uid() or app_private.is_admin())
with check (farmer_id = auth.uid() or app_private.is_admin());

drop policy if exists "listings_admin_delete" on public.biomass_listings;
create policy "listings_admin_delete"
on public.biomass_listings for delete to authenticated
using (app_private.is_admin());

drop policy if exists "transactions_read_involved_or_admin" on public.biomass_transactions;
create policy "transactions_read_involved_or_admin"
on public.biomass_transactions for select to authenticated
using (farmer_id = auth.uid() or industry_id = auth.uid() or app_private.is_admin());

drop policy if exists "transactions_insert_own_industry" on public.biomass_transactions;
create policy "transactions_insert_own_industry"
on public.biomass_transactions for insert to authenticated
with check (industry_id = auth.uid() and app_private.get_user_role() = 'industry'::public.user_role);

drop policy if exists "transactions_update_involved_or_admin" on public.biomass_transactions;
create policy "transactions_update_involved_or_admin"
on public.biomass_transactions for update to authenticated
using (farmer_id = auth.uid() or industry_id = auth.uid() or app_private.is_admin())
with check (farmer_id = auth.uid() or industry_id = auth.uid() or app_private.is_admin());

drop policy if exists "transactions_admin_delete" on public.biomass_transactions;
create policy "transactions_admin_delete"
on public.biomass_transactions for delete to authenticated
using (app_private.is_admin());

drop policy if exists "pollution_reports_select_authenticated" on public.pollution_reports;
create policy "pollution_reports_select_authenticated"
on public.pollution_reports for select to authenticated
using (true);

drop policy if exists "pollution_reports_insert_health_or_admin" on public.pollution_reports;
create policy "pollution_reports_insert_health_or_admin"
on public.pollution_reports for insert to authenticated
with check (app_private.get_user_role() in ('health_actor'::public.user_role, 'admin'::public.user_role));

drop policy if exists "pollution_reports_admin_manage" on public.pollution_reports;
create policy "pollution_reports_admin_manage"
on public.pollution_reports for update to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "health_indicators_select_authenticated" on public.health_indicators;
create policy "health_indicators_select_authenticated"
on public.health_indicators for select to authenticated
using (true);

drop policy if exists "health_indicators_insert_health_or_admin" on public.health_indicators;
create policy "health_indicators_insert_health_or_admin"
on public.health_indicators for insert to authenticated
with check (app_private.get_user_role() in ('health_actor'::public.user_role, 'admin'::public.user_role));

drop policy if exists "health_indicators_admin_update" on public.health_indicators;
create policy "health_indicators_admin_update"
on public.health_indicators for update to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "security_logs_insert_own" on public.security_logs;
create policy "security_logs_insert_own"
on public.security_logs for insert to authenticated
with check (user_id = auth.uid() or user_id is null or app_private.is_admin());

drop policy if exists "security_logs_select_own_or_admin" on public.security_logs;
create policy "security_logs_select_own_or_admin"
on public.security_logs for select to authenticated
using (user_id = auth.uid() or app_private.is_admin());

drop policy if exists "security_logs_admin_manage" on public.security_logs;
create policy "security_logs_admin_manage"
on public.security_logs for all to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "blockchain_records_select_authenticated" on public.blockchain_records;
create policy "blockchain_records_select_authenticated"
on public.blockchain_records for select to authenticated
using (true);

drop policy if exists "blockchain_records_insert_admin_or_actor" on public.blockchain_records;
create policy "blockchain_records_insert_admin_or_actor"
on public.blockchain_records for insert to authenticated
with check (actor_id = auth.uid() or app_private.is_admin());

drop policy if exists "ai_predictions_select_related_or_admin" on public.ai_predictions;
create policy "ai_predictions_select_related_or_admin"
on public.ai_predictions for select to authenticated
using (
  app_private.is_admin()
  or exists (
    select 1 from public.biomass_listings l
    where l.id = entity_id and l.farmer_id = auth.uid()
  )
  or exists (
    select 1 from public.biomass_transactions t
    where t.id = entity_id and (t.farmer_id = auth.uid() or t.industry_id = auth.uid())
  )
);

drop policy if exists "ai_predictions_insert_related" on public.ai_predictions;
create policy "ai_predictions_insert_related"
on public.ai_predictions for insert to authenticated
with check (
  app_private.is_admin()
  or exists (
    select 1 from public.biomass_listings l
    where l.id = entity_id and l.farmer_id = auth.uid()
  )
  or exists (
    select 1 from public.biomass_transactions t
    where t.id = entity_id and (t.farmer_id = auth.uid() or t.industry_id = auth.uid())
  )
);

drop policy if exists "ai_predictions_admin_delete" on public.ai_predictions;
create policy "ai_predictions_admin_delete"
on public.ai_predictions for delete to authenticated
using (app_private.is_admin());

insert into storage.buckets (id, name, public)
values ('biomass-images', 'biomass-images', true)
on conflict (id) do update set public = true;

drop policy if exists "biomass_images_public_read" on storage.objects;
create policy "biomass_images_public_read"
on storage.objects for select to public
using (bucket_id = 'biomass-images');

drop policy if exists "biomass_images_upload_own_folder" on storage.objects;
create policy "biomass_images_upload_own_folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'biomass-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "biomass_images_update_own_folder" on storage.objects;
create policy "biomass_images_update_own_folder"
on storage.objects for update to authenticated
using (
  bucket_id = 'biomass-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'biomass-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "biomass_images_delete_own_folder" on storage.objects;
create policy "biomass_images_delete_own_folder"
on storage.objects for delete to authenticated
using (
  bucket_id = 'biomass-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
