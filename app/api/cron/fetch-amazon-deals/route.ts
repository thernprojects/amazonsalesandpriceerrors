import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchAmazonDeals } from "@/lib/amazon-paapi";
import { postDealToDiscord } from "@/lib/discord";
import { getSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  // Vercel Cron sends a secret in the Authorization header — set
  // CRON_SECRET in env and in your vercel.json cron config to match.
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettings();
  const newDeals = [];

  for (const keywords of settings.searchKeywords) {
    try {
      const items = await searchAmazonDeals(keywords, settings.minSavingPercent);

      for (const item of items) {
        // Skip if we've already posted this ASIN recently.
        const { data: existing } = await supabase
          .from("deals")
          .select("id")
          .eq("source", "amazon")
          .eq("source_ref", item.asin)
          .gte("posted_at", new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString())
          .maybeSingle();

        if (existing) continue;

        const { data: inserted, error } = await supabase
          .from("deals")
          .insert({
            title: item.title,
            image_url: item.imageUrl,
            source: "amazon",
            source_ref: item.asin,
            original_price: item.originalPrice,
            sale_price: item.price,
            discount_pct: item.discountPct,
            affiliate_url: item.affiliateUrl,
            status: "live",
          })
          .select()
          .single();

        if (error) {
          console.error("Insert failed:", error);
          continue;
        }

        newDeals.push(inserted);
        await postDealToDiscord(inserted, settings.discordWebhookUrls);
      }
    } catch (err) {
      console.error(`PA-API search failed for "${keywords}":`, err);
    }
  }

  return NextResponse.json({ inserted: newDeals.length });
}
