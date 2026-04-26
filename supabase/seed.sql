-- AgriConnect Smart seed data
--
-- IMPORTANT:
-- profiles.id references auth.users(id), so SQL seed data must use real
-- Supabase Auth user IDs. Create these Auth users first in Authentication >
-- Users, then run this file in the SQL editor.
--
-- Demo password used by the app seed script: AgriConnectDemo2026!
-- agriconnect.farmer1@gmail.com   Farmer
-- agriconnect.farmer2@gmail.com   Farmer
-- agriconnect.industry1@gmail.com Industry
-- agriconnect.industry2@gmail.com Industry
-- agriconnect.health@gmail.com    Health actor
-- agriconnect.admin@gmail.com     Admin
--
-- Faster alternative from the project root:
-- SUPABASE_SERVICE_ROLE_KEY=your-service-role-key npm run supabase:seed

drop table if exists pg_temp.seed_users;

create temporary table seed_users as
select
  d.email,
  d.full_name,
  d.role,
  d.organization_name,
  d.phone,
  d.location,
  u.id
from (
  values
    ('agriconnect.farmer1@gmail.com', 'Amira Ben Salah', 'farmer', 'Domaine Sfax Bio', '+216 20 111 111', 'Sfax'),
    ('agriconnect.farmer2@gmail.com', 'Youssef Trabelsi', 'farmer', 'Ferme Nabeul Verte', '+216 21 222 222', 'Nabeul'),
    ('agriconnect.industry1@gmail.com', 'Sana Mejri', 'industry', 'BioHeat Tunisia', '+216 22 333 333', 'Sousse'),
    ('agriconnect.industry2@gmail.com', 'Karim Saidi', 'industry', 'Green Cement Gabes', '+216 23 444 444', 'Gabes'),
    ('agriconnect.health@gmail.com', 'Dr. Lina Haddad', 'health_actor', 'Regional Health Observatory', '+216 24 555 555', 'Kairouan'),
    ('agriconnect.admin@gmail.com', 'Admin AgriConnect', 'admin', 'AgriConnect Smart', '+216 25 666 666', 'Tunis')
) as d(email, full_name, role, organization_name, phone, location)
left join auth.users u on lower(u.email) = lower(d.email);

do $$
declare
  missing_emails text;
begin
  select string_agg(email, ', ' order by email)
  into missing_emails
  from seed_users
  where id is null;

  if missing_emails is not null then
    raise exception
      'Missing demo Auth users: %. Create these users in Supabase Authentication first, or run npm run supabase:seed with SUPABASE_SERVICE_ROLE_KEY.',
      missing_emails;
  end if;
end $$;

insert into public.profiles (id, full_name, role, organization_name, phone, location)
select id, full_name, role::public.user_role, organization_name, phone, location
from seed_users
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  organization_name = excluded.organization_name,
  phone = excluded.phone,
  location = excluded.location;

insert into public.biomass_listings (
  id,
  farmer_id,
  title,
  biomass_type,
  description,
  quantity_kg,
  price_per_kg,
  predicted_price_per_kg,
  location,
  image_url,
  quality_score,
  moisture_level,
  status,
  carbon_saved_kg,
  health_risk_reduction_score,
  blockchain_batch_hash
)
select
  l.id::uuid,
  farmer.id,
  l.title,
  l.biomass_type,
  l.description,
  l.quantity_kg,
  l.price_per_kg,
  l.predicted_price_per_kg,
  l.location,
  l.image_url,
  l.quality_score,
  l.moisture_level,
  l.status::public.listing_status,
  l.carbon_saved_kg,
  l.health_risk_reduction_score,
  l.blockchain_batch_hash
