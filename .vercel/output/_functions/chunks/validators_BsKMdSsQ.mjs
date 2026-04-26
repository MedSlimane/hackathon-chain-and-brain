import { z } from 'zod';

const roles = ["farmer", "industry", "health_actor", "admin"];
const registerSchema = z.object({
  full_name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(roles),
  organization_name: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().min(2, "Enter a region or city.")
});
const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});
const listingSchema = z.object({
  title: z.string().min(3, "Title is required."),
  biomass_type: z.string().min(2, "Biomass type is required."),
  description: z.string().optional(),
  quantity_kg: z.coerce.number().positive("Quantity must be positive."),
  price_per_kg: z.coerce.number().min(0, "Price cannot be negative."),
  location: z.string().min(2, "Location is required."),
  moisture_level: z.coerce.number().min(0).max(100).optional(),
  quality_score: z.coerce.number().int().min(0).max(100).optional(),
  demandLevel: z.enum(["low", "medium", "high"]).default("medium"),
  distanceKm: z.coerce.number().min(0).default(40)
});
z.object({
  listing_id: z.string().uuid(),
  farmer_id: z.string().uuid(),
  industry_id: z.string().uuid(),
  quantity_kg: z.coerce.number().positive(),
  agreed_price_per_kg: z.coerce.number().min(0),
  delivery_location: z.string().min(2),
  delivery_date: z.string().optional()
});
z.object({
  region: z.string().min(2),
  pollution_level: z.coerce.number().int().min(0).max(100),
  burned_waste_estimate_kg: z.coerce.number().min(0).default(0),
  respiratory_risk_score: z.coerce.number().int().min(0).max(100),
  notes: z.string().optional()
});
function validateImageFile(file) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;
  if (!allowedTypes.includes(file.type)) {
    return "Use a JPG, PNG, or WEBP image.";
  }
  if (file.size > maxSize) {
    return "Image must be under 5 MB.";
  }
  return null;
}

export { loginSchema as a, listingSchema as l, registerSchema as r, validateImageFile as v };
