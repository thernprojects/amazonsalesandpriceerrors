import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client only — uses the service role key so cron jobs and
// admin actions can write deals. Never expose this key to the browser.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export type Deal = {
  id: string;
  title: string;
  image_url: string;
  source: "amazon" | "manual" | "twitter_queue";
  source_ref: string | null;
  original_price: number | null;
  sale_price: number;
  discount_pct: number | null;
  affiliate_url: string;
  category: string | null;
  status: "live" | "expired" | "pending_review";
  posted_at: string;
  expires_at: string | null;
};
