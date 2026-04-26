import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { nanoid } from "nanoid";

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    process.env[key] ??= value;
  }
}

const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing PUBLIC_SUPABASE_URL/PUBLIC_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_KEY.");
  process.exit(1);
}

const password = "AgriConnectDemo2026!";

const users = [
  { email: "agriconnect.farmer1@gmail.com", full_name: "Amira Ben Salah", role: "farmer", organization_name: "Domaine Sfax Bio", phone: "+216 20 111 111", location: "Sfax" },
  { email: "agriconnect.farmer2@gmail.com", full_name: "Youssef Trabelsi", role: "farmer", organization_name: "Ferme Nabeul Verte", phone: "+216 21 222 222", location: "Nabeul" },
  { email: "agriconnect.industry1@gmail.com", full_name: "Sana Mejri", role: "industry", organization_name: "BioHeat Tunisia", phone: "+216 22 333 333", location: "Sousse" },
  { email: "agriconnect.industry2@gmail.com", full_name: "Karim Saidi", role: "industry", organization_name: "Green Cement Gabes", phone: "+216 23 444 444", location: "Gabes" },
  { email: "agriconnect.health@gmail.com", full_name: "Dr. Lina Haddad", role: "health_actor", organization_name: "Regional Health Observatory", phone: "+216 24 555 555", location: "Kairouan" },
  { email: "agriconnect.admin@gmail.com", full_name: "Admin AgriConnect", role: "admin", organization_name: "AgriConnect Smart", phone: "+216 25 666 666", location: "Tunis" },
];

const imageUrls = [
  "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1533321942807-08e4008b2025?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
];

