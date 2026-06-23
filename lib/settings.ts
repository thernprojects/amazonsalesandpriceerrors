import { supabase } from "./supabase";

export type AppSettings = {
  discordWebhookUrls: string[];
  searchKeywords: string[];
  minSavingPercent: number;
};

const DEFAULTS: AppSettings = {
  discordWebhookUrls: [],
  searchKeywords: ["clearance", "deal of the day"],
  minSavingPercent: 25,
};

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase.from("app_settings").select("key, value");

  if (error || !data) return DEFAULTS;

  const map = new Map(data.map((row) => [row.key, row.value]));

  const webhookRaw = map.get("discord_webhook_urls") ?? "";
  const keywordsRaw = map.get("search_keywords") ?? "";
  const minSavingRaw = map.get("min_saving_percent") ?? "";

  return {
    discordWebhookUrls: webhookRaw
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean),
    searchKeywords: keywordsRaw
      ? keywordsRaw
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : DEFAULTS.searchKeywords,
    minSavingPercent: minSavingRaw ? Number(minSavingRaw) : DEFAULTS.minSavingPercent,
  };
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<void> {
  const rows: { key: string; value: string }[] = [];

  if (partial.discordWebhookUrls !== undefined) {
    rows.push({ key: "discord_webhook_urls", value: partial.discordWebhookUrls.join(",") });
  }
  if (partial.searchKeywords !== undefined) {
    rows.push({ key: "search_keywords", value: partial.searchKeywords.join(",") });
  }
  if (partial.minSavingPercent !== undefined) {
    rows.push({ key: "min_saving_percent", value: String(partial.minSavingPercent) });
  }

  if (rows.length === 0) return;

  const { error } = await supabase.from("app_settings").upsert(rows);
  if (error) throw error;
}
