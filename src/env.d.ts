/// <reference types="astro/client" />

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "./lib/database.types";

declare global {
  interface ImportMetaEnv {
    readonly PUBLIC_SUPABASE_URL?: string;
    readonly PUBLIC_SUPABASE_ANON_KEY?: string;
    readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  }

  namespace App {
    interface Locals {
      supabase?: SupabaseClient;
      user: User | null;
      profile: Profile | null;
    }
  }
}

export {};
