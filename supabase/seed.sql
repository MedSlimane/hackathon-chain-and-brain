-- AgriConnect Smart seed data
-- Create matching users in Supabase Auth first, then replace these UUIDs if needed.
-- The profiles table references auth.users(id), so inserting profiles requires existing auth users.

insert into public.profiles (id, full_name, role, organization_name, phone, location) values
('11111111-1111-4111-8111-111111111111', 'Amira Ben Salah', 'farmer', 'Domaine Sfax Bio', '+216 20 111 111', 'Sfax'),
('22222222-2222-4222-8222-222222222222', 'Youssef Trabelsi', 'farmer', 'Ferme Nabeul Verte', '+216 21 222 222', 'Nabeul'),
('33333333-3333-4333-8333-333333333333', 'Sana Mejri', 'industry', 'BioHeat Tunisia', '+216 22 333 333', 'Sousse'),
('44444444-4444-4444-8444-444444444444', 'Karim Saidi', 'industry', 'Green Cement Gabes', '+216 23 444 444', 'Gabes'),
('55555555-5555-4555-8555-555555555555', 'Dr. Lina Haddad', 'health_actor', 'Regional Health Observatory', '+216 24 555 555', 'Kairouan'),
('66666666-6666-4666-8666-666666666666', 'Admin AgriConnect', 'admin', 'AgriConnect Smart', '+216 25 666 666', 'Tunis')
on conflict (id) do nothing;

