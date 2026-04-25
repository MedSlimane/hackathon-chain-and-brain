import type {
  AiPrediction,
  BiomassListing,
  BiomassTransaction,
  BlockchainRecord,
  HealthIndicator,
  PollutionReport,
  Profile,
  SecurityLog,
} from "./database.types";

const now = new Date().toISOString();

export const demoProfiles: Profile[] = [
  { id: "11111111-1111-4111-8111-111111111111", full_name: "Amira Ben Salah", role: "farmer", organization_name: "Domaine Sfax Bio", phone: "+216 20 111 111", location: "Sfax", created_at: now, updated_at: now },
  { id: "22222222-2222-4222-8222-222222222222", full_name: "Youssef Trabelsi", role: "farmer", organization_name: "Ferme Nabeul Verte", phone: "+216 21 222 222", location: "Nabeul", created_at: now, updated_at: now },
  { id: "33333333-3333-4333-8333-333333333333", full_name: "Sana Mejri", role: "industry", organization_name: "BioHeat Tunisia", phone: "+216 22 333 333", location: "Sousse", created_at: now, updated_at: now },
  { id: "44444444-4444-4444-8444-444444444444", full_name: "Karim Saidi", role: "industry", organization_name: "Green Cement Gabes", phone: "+216 23 444 444", location: "Gabes", created_at: now, updated_at: now },
  { id: "55555555-5555-4555-8555-555555555555", full_name: "Dr. Lina Haddad", role: "health_actor", organization_name: "Regional Health Observatory", phone: "+216 24 555 555", location: "Kairouan", created_at: now, updated_at: now },
  { id: "66666666-6666-4666-8666-666666666666", full_name: "Admin AgriConnect", role: "admin", organization_name: "AgriConnect Smart", phone: "+216 25 666 666", location: "Tunis", created_at: now, updated_at: now },
];

