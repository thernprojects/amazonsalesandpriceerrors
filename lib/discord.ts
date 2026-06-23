import type { Deal } from "./supabase";

// Comma-separated list of webhook URLs in env, e.g.
// DISCORD_WEBHOOK_URLS="https://discord.com/api/webhooks/aaa,https://discord.com/api/webhooks/bbb"
function getWebhookUrls(): string[] {
  const raw = process.env.DISCORD_WEBHOOK_URLS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

export async function postDealToDiscord(deal: Deal): Promise<void> {
  const urls = getWebhookUrls();
  if (urls.length === 0) return;

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
    urls.map((url) =>
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