insert into public.biomass_listings (id, farmer_id, title, biomass_type, description, quantity_kg, price_per_kg, predicted_price_per_kg, location, image_url, quality_score, moisture_level, status, carbon_saved_kg, health_risk_reduction_score, blockchain_batch_hash) values
('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'Dry olive residues from Sfax harvest', 'Olive residues', 'Sorted olive residues ready for biomass processing.', 18000, 0.43, 0.45, 'Sfax', 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80', 86, 12, 'available', 26100, 71, '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e'),
('aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 'Wheat straw bales near Kairouan', 'Wheat straw', 'Compressed bales stored under cover.', 24000, 0.25, 0.26, 'Kairouan', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80', 78, 18, 'available', 30000, 76, '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42'),
('aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '11111111-1111-4111-8111-111111111111', 'Date palm waste from Tozeur oasis', 'Date palm waste', 'Palm fronds and date processing residues.', 12500, 0.33, 0.32, 'Tozeur', 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80', 72, 24, 'available', 16250, 58, '0x5bbec38b1f31972fc4d728064ab8d6ae36f87cf51daa3a17b996eb2c1f23d30f'),
('aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '22222222-2222-4222-8222-222222222222', 'Almond shells for industrial boilers', 'Almond shells', 'High-density almond shells with low moisture.', 9000, 0.61, 0.58, 'Nabeul', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80', 88, 10, 'available', 14850, 49, '0xce8ec9bf32c95c927936e36dff3944db4ff540e24187d8976f2141a29cfc1374'),
('aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '11111111-1111-4111-8111-111111111111', 'Corn stalks after harvest', 'Corn stalks', 'Loose stalks available for collection.', 15000, 0.28, 0.27, 'Sousse', 'https://images.unsplash.com/photo-1533321942807-08e4008b2025?auto=format&fit=crop&w=900&q=80', 65, 28, 'reserved', 18000, 53, '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a'),
('aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6', '22222222-2222-4222-8222-222222222222', 'Vegetable waste for biogas', 'Vegetable waste', 'Fresh vegetable residues collected from farms.', 7000, 0.17, 0.18, 'Gabes', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80', 60, 44, 'available', 5600, 35, '0x019c52d29ec07238c3881f78c097d4d83de26f61fa1265ca5ba08121b595dfd8')
on conflict (id) do nothing;

insert into public.biomass_transactions (id, listing_id, farmer_id, industry_id, quantity_kg, agreed_price_per_kg, status, delivery_location, delivery_date, smart_contract_hash, blockchain_transaction_hash) values
('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 10000, 0.28, 'in_delivery', 'Sousse biomass depot', '2026-05-02', '0xsmart001', '0xf3dd9b1a41302e0108e8c2e3e87d4c553db126a8f60fcd0f57ad6d96a363a21d'),
('bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444444', 6000, 0.25, 'pending', 'Gabes plant', '2026-05-08', null, '0x9dca32d047432474877d7789dfd13fc5dcbbd4a6aab26121c531b72cc0238efc'),
('bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 3500, 0.43, 'completed', 'Sousse boiler site', '2026-04-12', '0xsmart003', '0x1c44d12c7229ad994f1bfdad661b55207355540354a8950d08e6d8b1605c90ae')
on conflict (id) do nothing;

insert into public.pollution_reports (reporter_id, region, pollution_level, burned_waste_estimate_kg, respiratory_risk_score, notes) values
('55555555-5555-4555-8555-555555555555', 'Sfax', 72, 18000, 68, 'Seasonal burning reported near peri-urban farms.'),
('55555555-5555-4555-8555-555555555555', 'Sousse', 55, 9000, 48, 'Moderate risk.'),
('55555555-5555-4555-8555-555555555555', 'Kairouan', 80, 24000, 73, 'High crop residue burning pressure.'),
('55555555-5555-4555-8555-555555555555', 'Nabeul', 46, 5000, 39, 'Improving trend.'),
('55555555-5555-4555-8555-555555555555', 'Gabes', 64, 13000, 59, 'Industrial corridor watchlist.');

insert into public.health_indicators (region, respiratory_cases, vulnerable_population_estimate, air_quality_score, risk_score) values
('Sfax', 230, 52000, 38, 68),
('Sousse', 140, 36000, 55, 48),
('Kairouan', 260, 61000, 31, 73),
('Nabeul', 98, 28000, 64, 39),
('Gabes', 205, 44000, 42, 59);

insert into public.security_logs (user_id, event_type, severity, ip_address, user_agent, details) values
('11111111-1111-4111-8111-111111111111', 'listing_created', 'low', '197.0.0.10', 'Demo browser', '{"listing":"Olive residues"}'),
('33333333-3333-4333-8333-333333333333', 'transaction_created', 'low', '197.0.0.12', 'Demo browser', '{"total":2800}'),
('22222222-2222-4222-8222-222222222222', 'suspicious_quantity', 'medium', '197.0.0.13', 'Demo browser', '{"quantity_kg":120000}'),
(null, 'failed_login_burst', 'high', '41.0.0.20', 'Unknown', '{"attempts":9}'),
('44444444-4444-4444-8444-444444444444', 'unknown_device', 'medium', '102.0.0.8', 'New device', '{"location":"Gabes"}'),
('55555555-5555-4555-8555-555555555555', 'pollution_report_created', 'low', '197.0.0.14', 'Demo browser', '{"region":"Kairouan"}'),
('33333333-3333-4333-8333-333333333333', 'high_value_transaction', 'high', '197.0.0.15', 'Demo browser', '{"total":52000}'),
(null, 'unauthorized_access_attempt', 'critical', '185.0.0.4', 'Script', '{"target":"admin_dashboard"}');

insert into public.blockchain_records (entity_type, entity_id, action, actor_id, hash, previous_hash, payload) values
('biomass_listing', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'batch_created', '11111111-1111-4111-8111-111111111111', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', null, '{"biomass_type":"Olive residues","quantity_kg":18000}'),
('biomass_listing', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'batch_created', '22222222-2222-4222-8222-222222222222', '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', '{"biomass_type":"Wheat straw","quantity_kg":24000}'),
('biomass_listing', 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'batch_created', '11111111-1111-4111-8111-111111111111', '0x5bbec38b1f31972fc4d728064ab8d6ae36f87cf51daa3a17b996eb2c1f23d30f', '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42', '{"biomass_type":"Date palm waste","quantity_kg":12500}'),
('biomass_listing', 'aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'quality_verified', '22222222-2222-4222-8222-222222222222', '0xce8ec9bf32c95c927936e36dff3944db4ff540e24187d8976f2141a29cfc1374', '0x5bbec38b1f31972fc4d728064ab8d6ae36f87cf51daa3a17b996eb2c1f23d30f', '{"quality_score":88}'),
('biomass_listing', 'aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'batch_created', '11111111-1111-4111-8111-111111111111', '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a', '0xce8ec9bf32c95c927936e36dff3944db4ff540e24187d8976f2141a29cfc1374', '{"biomass_type":"Corn stalks","quantity_kg":15000}'),
('biomass_listing', 'aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'batch_created', '22222222-2222-4222-8222-222222222222', '0x019c52d29ec07238c3881f78c097d4d83de26f61fa1265ca5ba08121b595dfd8', '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a', '{"biomass_type":"Vegetable waste","quantity_kg":7000}'),
('biomass_transaction', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'transaction_created', '33333333-3333-4333-8333-333333333333', '0xf3dd9b1a41302e0108e8c2e3e87d4c553db126a8f60fcd0f57ad6d96a363a21d', '0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a', '{"total_price":2800}'),
('biomass_transaction', 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'transaction_created', '44444444-4444-4444-8444-444444444444', '0x9dca32d047432474877d7789dfd13fc5dcbbd4a6aab26121c531b72cc0238efc', '0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42', '{"total_price":1500}'),
('biomass_transaction', 'bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'transaction_created', '33333333-3333-4333-8333-333333333333', '0x1c44d12c7229ad994f1bfdad661b55207355540354a8950d08e6d8b1605c90ae', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', '{"total_price":1505}'),
('carbon_impact', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'carbon_impact_recorded', '55555555-5555-4555-8555-555555555555', '0xe97ddf3a6e53ea740dd573dbf4690f02bd582f4f245f8ff107d057f5f0a0a7da', '0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e', '{"carbon_saved_kg":26100}');
