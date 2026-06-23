import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { postDealToDiscord } from "@/lib/discord";
import { getSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

const body = await req.json();
  const { title, price, originalPrice, promoCode, affiliateUrl, imageUrl } = body;

if (!title || !price || !affiliateUrl) {
  return NextResponse.json(
    { error: "title, price, and affiliateUrl are required" },
    { status: 400 }
    );
}

const discountPct =
  originalPrice && originalPrice > price
  ? Math.round(((originalPrice - price) / originalPrice) * 100)
  : null;

const { data: inserted, error } = await supabase
  .from("deals")
  .insert({
    title,
    image_url: imageUrl || "",
    source: "manual",
    original_price: originalPrice || null,
    sale_price: price,
    discount_pct: discountPct,
    affiliate_url: affiliateUrl,
    status: "live",
  })
  .select()
  .single();

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

const settings = await getSettings();

try {
  await postDealToDiscord(
    {
      title,
      price,
      originalPrice: originalPrice || null,
      affiliateUrl,
      promoCode: promoCode || null,
      imageUrl: imageUrl || null,
    },
    settings.discordWebhookUrls
    );
} catch (err: any) {
  return NextResponse.json(
    { deal: inserted, discordError: err.message ?? "Failed to post to Discord" },
    { status: 207 }
    );
}

return NextResponse.json({ deal: inserted });
}
