/**
 * Amazon Creators API client.
 *
 * Amazon retired the old Product Advertising API (PA-API 5, AWS-signature
 * auth) on May 15, 2026. This replaces it with the Creators API, which uses
 * OAuth2 client-credentials auth instead of AWS Sig V4.
 *
 * Your credentials show as Version 3.1 in Associates Central, which means
 * the Login-with-Amazon (LWA) auth path, not the older Cognito path (2.x).
 * If Associates Central ever shows you a 2.x credential instead, the token
 * endpoint and request shape both change — see Amazon's Creators API docs.
 */

const TOKEN_ENDPOINT = "https://api.amazon.com/auth/o2/token"; // v3.1 = NA region
const CATALOG_HOST = "https://creatorsapi.amazon"; // yes, the .amazon TLD is real
const SEARCH_PATH = "/catalog/v1/searchItems";

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

// Cached in module scope — helps when multiple searches happen within the
// same warm serverless invocation. Each cold start just fetches a new one.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const clientId = process.env.AMAZON_CREATORS_CLIENT_ID!;
  const clientSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET!;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "creatorsapi::default",
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Creators API token request failed (${response.status}): ${errBody}`);
  }

  const data: TokenResponse = await response.json();
  cachedToken = {
    value: data.access_token,
    // 60-second safety buffer so we never use a token that's about to expire mid-request.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export type AmazonDealItem = {
  asin: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice: number | null;
  discountPct: number | null;
  affiliateUrl: string;
};

export async function searchAmazonDeals(
  keywords: string,
  minSavingPercent = 20
): Promise<AmazonDealItem[]> {
  const partnerTag = process.env.AMAZON_ASSOCIATES_TAG!;
  const token = await getAccessToken();

  const response = await fetch(`${CATALOG_HOST}${SEARCH_PATH}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-marketplace": "www.amazon.com",
    },
    body: JSON.stringify({
      keywords,
      searchIndex: "All",
      itemCount: 10,
      partnerTag,
      partnerType: "Associates",
      marketplace: "www.amazon.com",
      resources: [
        "images.primary.large",
        "itemInfo.title",
        "offersV2.listings.price",
        "offersV2.listings.savingBasis",
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Creators API search failed (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const items = data?.searchResult?.items ?? [];

  return items
    .map((item: any): AmazonDealItem | null => {
      const listing = item?.offersV2?.listings?.[0];
      const price = listing?.price?.amount;
      const savingBasis = listing?.savingBasis?.amount;
      if (!price) return null;

      const discountPct = savingBasis
        ? Math.round(((savingBasis - price) / savingBasis) * 100)
        : null;

      // Filtered here rather than trusting a request-side savings filter,
      // since Amazon's docs for this field on Creators API aren't settled yet.
      if (discountPct !== null && discountPct < minSavingPercent) return null;

      return {
        asin: item.asin,
        title: item?.itemInfo?.title?.displayValue ?? "Untitled item",
        imageUrl: item?.images?.primary?.large?.url ?? "",
        price,
        originalPrice: savingBasis ?? null,
        discountPct,
        affiliateUrl: `https://www.amazon.com/dp/${item.asin}?tag=${partnerTag}`,
      };
    })
    .filter((item: AmazonDealItem | null): item is AmazonDealItem => item !== null);
}
