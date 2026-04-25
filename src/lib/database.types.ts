export type UserRole = "farmer" | "industry" | "health_actor" | "admin";
export type ListingStatus = "available" | "reserved" | "sold" | "cancelled";
export type TransactionStatus =
  | "pending"
  | "accepted"
  | "in_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";
export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  organization_name: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface BiomassListing {
  id: string;
  farmer_id: string;
  title: string;
  biomass_type: string;
  description: string | null;
  quantity_kg: number;
  price_per_kg: number;
  predicted_price_per_kg: number | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  quality_score: number | null;
  moisture_level: number | null;
  status: ListingStatus;
  carbon_saved_kg: number;
  health_risk_reduction_score: number;
  blockchain_batch_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface BiomassTransaction {
  id: string;
  listing_id: string;
  farmer_id: string;
  industry_id: string;
  quantity_kg: number;
  agreed_price_per_kg: number;
  total_price: number;
  status: TransactionStatus;
  delivery_location: string | null;
  delivery_date: string | null;
  smart_contract_hash: string | null;
  blockchain_transaction_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface PollutionReport {
  id: string;
  reporter_id: string | null;
  region: string;
  pollution_level: number;
  burned_waste_estimate_kg: number;
  respiratory_risk_score: number | null;
  notes: string | null;
  created_at: string;
}

export interface HealthIndicator {
  id: string;
  region: string;
  respiratory_cases: number;
  vulnerable_population_estimate: number;
  air_quality_score: number | null;
  risk_score: number | null;
  created_at: string;
}

export interface SecurityLog {
  id: string;
  user_id: string | null;
  event_type: string;
  severity: AlertSeverity;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface BlockchainRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string | null;
  hash: string;
  previous_hash: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface AiPrediction {
  id: string;
  entity_type: string;
  entity_id: string;
  prediction_type: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidence: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; Relationships: [] };
      biomass_listings: { Row: BiomassListing; Insert: Partial<BiomassListing>; Update: Partial<BiomassListing>; Relationships: [] };
      biomass_transactions: { Row: BiomassTransaction; Insert: Partial<BiomassTransaction>; Update: Partial<BiomassTransaction>; Relationships: [] };
      pollution_reports: { Row: PollutionReport; Insert: Partial<PollutionReport>; Update: Partial<PollutionReport>; Relationships: [] };
      health_indicators: { Row: HealthIndicator; Insert: Partial<HealthIndicator>; Update: Partial<HealthIndicator>; Relationships: [] };
      security_logs: { Row: SecurityLog; Insert: Partial<SecurityLog>; Update: Partial<SecurityLog>; Relationships: [] };
      blockchain_records: { Row: BlockchainRecord; Insert: Partial<BlockchainRecord>; Update: Partial<BlockchainRecord>; Relationships: [] };
      ai_predictions: { Row: AiPrediction; Insert: Partial<AiPrediction>; Update: Partial<AiPrediction>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      listing_status: ListingStatus;
      transaction_status: TransactionStatus;
      alert_severity: AlertSeverity;
    };
    CompositeTypes: Record<string, never>;
  };
}
