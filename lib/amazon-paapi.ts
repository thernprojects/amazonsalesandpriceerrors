import crypto from "crypto";

/**
 * Minimal PA-API 5 (SearchItems) client.
 *
 * Requires a qualifying Associates account (recent sales) to get PA-API
 * credentials from https://webservices.amazon.com/paapi5/documentation/
 *
 * PA-API doesn't expose a literal "lightning deals" feed, but SearchItems
 * supports MinSavingPercent, which is the legitimate way to pull items
 * that are currently discounted by at least X% — effectively a clearance
 * filter straight from Amazon's own data.
 */

const HOST = "webservices.amazon.com";
const REGION = "us-east-1";
const SERVICE = "ProductAdvertisingAPI";
const PATH = "/paapi5/searchitems";
const TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";

function hmac(key: Buffer | string, data: string) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string) {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function getAmzDate() {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function signRequest(payload: string) {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY!;
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY!;

  const amzDate = getAmzDate();
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${TARGET}\n`;
  const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest = [
    "POST",
    PATH,
    "",
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join("\n");

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString("hex");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { amzDate, authorizationHeader };
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

  const payload = JSON.stringify({
    Keywords: keywords,
    MinSavingPercent: minSavingPercent,
    SearchIndex: "All",
    ItemCount: 10,
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.com",
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
    ],
  });

  const { amzDate, authorizationHeader } = signRequest(payload);

  const response = await fetch(`https://${HOST}${PATH}`, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: HOST,
      "x-amz-date": amzDate,
      "x-amz-target": TARGET,
      Authorization: authorizationHeader,
    },
    body: payload,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`PA-API request failed (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const items = data?.SearchResult?.Items ?? [];

  return items
    .map((item: any): AmazonDealItem | null => {
      const listing = item?.Offers?.Listings?.[0];
      const price = listing?.Price?.Amount;
      const savingBasis = listing?.SavingBasis?.Amount;
      if (!price) return null;

      const discountPct = savingBasis
        ? Math.round(((savingBasis - price) / savingBasis) * 100)
        : null;

      return {
        asin: item.ASIN,
        title: item?.ItemInfo?.Title?.DisplayValue ?? "Untitled item",
        imageUrl: item?.Images?.Primary?.Large?.URL ?? "",
        price,
        originalPrice: savingBasis ?? null,
        discountPct,
        // Build the affiliate link directly rather than relying on Amazon's
        // returned DetailPageURL, so we know the tag is always correct.
        affiliateUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${partnerTag}`,
      };
    })
    .filter((item: AmazonDealItem | null): item is AmazonDealItem => item !== null);
}
