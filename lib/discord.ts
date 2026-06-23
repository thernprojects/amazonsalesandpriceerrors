import type { Deal } from "./supabase";

export async function postDealToDiscord(deal: Deal, webhookUrls: string[]): Promise<void> {
  if (webhookUrls.length === 0) return;

  const discountLine = deal.discount_pct
    ? `**${deal.discount_pct}% off**${
        deal.original_price ? ` ~~$${deal.original_price.toFixed(2)}~~` : ""
      } → **$${deal.sale_price.toFixed(2)}**`
    : `**$${deal.sale_price.toFixed(2)}**`;

  const embed = {
    title: deal.title,
    url: deal.affiliate_url,
    description: discountLine,
    color: 0xff5a36,
    image: { url: deal.image_url },
    footer: { text: "Silky's Deals and Steals" },
    timestamp: new Date(deal.posted_at).toISOString(),
  };

  const body = JSON.stringify({
    content: `🔥 New deal: ${deal.title}`,
    embeds: [embed],
  });

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
