export type ParsedDeal = {
  title: string | null;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  promoCode: string | null;
};

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT = "You extract structured deal data from raw, messy text. Return ONLY a JSON object with exactly these keys, no markdown fences: title (string or null), price (number or null, no dollar sign), originalPrice (number or null), imageUrl (string or null, only a direct image URL), sourceUrl (string or null, a product page URL), promoCode (string or null). Use null for missing fields, do not invent values. Text to parse: ";

export async function parseDealText(rawText: string): Promise<ParsedDeal> {
  const apiKey = process.env.GEMINI_API_KEY!;

const response = await fetch(GEMINI_ENDPOINT + "?key=" + apiKey, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: PROMPT + rawText }] }],
    generationConfig: { responseMimeType: "application/json" },
  }),
});

if (!response.ok) {
  const errBody = await response.text();
  throw new Error("Gemini request failed (" + response.status + "): " + errBody);
}

const data = await response.json();
  const textOut: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!textOut) {
  throw new Error("Gemini returned no parseable content");
}

let parsed: any;
  try {
    parsed = JSON.parse(textOut);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

return {
  title: parsed.title ?? null,
  price: typeof parsed.price === "number" ? parsed.price : null,
  originalPrice: typeof parsed.originalPrice === "number" ? parsed.originalPrice : null,
  imageUrl: parsed.imageUrl ?? null,
  sourceUrl: parsed.sourceUrl ?? null,
  promoCode: parsed.promoCode ?? null,
};
}
