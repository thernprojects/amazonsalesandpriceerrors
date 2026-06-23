import type { Deal } from "./supabase";

export type DiscordDealInput = {
  title: string;
  price: number;
  originalPrice?: number | null;
  affiliateUrl: string;
  promoCode?: string | null;
  imageUrl?: string | null;
};

function buildMessageContent(deal: DiscordDealInput): string {
  const priceLine = deal.originalPrice
  ? `${deal.title} ~ Now $${deal.price.toFixed(2)} (Was $${deal.originalPrice.toFixed(2)})`
    : `${deal.title} ~ Now $${deal.price.toFixed(2)}`;

const lines = [priceLine, "", deal.affiliateUrl];

if (deal.promoCode) {
  lines.push(`~ Promo: ${deal.promoCode}`);
}

if (deal.imageUrl) {
  lines.push("", deal.imageUrl);
}

return lines.join("\n");
}

export async function postDealToDiscord(
  deal: DiscordDealInput,
  webhookUrls: string[]
  ): Promise<void> {
  if (webhookUrls.length === 0) return;

const body = JSON.stringify({ content: buildMessageContent(deal) });

await Promise.all(
  webhookUrls.map((url) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }).catch((err) => {
      console.error(`Discord webhook post failed for ${url}:`, err);
    })
                  )
  );
}

export async function postDbDealToDiscord(deal: Deal, webhookUrls: string[]): Promise<void> {
  await postDealToDiscord(
    {
      title: deal.title,
      price: deal.sale_price,
      originalPrice: deal.original_price,
      affiliateUrl: deal.affiliate_url,
      imageUrl: deal.image_url,
    },
    webhookUrls
    );
}