export const demoListings: BiomassListing[] = [
  { id: "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1", farmer_id: demoProfiles[0].id, title: "Dry olive residues from Sfax harvest", biomass_type: "Olive residues", description: "Sorted olive residues ready for biomass processing.", quantity_kg: 18000, price_per_kg: 0.43, predicted_price_per_kg: 0.45, location: "Sfax", latitude: null, longitude: null, image_url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80", quality_score: 86, moisture_level: 12, status: "available", carbon_saved_kg: 26100, health_risk_reduction_score: 71, blockchain_batch_hash: "0x9a4c1b55df3a6f9d86d1f3e777ba8e17cb6b9db04748efb7d749f0b5c774a01e", created_at: now, updated_at: now },
  { id: "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2", farmer_id: demoProfiles[1].id, title: "Wheat straw bales near Kairouan", biomass_type: "Wheat straw", description: "Compressed bales stored under cover.", quantity_kg: 24000, price_per_kg: 0.25, predicted_price_per_kg: 0.26, location: "Kairouan", latitude: null, longitude: null, image_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80", quality_score: 78, moisture_level: 18, status: "available", carbon_saved_kg: 30000, health_risk_reduction_score: 76, blockchain_batch_hash: "0x28edbf0e1ce5bb90bb6255f4f6d3ca69021c635172f10bb3a51cd9da93832c42", created_at: now, updated_at: now },
  { id: "aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3", farmer_id: demoProfiles[0].id, title: "Date palm waste from Tozeur oasis", biomass_type: "Date palm waste", description: "Palm fronds and date processing residues.", quantity_kg: 12500, price_per_kg: 0.33, predicted_price_per_kg: 0.32, location: "Tozeur", latitude: null, longitude: null, image_url: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80", quality_score: 72, moisture_level: 24, status: "available", carbon_saved_kg: 16250, health_risk_reduction_score: 58, blockchain_batch_hash: "0x5bbec38b1f31972fc4d728064ab8d6ae36f87cf51daa3a17b996eb2c1f23d30f", created_at: now, updated_at: now },
  { id: "aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4", farmer_id: demoProfiles[1].id, title: "Almond shells for industrial boilers", biomass_type: "Almond shells", description: "High-density almond shells with low moisture.", quantity_kg: 9000, price_per_kg: 0.61, predicted_price_per_kg: 0.58, location: "Nabeul", latitude: null, longitude: null, image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", quality_score: 88, moisture_level: 10, status: "available", carbon_saved_kg: 14850, health_risk_reduction_score: 49, blockchain_batch_hash: "0xce8ec9bf32c95c927936e36dff3944db4ff540e24187d8976f2141a29cfc1374", created_at: now, updated_at: now },
  { id: "aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5", farmer_id: demoProfiles[0].id, title: "Corn stalks after harvest", biomass_type: "Corn stalks", description: "Loose stalks available for collection.", quantity_kg: 15000, price_per_kg: 0.28, predicted_price_per_kg: 0.27, location: "Sousse", latitude: null, longitude: null, image_url: "https://images.unsplash.com/photo-1533321942807-08e4008b2025?auto=format&fit=crop&w=900&q=80", quality_score: 65, moisture_level: 28, status: "reserved", carbon_saved_kg: 18000, health_risk_reduction_score: 53, blockchain_batch_hash: "0xdef1e9c528acda2ae94bc0d6fb5af41a893654b26f83e2202eef7df88e7cb12a", created_at: now, updated_at: now },
  { id: "aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6", farmer_id: demoProfiles[1].id, title: "Vegetable waste for biogas", biomass_type: "Vegetable waste", description: "Fresh vegetable residues collected from farms.", quantity_kg: 7000, price_per_kg: 0.17, predicted_price_per_kg: 0.18, location: "Gabes", latitude: null, longitude: null, image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80", quality_score: 60, moisture_level: 44, status: "available", carbon_saved_kg: 5600, health_risk_reduction_score: 35, blockchain_batch_hash: "0x019c52d29ec07238c3881f78c097d4d83de26f61fa1265ca5ba08121b595dfd8", created_at: now, updated_at: now },
];

export const demoTransactions: BiomassTransaction[] = [
  { id: "bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1", listing_id: demoListings[4].id, farmer_id: demoProfiles[0].id, industry_id: demoProfiles[2].id, quantity_kg: 10000, agreed_price_per_kg: 0.28, total_price: 2800, status: "in_delivery", delivery_location: "Sousse biomass depot", delivery_date: "2026-05-02", smart_contract_hash: "0xsmart001", blockchain_transaction_hash: "0xf3dd9b1a41302e0108e8c2e3e87d4c553db126a8f60fcd0f57ad6d96a363a21d", created_at: now, updated_at: now },
  { id: "bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2", listing_id: demoListings[1].id, farmer_id: demoProfiles[1].id, industry_id: demoProfiles[3].id, quantity_kg: 6000, agreed_price_per_kg: 0.25, total_price: 1500, status: "pending", delivery_location: "Gabes plant", delivery_date: "2026-05-08", smart_contract_hash: null, blockchain_transaction_hash: "0x9dca32d047432474877d7789dfd13fc5dcbbd4a6aab26121c531b72cc0238efc", created_at: now, updated_at: now },
  { id: "bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3", listing_id: demoListings[0].id, farmer_id: demoProfiles[0].id, industry_id: demoProfiles[2].id, quantity_kg: 3500, agreed_price_per_kg: 0.43, total_price: 1505, status: "completed", delivery_location: "Sousse boiler site", delivery_date: "2026-04-12", smart_contract_hash: "0xsmart003", blockchain_transaction_hash: "0x1c44d12c7229ad994f1bfdad661b55207355540354a8950d08e6d8b1605c90ae", created_at: now, updated_at: now },
];

export const demoPollutionReports: PollutionReport[] = [
  { id: "ccccccc1-cccc-4ccc-8ccc-ccccccccccc1", reporter_id: demoProfiles[4].id, region: "Sfax", pollution_level: 72, burned_waste_estimate_kg: 18000, respiratory_risk_score: 68, notes: "Seasonal burning reported near peri-urban farms.", created_at: now },
  { id: "ccccccc2-cccc-4ccc-8ccc-ccccccccccc2", reporter_id: demoProfiles[4].id, region: "Sousse", pollution_level: 55, burned_waste_estimate_kg: 9000, respiratory_risk_score: 48, notes: "Moderate risk.", created_at: now },
  { id: "ccccccc3-cccc-4ccc-8ccc-ccccccccccc3", reporter_id: demoProfiles[4].id, region: "Kairouan", pollution_level: 80, burned_waste_estimate_kg: 24000, respiratory_risk_score: 73, notes: "High crop residue burning pressure.", created_at: now },
  { id: "ccccccc4-cccc-4ccc-8ccc-ccccccccccc4", reporter_id: demoProfiles[4].id, region: "Nabeul", pollution_level: 46, burned_waste_estimate_kg: 5000, respiratory_risk_score: 39, notes: "Improving trend.", created_at: now },
  { id: "ccccccc5-cccc-4ccc-8ccc-ccccccccccc5", reporter_id: demoProfiles[4].id, region: "Gabes", pollution_level: 64, burned_waste_estimate_kg: 13000, respiratory_risk_score: 59, notes: "Industrial corridor watchlist.", created_at: now },
];

export const demoHealthIndicators: HealthIndicator[] = [
  { id: "ddddddd1-dddd-4ddd-8ddd-ddddddddddd1", region: "Sfax", respiratory_cases: 230, vulnerable_population_estimate: 52000, air_quality_score: 38, risk_score: 68, created_at: now },
  { id: "ddddddd2-dddd-4ddd-8ddd-ddddddddddd2", region: "Sousse", respiratory_cases: 140, vulnerable_population_estimate: 36000, air_quality_score: 55, risk_score: 48, created_at: now },
  { id: "ddddddd3-dddd-4ddd-8ddd-ddddddddddd3", region: "Kairouan", respiratory_cases: 260, vulnerable_population_estimate: 61000, air_quality_score: 31, risk_score: 73, created_at: now },
  { id: "ddddddd4-dddd-4ddd-8ddd-ddddddddddd4", region: "Nabeul", respiratory_cases: 98, vulnerable_population_estimate: 28000, air_quality_score: 64, risk_score: 39, created_at: now },
  { id: "ddddddd5-dddd-4ddd-8ddd-ddddddddddd5", region: "Gabes", respiratory_cases: 205, vulnerable_population_estimate: 44000, air_quality_score: 42, risk_score: 59, created_at: now },
];

export const demoSecurityLogs: SecurityLog[] = [
  { id: "eeeeeee1-eeee-4eee-8eee-eeeeeeeeeee1", user_id: demoProfiles[0].id, event_type: "listing_created", severity: "low", ip_address: "197.0.0.10", user_agent: "Demo browser", details: { listing: "Olive residues" }, created_at: now },
  { id: "eeeeeee2-eeee-4eee-8eee-eeeeeeeeeee2", user_id: demoProfiles[2].id, event_type: "transaction_created", severity: "low", ip_address: "197.0.0.12", user_agent: "Demo browser", details: { total: 2800 }, created_at: now },
  { id: "eeeeeee3-eeee-4eee-8eee-eeeeeeeeeee3", user_id: demoProfiles[1].id, event_type: "suspicious_quantity", severity: "medium", ip_address: "197.0.0.13", user_agent: "Demo browser", details: { quantity_kg: 120000 }, created_at: now },
  { id: "eeeeeee4-eeee-4eee-8eee-eeeeeeeeeee4", user_id: null, event_type: "failed_login_burst", severity: "high", ip_address: "41.0.0.20", user_agent: "Unknown", details: { attempts: 9 }, created_at: now },
  { id: "eeeeeee5-eeee-4eee-8eee-eeeeeeeeeee5", user_id: demoProfiles[3].id, event_type: "unknown_device", severity: "medium", ip_address: "102.0.0.8", user_agent: "New device", details: { location: "Gabes" }, created_at: now },
  { id: "eeeeeee6-eeee-4eee-8eee-eeeeeeeeeee6", user_id: demoProfiles[4].id, event_type: "pollution_report_created", severity: "low", ip_address: "197.0.0.14", user_agent: "Demo browser", details: { region: "Kairouan" }, created_at: now },
  { id: "eeeeeee7-eeee-4eee-8eee-eeeeeeeeeee7", user_id: demoProfiles[2].id, event_type: "high_value_transaction", severity: "high", ip_address: "197.0.0.15", user_agent: "Demo browser", details: { total: 52000 }, created_at: now },
  { id: "eeeeeee8-eeee-4eee-8eee-eeeeeeeeeee8", user_id: null, event_type: "unauthorized_access_attempt", severity: "critical", ip_address: "185.0.0.4", user_agent: "Script", details: { target: "admin_dashboard" }, created_at: now },
];

export const demoBlockchainRecords: BlockchainRecord[] = [
  ...demoListings.slice(0, 6).map((listing, index): BlockchainRecord => ({
  id: `fffffff${index + 1}-ffff-4fff-8fff-fffffffffff${index + 1}`,
  entity_type: "biomass_listing",
  entity_id: listing.id,
  action: index % 2 === 0 ? "batch_created" : "quality_verified",
  actor_id: listing.farmer_id,
  hash: listing.blockchain_batch_hash ?? `0x${String(index).padStart(64, "0")}`,
  previous_hash: index === 0 ? null : demoListings[index - 1].blockchain_batch_hash,
  payload: { biomass_type: listing.biomass_type, quantity_kg: listing.quantity_kg },
  created_at: now,
})),
  ...demoTransactions.map((transaction, index): BlockchainRecord => ({
  id: `ffffffa${index + 1}-ffff-4fff-8fff-ffffffffffa${index + 1}`,
  entity_type: "biomass_transaction",
  entity_id: transaction.id,
  action: "transaction_created",
  actor_id: transaction.industry_id,
  hash: transaction.blockchain_transaction_hash ?? `0x${String(index + 10).padStart(64, "0")}`,
  previous_hash: demoListings[index].blockchain_batch_hash,
  payload: { listing_id: transaction.listing_id, total_price: transaction.total_price },
  created_at: now,
})),
];

demoBlockchainRecords.push({
  id: "ffffffe0-ffff-4fff-8fff-ffffffffff10",
  entity_type: "carbon_impact",
  entity_id: demoListings[0].id,
  action: "carbon_impact_recorded",
  actor_id: demoProfiles[4].id,
  hash: "0xe97ddf3a6e53ea740dd573dbf4690f02bd582f4f245f8ff107d057f5f0a0a7da",
  previous_hash: demoListings[0].blockchain_batch_hash,
  payload: { carbon_saved_kg: demoListings[0].carbon_saved_kg },
  created_at: now,
});

export const demoAiPredictions: AiPrediction[] = demoListings.slice(0, 4).map((listing, index) => ({
  id: `9999999${index + 1}-9999-4999-8999-99999999999${index + 1}`,
  entity_type: "biomass_listing",
  entity_id: listing.id,
  prediction_type: "price",
  input: { biomassType: listing.biomass_type, quantityKg: listing.quantity_kg },
  output: { predictedPricePerKg: listing.predicted_price_per_kg },
  confidence: 0.82,
  created_at: now,
}));