function client() {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function adminClient() {
  if (!serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function signInOrSignUp(user) {
  const admin = adminClient();
  if (admin) {
    const { data: found } = await admin.auth.admin.listUsers();
    const existing = found.users.find((candidate) => candidate.email === user.email);
    const authUser = existing
      ? { user: existing }
      : (await admin.auth.admin.createUser({
          email: user.email,
          password,
          email_confirm: true,
          user_metadata: { full_name: user.full_name, role: user.role },
        })).data;

    if (!authUser.user) throw new Error(`Could not create ${user.email}`);
    const profile = {
      id: authUser.user.id,
      full_name: user.full_name,
      role: user.role,
      organization_name: user.organization_name,
      phone: user.phone,
      location: user.location,
    };
    const { error } = await admin.from("profiles").upsert(profile);
    if (error) throw error;
    return { ...user, id: authUser.user.id, supabase: admin };
  }

  const supabase = client();
  let auth = await supabase.auth.signInWithPassword({ email: user.email, password });

  if (auth.error) {
    auth = await supabase.auth.signUp({
      email: user.email,
      password,
      options: { data: { full_name: user.full_name, role: user.role } },
    });
  }

  if (auth.error) throw auth.error;
  if (!auth.data.session) {
    throw new Error(`No session for ${user.email}. Disable email confirmation for demo seeding or confirm the user first.`);
  }

  const authed = client();
  await authed.auth.setSession(auth.data.session);
  const profile = {
    id: auth.data.user.id,
    full_name: user.full_name,
    role: user.role,
    organization_name: user.organization_name,
    phone: user.phone,
    location: user.location,
  };
  const { error } = await authed.from("profiles").upsert(profile);
  if (error) throw error;
  return { ...user, id: auth.data.user.id, supabase: authed };
}

async function insertOne(supabase, table, row, label) {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function main() {
  console.log(serviceRoleKey ? "Seeding Supabase with service role..." : "Seeding Supabase through Auth + RLS flows...");
  const accounts = {};
  for (const user of users) {
    const account = await signInOrSignUp(user);
    accounts[user.email] = account;
    console.log(`ready: ${user.email}`);
  }

  const farmer1 = accounts["agriconnect.farmer1@gmail.com"];
  const farmer2 = accounts["agriconnect.farmer2@gmail.com"];
  const industry1 = accounts["agriconnect.industry1@gmail.com"];
  const industry2 = accounts["agriconnect.industry2@gmail.com"];
  const health = accounts["agriconnect.health@gmail.com"];
  const admin = accounts["agriconnect.admin@gmail.com"];

  const listingInputs = [
    [farmer1, "Dry olive residues from Sfax harvest", "Olive residues", 18000, 0.43, "Sfax", 86, 12, imageUrls[0]],
    [farmer2, "Wheat straw bales near Kairouan", "Wheat straw", 24000, 0.25, "Kairouan", 78, 18, imageUrls[1]],
    [farmer1, "Date palm waste from Tozeur oasis", "Date palm waste", 12500, 0.33, "Tozeur", 72, 24, imageUrls[2]],
    [farmer2, "Almond shells for industrial boilers", "Almond shells", 9000, 0.61, "Nabeul", 88, 10, imageUrls[3]],
    [farmer1, "Corn stalks after harvest", "Corn stalks", 15000, 0.28, "Sousse", 65, 28, imageUrls[4]],
    [farmer2, "Vegetable waste for biogas", "Vegetable waste", 7000, 0.17, "Gabes", 60, 44, imageUrls[5]],
  ];

  const listings = [];
  for (const [owner, title, biomass_type, quantity_kg, price_per_kg, location, quality_score, moisture_level, image_url] of listingInputs) {
    const hash = `0x${nanoid(64).replace(/_/g, "a").replace(/-/g, "b").slice(0, 64)}`;
    const listing = await insertOne(owner.supabase, "biomass_listings", {
      farmer_id: owner.id,
      title,
      biomass_type,
      description: `${biomass_type} listed by ${owner.organization_name}.`,
      quantity_kg,
      price_per_kg,
      predicted_price_per_kg: price_per_kg,
      location,
      image_url,
      quality_score,
      moisture_level,
      carbon_saved_kg: Math.round(quantity_kg * 1.2),
      health_risk_reduction_score: Math.min(100, Math.round(quantity_kg / 350)),
      blockchain_batch_hash: hash,
    }, title);
    listings.push(listing);
    await insertOne(owner.supabase, "blockchain_records", {
      entity_type: "biomass_listing",
      entity_id: listing.id,
      action: "batch_created",
      actor_id: owner.id,
      hash,
      payload: { biomass_type, quantity_kg },
    }, `blockchain ${title}`);
    await insertOne(owner.supabase, "ai_predictions", {
      entity_type: "biomass_listing",
      entity_id: listing.id,
      prediction_type: "price",
      input: { biomass_type, quantity_kg, location },
      output: { predicted_price_per_kg: price_per_kg },
      confidence: 0.82,
    }, `prediction ${title}`);
  }

  const transactions = [
    [industry1, listings[4], 10000, "Sousse biomass depot", "2026-05-02"],
    [industry2, listings[1], 6000, "Gabes plant", "2026-05-08"],
    [industry1, listings[0], 3500, "Sousse boiler site", "2026-04-12"],
  ];

  for (const [buyer, listing, quantity_kg, delivery_location, delivery_date] of transactions) {
    const tx = await insertOne(buyer.supabase, "biomass_transactions", {
      listing_id: listing.id,
      farmer_id: listing.farmer_id,
      industry_id: buyer.id,
      quantity_kg,
      agreed_price_per_kg: listing.price_per_kg,
      delivery_location,
      delivery_date,
    }, `transaction ${listing.title}`);
    const hash = `0x${nanoid(64).replace(/_/g, "a").replace(/-/g, "b").slice(0, 64)}`;
    await insertOne(buyer.supabase, "blockchain_records", {
      entity_type: "biomass_transaction",
      entity_id: tx.id,
      action: "transaction_created",
      actor_id: buyer.id,
      hash,
      previous_hash: listing.blockchain_batch_hash,
      payload: { listing_id: listing.id, total_price: tx.total_price },
    }, `blockchain tx ${listing.title}`);
  }

  for (const [region, pollution_level, burned_waste_estimate_kg, respiratory_risk_score, notes] of [
    ["Sfax", 72, 18000, 68, "Seasonal burning reported near peri-urban farms."],
    ["Sousse", 55, 9000, 48, "Moderate risk."],
    ["Kairouan", 80, 24000, 73, "High crop residue burning pressure."],
    ["Nabeul", 46, 5000, 39, "Improving trend."],
    ["Gabes", 64, 13000, 59, "Industrial corridor watchlist."],
  ]) {
    await insertOne(health.supabase, "pollution_reports", {
      reporter_id: health.id,
      region,
      pollution_level,
      burned_waste_estimate_kg,
      respiratory_risk_score,
      notes,
    }, `pollution ${region}`);
    await insertOne(health.supabase, "health_indicators", {
      region,
      respiratory_cases: Math.round(respiratory_risk_score * 3.2),
      vulnerable_population_estimate: burned_waste_estimate_kg * 2,
      air_quality_score: 100 - pollution_level,
      risk_score: respiratory_risk_score,
    }, `health ${region}`);
  }

  for (const [account, event_type, severity, details] of [
    [farmer1, "listing_created", "low", { count: 3 }],
    [industry1, "transaction_created", "low", { count: 2 }],
    [farmer2, "suspicious_quantity", "medium", { quantity_kg: 120000 }],
    [industry2, "unknown_device", "medium", { location: "Gabes" }],
    [health, "pollution_report_created", "low", { region: "Kairouan" }],
    [industry1, "high_value_transaction", "high", { total: 52000 }],
    [admin, "unauthorized_access_attempt", "critical", { target: "admin_dashboard" }],
    [admin, "admin_review", "low", { reviewed: true }],
  ]) {
    await insertOne(account.supabase, "security_logs", {
      user_id: account.id,
      event_type,
      severity,
      details,
    }, `security ${event_type}`);
  }

  console.log("\nSeed complete.");
  console.log(`Password for all demo users: ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
