# AgriConnect Smart

AgriConnect Smart is a secure hackathon MVP that connects farmers selling agricultural waste with industries buying biomass. It also gives health actors a dashboard for aggregated pollution and respiratory-risk monitoring.

## Features

- Farmer, industry, health actor, and admin dashboards
- Supabase Auth-ready registration and login
- Role-aware UI and Supabase Row Level Security policies
- Biomass marketplace with search, filters, and listing details
- Biomass image upload helper for Supabase Storage
- Local AI price prediction, carbon saved estimation, health benefit scoring, and recommendations
- Industry purchase flow scaffold with transaction creation
- Blockchain-style batch and transaction hashes
- Admin security dashboard with anomaly logs and suspicious activity
- Aggregated health/environment data only; no individual medical records

## Tech Stack

- Astro + React + TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, RLS, and Storage
- Recharts for health charts
- Zod validation
- Lucide React icons
- Nanoid for image names
- Solidity placeholder contract for future blockchain integration

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:4321`.

The UI runs with bundled demo data when Supabase env vars are empty. Add Supabase credentials to enable real auth, inserts, uploads, and logs:

```bash
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
PUBLIC_APP_URL=http://localhost:4321
PUBLIC_MODEL_API_URL=http://127.0.0.1:8000
```

Only `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are used in browser code. Never expose a service role key or `OPENAI_API_KEY` client-side.

## Model API

The farmer upload modal can call the trained model API in `modeles/`:

```bash
npm run models:dev
```

The frontend calls `POST /predict/lot` through `PUBLIC_MODEL_API_URL`. That endpoint uses:

- `biomass_type_classifier.pt` for image classification
- `biomass_quality_regressor.pt` for dry matter and quality signals
- `price_model.pt` for market price prediction
- `carbon_calculator.py` / API carbon output for avoided open-burning emissions

If the model API is offline, the UI falls back to the local demo prediction engine.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/policies.sql` in the SQL editor.
4. Create demo users in Supabase Auth.
5. Replace UUIDs in `supabase/seed.sql` with the created Auth user IDs if needed.
6. Run `supabase/seed.sql`.

The policies file also creates the public `biomass-images` bucket and Storage RLS policies. Upload paths must follow:

```text
{user_id}/{filename}
```

## Demo Users

The seed file expects these roles:

- Farmer: Amira Ben Salah
- Farmer: Youssef Trabelsi
- Industry: Sana Mejri
- Industry: Karim Saidi
- Health actor: Dr. Lina Haddad
- Admin: Admin AgriConnect

Use the login page demo buttons to navigate without a connected Supabase project.

## Architecture

`src/lib` contains the clean data and domain layer:

- `supabaseClient.ts`: typed Supabase browser client with env validation
- `auth.ts`: sign in, sign up, current user/profile, role redirect helpers
- `listings.ts`, `transactions.ts`, `health.ts`, `admin.ts`: data access helpers
- `predictions.ts`: local AI-style prediction engine
- `blockchain.ts`: deterministic hash and record creation helpers
- `security.ts`: event logging and anomaly detection
- `validators.ts`: Zod schemas for all forms

React components live in `src/components`, and Astro pages compose them into the landing page, marketplace, dashboards, listing detail, and transaction detail routes.

## AI

The first AI layer is intentionally local and explainable. It predicts biomass price using biomass type, quality, moisture, demand, distance, and quantity. It also estimates avoided CO2e, health risk reduction, and practical recommendations. A server-only Astro API endpoint can later call OpenAI using `OPENAI_API_KEY`.

## Blockchain

The MVP simulates blockchain traceability by hashing listing and transaction payloads and storing append-only records in `blockchain_records`. `contracts/BiomassTraceability.sol` is included as a future-ready smart contract layer with batch creation, transaction creation, delivery confirmation, and carbon impact recording.

## Cybersecurity

Security is demonstrated through:

- Supabase Auth
- RLS policies for every public table
- Role-based authorization helpers
- Zod input validation
- Restricted image upload type and size
- Security event logging for login, listing, transaction, and anomaly events
- Admin dashboard for high severity alerts
- Append-only blockchain records for normal users

## Future Improvements

- Add Astro server endpoints for OpenAI recommendations
- Add real smart contract deployment and wallet signing
- Add map-based biomass discovery
- Add notification workflows for accepted orders
- Add admin moderation actions with audit trails
- Generate Supabase database types from the live project