from (
  values
    ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'agriconnect.farmer1@gmail.com', 'Dry olive residues from Sfax harvest', 'Olive residues', 'Sorted olive residues ready for biomass processing.', 18000, 0.43, 0.45, 'Sfax', 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80', 86, 12, 'available', 26100, 71, '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e'),
    ('aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'agriconnect.farmer2@gmail.com', 'Wheat straw bales near Kairouan', 'Wheat straw', 'Compressed bales stored under cover.', 24000, 0.25, 0.26, 'Kairouan', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80', 78, 18, 'available', 30000, 76, '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42'),
    ('aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'agriconnect.farmer1@gmail.com', 'Date palm waste from Tozeur oasis', 'Date palm waste', 'Palm fronds and date processing residues.', 12500, 0.33, 0.32, 'Tozeur', 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80', 72, 24, 'available', 16250, 58, '0x5bbec38b1f31972fc4d728064ab8d6ae36f87cf51daa3a17b996eb2c1f23d30f'),
    ('aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'agriconnect.farmer2@gmail.com', 'Almond shells for industrial boilers', 'Almond shells', 'High-density almond shells with low moisture.', 9000, 0.61, 0.58, 'Nabeul', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80', 88, 10, 'available', 14850, 49, '0xce8ec9bf32c95c927936e36dff3944db4ff540e24187d8976f2141a29cfc1374'),
    ('aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'agriconnect.farmer1@gmail.com', 'Corn stalks after harvest', 'Corn stalks', 'Loose stalks available for collection.', 15000, 0.28, 0.27, 'Sousse', 'https://images.unsplash.com/photo-1533321942807-08e4008b2025?auto=format&fit=crop&w=900&q=80', 65, 28, 'reserved', 18000, 53, '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a'),
    ('aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'agriconnect.farmer2@gmail.com', 'Vegetable waste for biogas', 'Vegetable waste', 'Fresh vegetable residues collected from farms.', 7000, 0.17, 0.18, 'Gabes', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80', 60, 44, 'available', 5600, 35, '0x019c52d29ec07238c3881f78c097d4d83de26f61fa1265ca5ba08121b595dfd8')
) as l(id, farmer_email, title, biomass_type, description, quantity_kg, price_per_kg, predicted_price_per_kg, location, image_url, quality_score, moisture_level, status, carbon_saved_kg, health_risk_reduction_score, blockchain_batch_hash)
join seed_users farmer on farmer.email = l.farmer_email
on conflict (id) do update set
  farmer_id = excluded.farmer_id,
  title = excluded.title,
  biomass_type = excluded.biomass_type,
  description = excluded.description,
  quantity_kg = excluded.quantity_kg,
  price_per_kg = excluded.price_per_kg,
  predicted_price_per_kg = excluded.predicted_price_per_kg,
  location = excluded.location,
  image_url = excluded.image_url,
  quality_score = excluded.quality_score,
  moisture_level = excluded.moisture_level,
  status = excluded.status,
  carbon_saved_kg = excluded.carbon_saved_kg,
  health_risk_reduction_score = excluded.health_risk_reduction_score,
  blockchain_batch_hash = excluded.blockchain_batch_hash;

insert into public.biomass_transactions (
  id,
  listing_id,
  farmer_id,
  industry_id,
  quantity_kg,
  agreed_price_per_kg,
  status,
  delivery_location,
  delivery_date,
  smart_contract_hash,
  blockchain_transaction_hash
)
select
  t.id::uuid,
  t.listing_id::uuid,
  listing.farmer_id,
  industry.id,
  t.quantity_kg,
  t.agreed_price_per_kg,
  t.status::public.transaction_status,
  t.delivery_location,
  t.delivery_date::date,
  t.smart_contract_hash,
  t.blockchain_transaction_hash
from (
  values
    ('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'agriconnect.industry1@gmail.com', 10000, 0.28, 'in_delivery', 'Sousse biomass depot', '2026-05-02', '0xsmart001', '0xf3dd9b1a41302e0108e8c2e3e87d4c553db126a8f60fcd0f57ad6d96a363a21d'),
    ('bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'agriconnect.industry2@gmail.com', 6000, 0.25, 'pending', 'Gabes plant', '2026-05-08', null, '0x9dca32d047432474877d7789dfd13fc5dcbbd4a6aab26121c531b72cc0238efc'),
    ('bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'agriconnect.industry1@gmail.com', 3500, 0.43, 'completed', 'Sousse boiler site', '2026-04-12', '0xsmart003', '0x1c44d12c7229ad994f1bfdad661b55207355540354a8950d08e6d8b1605c90ae')
) as t(id, listing_id, industry_email, quantity_kg, agreed_price_per_kg, status, delivery_location, delivery_date, smart_contract_hash, blockchain_transaction_hash)
join public.biomass_listings listing on listing.id = t.listing_id::uuid
join seed_users industry on industry.email = t.industry_email
on conflict (id) do update set
  listing_id = excluded.listing_id,
  farmer_id = excluded.farmer_id,
  industry_id = excluded.industry_id,
  quantity_kg = excluded.quantity_kg,
  agreed_price_per_kg = excluded.agreed_price_per_kg,
  status = excluded.status,
  delivery_location = excluded.delivery_location,
  delivery_date = excluded.delivery_date,
  smart_contract_hash = excluded.smart_contract_hash,
  blockchain_transaction_hash = excluded.blockchain_transaction_hash;

insert into public.pollution_reports (id, reporter_id, region, pollution_level, burned_waste_estimate_kg, respiratory_risk_score, notes)
select
  r.id::uuid,
  reporter.id,
  r.region,
  r.pollution_level,
  r.burned_waste_estimate_kg,
  r.respiratory_risk_score,
  r.notes
from (
  values
    ('ccccccc1-cccc-4ccc-8ccc-ccccccccccc1', 'Sfax', 72, 18000, 68, 'Seasonal burning reported near peri-urban farms.'),
    ('ccccccc2-cccc-4ccc-8ccc-ccccccccccc2', 'Sousse', 55, 9000, 48, 'Moderate risk.'),
    ('ccccccc3-cccc-4ccc-8ccc-ccccccccccc3', 'Kairouan', 80, 24000, 73, 'High crop residue burning pressure.'),
    ('ccccccc4-cccc-4ccc-8ccc-ccccccccccc4', 'Nabeul', 46, 5000, 39, 'Improving trend.'),
    ('ccccccc5-cccc-4ccc-8ccc-ccccccccccc5', 'Gabes', 64, 13000, 59, 'Industrial corridor watchlist.')
) as r(id, region, pollution_level, burned_waste_estimate_kg, respiratory_risk_score, notes)
cross join seed_users reporter
where reporter.email = 'agriconnect.health@gmail.com'
on conflict (id) do update set
  reporter_id = excluded.reporter_id,
  region = excluded.region,
  pollution_level = excluded.pollution_level,
  burned_waste_estimate_kg = excluded.burned_waste_estimate_kg,
  respiratory_risk_score = excluded.respiratory_risk_score,
  notes = excluded.notes;

insert into public.health_indicators (id, region, respiratory_cases, vulnerable_population_estimate, air_quality_score, risk_score)
select *
from (
  values
    ('ddddddd1-dddd-4ddd-8ddd-ddddddddddd1'::uuid, 'Sfax', 230, 52000, 38, 68),
    ('ddddddd2-dddd-4ddd-8ddd-ddddddddddd2'::uuid, 'Sousse', 140, 36000, 55, 48),
    ('ddddddd3-dddd-4ddd-8ddd-ddddddddddd3'::uuid, 'Kairouan', 260, 61000, 31, 73),
    ('ddddddd4-dddd-4ddd-8ddd-ddddddddddd4'::uuid, 'Nabeul', 98, 28000, 64, 39),
    ('ddddddd5-dddd-4ddd-8ddd-ddddddddddd5'::uuid, 'Gabes', 205, 44000, 42, 59)
) as h(id, region, respiratory_cases, vulnerable_population_estimate, air_quality_score, risk_score)
on conflict (id) do update set
  region = excluded.region,
  respiratory_cases = excluded.respiratory_cases,
  vulnerable_population_estimate = excluded.vulnerable_population_estimate,
  air_quality_score = excluded.air_quality_score,
  risk_score = excluded.risk_score;

insert into public.security_logs (id, user_id, event_type, severity, ip_address, user_agent, details)
select
  s.id::uuid,
  actor.id,
  s.event_type,
  s.severity::public.alert_severity,
  s.ip_address,
  s.user_agent,
  s.details::jsonb
from (
  values
    ('eeeeeee1-eeee-4eee-8eee-eeeeeeeeeee1', 'agriconnect.farmer1@gmail.com', 'listing_created', 'low', '197.0.0.10', 'Demo browser', '{"listing":"Olive residues"}'),
    ('eeeeeee2-eeee-4eee-8eee-eeeeeeeeeee2', 'agriconnect.industry1@gmail.com', 'transaction_created', 'low', '197.0.0.12', 'Demo browser', '{"total":2800}'),
    ('eeeeeee3-eeee-4eee-8eee-eeeeeeeeeee3', 'agriconnect.farmer2@gmail.com', 'suspicious_quantity', 'medium', '197.0.0.13', 'Demo browser', '{"quantity_kg":120000}'),
    ('eeeeeee4-eeee-4eee-8eee-eeeeeeeeeee4', null, 'failed_login_burst', 'high', '41.0.0.20', 'Unknown', '{"attempts":9}'),
    ('eeeeeee5-eeee-4eee-8eee-eeeeeeeeeee5', 'agriconnect.industry2@gmail.com', 'unknown_device', 'medium', '102.0.0.8', 'New device', '{"location":"Gabes"}'),
    ('eeeeeee6-eeee-4eee-8eee-eeeeeeeeeee6', 'agriconnect.health@gmail.com', 'pollution_report_created', 'low', '197.0.0.14', 'Demo browser', '{"region":"Kairouan"}'),
    ('eeeeeee7-eeee-4eee-8eee-eeeeeeeeeee7', 'agriconnect.industry1@gmail.com', 'high_value_transaction', 'high', '197.0.0.15', 'Demo browser', '{"total":52000}'),
    ('eeeeeee8-eeee-4eee-8eee-eeeeeeeeeee8', null, 'unauthorized_access_attempt', 'critical', '185.0.0.4', 'Script', '{"target":"admin_dashboard"}')
) as s(id, actor_email, event_type, severity, ip_address, user_agent, details)
left join seed_users actor on actor.email = s.actor_email
on conflict (id) do update set
  user_id = excluded.user_id,
  event_type = excluded.event_type,
  severity = excluded.severity,
  ip_address = excluded.ip_address,
  user_agent = excluded.user_agent,
  details = excluded.details;

insert into public.blockchain_records (id, entity_type, entity_id, action, actor_id, hash, previous_hash, payload)
select
  b.id::uuid,
  b.entity_type,
  b.entity_id::uuid,
  b.action,
  actor.id,
  b.hash,
  b.previous_hash,
  b.payload::jsonb
from (
  values
    ('fffffff1-ffff-4fff-8fff-fffffffffff1', 'biomass_listing', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'batch_created', 'agriconnect.farmer1@gmail.com', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', null, '{"biomass_type":"Olive residues","quantity_kg":18000}'),
    ('fffffff2-ffff-4fff-8fff-fffffffffff2', 'biomass_listing', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'batch_created', 'agriconnect.farmer2@gmail.com', '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', '{"biomass_type":"Wheat straw","quantity_kg":24000}'),
    ('fffffff3-ffff-4fff-8fff-fffffffffff3', 'biomass_listing', 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'batch_created', 'agriconnect.farmer1@gmail.com', '0x5bbec38b1f31972fc4d728064ab8d6ae36f87cf51daa3a17b996eb2c1f23d30f', '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42', '{"biomass_type":"Date palm waste","quantity_kg":12500}'),
    ('fffffff4-ffff-4fff-8fff-fffffffffff4', 'biomass_listing', 'aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'quality_verified', 'agriconnect.farmer2@gmail.com', '0xce8ec9bf32c95c927936e36dff3944db4ff540e24187d8976f2141a29cfc1374', '0x5bbec38b1f31972fc4d728064ab8d6ae36f87cf51daa3a17b996eb2c1f23d30f', '{"quality_score":88}'),
    ('fffffff5-ffff-4fff-8fff-fffffffffff5', 'biomass_listing', 'aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'batch_created', 'agriconnect.farmer1@gmail.com', '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a', '0xce8ec9bf32c95c927936e36dff3944db4ff540e24187d8976f2141a29cfc1374', '{"biomass_type":"Corn stalks","quantity_kg":15000}'),
    ('fffffff6-ffff-4fff-8fff-fffffffffff6', 'biomass_listing', 'aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'batch_created', 'agriconnect.farmer2@gmail.com', '0x019c52d29ec07238c3881f78c097d4d83de26f61fa1265ca5ba08121b595dfd8', '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a', '{"biomass_type":"Vegetable waste","quantity_kg":7000}'),
    ('fffffff7-ffff-4fff-8fff-fffffffffff7', 'biomass_transaction', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'transaction_created', 'agriconnect.industry1@gmail.com', '0xf3dd9b1a41302e0108e8c2e3e87d4c553db126a8f60fcd0f57ad6d96a363a21d', '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a', '{"total_price":2800}'),
    ('fffffff8-ffff-4fff-8fff-fffffffffff8', 'biomass_transaction', 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'transaction_created', 'agriconnect.industry2@gmail.com', '0x9dca32d047432474877d7789dfd13fc5dcbbd4a6aab26121c531b72cc0238efc', '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42', '{"total_price":1500}'),
    ('fffffff9-ffff-4fff-8fff-fffffffffff9', 'biomass_transaction', 'bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'transaction_created', 'agriconnect.industry1@gmail.com', '0x1c44d12c7229ad994f1bfdad661b55207355540354a8950d08e6d8b1605c90ae', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', '{"total_price":1505}'),
    ('ffffffa0-ffff-4fff-8fff-ffffffffffa0', 'carbon_impact', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'carbon_impact_recorded', 'agriconnect.health@gmail.com', '0xe97ddf3a6e53ea740dd573dbf4690f02bd582f4f245f8ff107d057f5f0a0a7da', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', '{"carbon_saved_kg":26100}')
) as b(id, entity_type, entity_id, action, actor_email, hash, previous_hash, payload)
left join seed_users actor on actor.email = b.actor_email
on conflict (id) do update set
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  action = excluded.action,
  actor_id = excluded.actor_id,
  hash = excluded.hash,
  previous_hash = excluded.previous_hash,
  payload = excluded.payload;

insert into public.ai_predictions (id, entity_type, entity_id, prediction_type, input, output, confidence)
select
  p.id::uuid,
  p.entity_type,
  p.entity_id::uuid,
  p.prediction_type,
  p.input::jsonb,
  p.output::jsonb,
  p.confidence
from (
  values
    ('99999991-9999-4999-8999-999999999991', 'biomass_listing', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'price', '{"biomassType":"Olive residues","quantityKg":18000,"location":"Sfax"}', '{"predictedPricePerKg":0.45,"confidence":0.84}', 0.84),
    ('99999992-9999-4999-8999-999999999992', 'biomass_listing', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'price', '{"biomassType":"Wheat straw","quantityKg":24000,"location":"Kairouan"}', '{"predictedPricePerKg":0.26,"confidence":0.82}', 0.82),
    ('99999993-9999-4999-8999-999999999993', 'biomass_listing', 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'quality', '{"biomassType":"Date palm waste","moistureLevel":24}', '{"qualityScore":72,"recommendation":"Improve storage before delivery."}', 0.78),
    ('99999994-9999-4999-8999-999999999994', 'biomass_listing', 'aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'price', '{"biomassType":"Almond shells","quantityKg":9000,"location":"Nabeul"}', '{"predictedPricePerKg":0.58,"confidence":0.88}', 0.88),
    ('99999995-9999-4999-8999-999999999995', 'biomass_listing', 'aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'carbon', '{"biomassType":"Corn stalks","quantityKg":15000}', '{"carbonSavedKg":18000}', 0.8),
    ('99999996-9999-4999-8999-999999999996', 'biomass_listing', 'aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'health_risk', '{"quantityKg":7000,"regionPollutionLevel":64}', '{"healthRiskReductionScore":35}', 0.76),
    ('99999997-9999-4999-8999-999999999997', 'biomass_transaction', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'fraud_risk', '{"quantityKg":10000,"totalPrice":2800}', '{"risk":"low","signals":[]}', 0.73),
    ('99999998-9999-4999-8999-999999999998', 'biomass_transaction', 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'recommendation', '{"buyerLocation":"Gabes","listingLocation":"Kairouan"}', '{"recommendation":"Compare transport cost before accepting."}', 0.7),
    ('99999999-9999-4999-8999-999999999999', 'pollution_report', 'ccccccc3-cccc-4ccc-8ccc-ccccccccccc3', 'health_risk', '{"region":"Kairouan","pollutionLevel":80}', '{"riskScore":73,"priority":"high"}', 0.86),
    ('99999990-9999-4999-8999-999999999990', 'security_log', 'eeeeeee7-eeee-4eee-8eee-eeeeeeeeeee7', 'anomaly', '{"eventType":"high_value_transaction"}', '{"severity":"high","reason":"Unusual transaction value"}', 0.81)
) as p(id, entity_type, entity_id, prediction_type, input, output, confidence)
on conflict (id) do update set
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  prediction_type = excluded.prediction_type,
  input = excluded.input,
  output = excluded.output,
  confidence = excluded.confidence;

drop table if exists pg_temp.seed_users;
