/**
* Generic product metadata scraper.
*
* Works for Amazon, Newegg, and most retailers because they all set
* Open Graph meta tags (og:title, og:image) for link-preview purposes.
* No retailer-specific API needed.
*/

export type ScrapedProduct = {
  title: string | null;
  imageUrl: string | null;
};

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");
}

export async function scrapeProductMetadata(url: string): Promise<ScrapedProduct> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

if (!response.ok) {
  throw new Error(`Failed to fetch product page (${response.status})`);
}

const html = await response.text();

const title =
  extractMetaContent(html, "og:title") ??
  html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ??
  null;

const imageUrl =
  extractMetaContent(html, "og:image") ??
  html.match(/"hiRes":"([^"]+)"/)?.[1] ??
  html.match(/"large":"([^"]+)"/)?.[1] ??
  null;

return {
  title: title ? decodeHtmlEntities(title) : null,
  imageUrl,
};
}
