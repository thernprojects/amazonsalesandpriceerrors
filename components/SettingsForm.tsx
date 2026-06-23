"use client";

import { useEffect, useState } from "react";

export default function SettingsForm() {
  const [discordWebhookUrls, setDiscordWebhookUrls] = useState("");
  const [searchKeywords, setSearchKeywords] = useState("");
  const [minSavingPercent, setMinSavingPercent] = useState(25);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setDiscordWebhookUrls((data.discordWebhookUrls ?? []).join(", "));
        setSearchKeywords((data.searchKeywords ?? []).join(", "));
        setMinSavingPercent(data.minSavingPercent ?? 25);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discordWebhookUrls: discordWebhookUrls
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        searchKeywords: searchKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        minSavingPercent: Number(minSavingPercent),
      }),
    });

    setSaving(false);
    setMessage(res.ok ? "Saved." : "Something went wrong saving — try again.");
  }

  if (loading) {
    return <p className="font-body text-sm text-slate">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-tag border border-line bg-inkRaised p-5">
        <h2 className="font-body text-sm font-semibold text-cream">Discord webhooks</h2>
        <p className="mt-1 mb-3 font-body text-xs text-slate">
          Every new live deal posts to all of these. Comma-separated.
        </p>
        <textarea
          value={discordWebhookUrls}
          onChange={(e) => setDiscordWebhookUrls(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          rows={3}
          className="w-full rounded-tag border border-line bg-ink px-3 py-2 font-mono text-xs text-cream outline-none focus:border-coral"
        />
      </section>

      <section className="rounded-tag border border-line bg-inkRaised p-5">
        <h2 className="font-body text-sm font-semibold text-cream">Search keywords</h2>
        <p className="mt-1 mb-3 font-body text-xs text-slate">
          What the bot searches Amazon for on each run. Comma-separated.
        </p>
        <input
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          placeholder="clearance, lightning deal"
          className="w-full rounded-tag border border-line bg-ink px-3 py-2 font-body text-sm text-cream outline-none focus:border-coral"
        />
      </section>

      <section className="rounded-tag border border-line bg-inkRaised p-5">
        <h2 className="font-body text-sm font-semibold text-cream">Minimum discount %</h2>
        <p className="mt-1 mb-3 font-body text-xs text-slate">
          Only pull items discounted by at least this much.
        </p>
        <input
          type="number"
          value={minSavingPercent}
          onChange={(e) => setMinSavingPercent(Number(e.target.value))}
          className="w-32 rounded-tag border border-line bg-ink px-3 py-2 font-body text-sm text-cream outline-none focus:border-coral"
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-tag bg-coral px-4 py-2 font-body text-sm font-semibold text-ink transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message ? <span className="font-body text-xs text-slate">{message}</span> : null}
      </div>
    </div>
  );
}
