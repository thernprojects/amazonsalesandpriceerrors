"use client";

import { useState } from "react";
import { createElement as h } from "react";

export default function NewDealForm() {
  const [productUrl, setProductUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null as string | null);

async function handleFetchInfo() {
  if (!productUrl) return;
  setFetching(true);
  setMessage(null);
  const res = await fetch("/api/admin/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: productUrl }),
  });
  const data = await res.json();
  setFetching(false);
  if (!res.ok) {
    setMessage(data.error || "Could not fetch that link, fill in manually.");
    return;
  }
  if (data.title) setTitle(data.title);
  if (data.imageUrl) setImageUrl(data.imageUrl);
  if (!affiliateUrl) setAffiliateUrl(productUrl);
}

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSubmitting(true);
  setMessage(null);
  const res = await fetch("/api/admin/create-deal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      promoCode: promoCode || null,
      affiliateUrl,
      imageUrl: imageUrl || null,
    }),
  });
  const data = await res.json();
  setSubmitting(false);
  if (res.status === 207) {
    setMessage("Saved, but Discord post failed: " + data.discordError);
  } else if (!res.ok) {
    setMessage(data.error || "Something went wrong.");
  } else {
    setMessage("Posted to Discord and saved.");
    setTitle("");
    setImageUrl("");
    setPrice("");
    setOriginalPrice("");
    setPromoCode("");
    setAffiliateUrl("");
    setProductUrl("");
  }
}

const inputClass = "w-full rounded-tag border border-line bg-ink px-3 py-2 font-body text-sm text-cream outline-none focus:border-coral";
  const monoInputClass = "w-full rounded-tag border border-line bg-ink px-3 py-2 font-mono text-xs text-cream outline-none focus:border-coral";
  const labelClass = "mb-1 block font-body text-xs text-slate";

return h(
  "div",
  { className: "space-y-6" },
  h(
    "section",
    { className: "rounded-tag border border-line bg-inkRaised p-5" },
    h("h2", { className: "font-body text-sm font-semibold text-cream" }, "1. Paste the product link"),
    h(
      "p",
      { className: "mt-1 mb-3 font-body text-xs text-slate" },
      "Works for Amazon, Newegg, and most retailers. Pulls the title and main photo automatically."
      ),
    h(
      "div",
      { className: "flex gap-2" },
      h("input", {
        value: productUrl,
        onChange: (e: any) => setProductUrl(e.target.value),
        placeholder: "https://www.amazon.com/dp/...",
        className: "flex-1 " + inputClass,
      }),
      h(
        "button",
        {
          type: "button",
          onClick: handleFetchInfo,
          disabled: fetching || !productUrl,
          className: "whitespace-nowrap rounded-tag bg-gold px-4 py-2 font-body text-sm font-semibold text-ink transition disabled:opacity-50",
        },
        fetching ? "Fetching..." : "Fetch info"
        )
      )
    ),
  h(
    "form",
    { onSubmit: handleSubmit, className: "space-y-6" },
    h(
      "section",
      { className: "rounded-tag border border-line bg-inkRaised p-5" },
      h("h2", { className: "mb-3 font-body text-sm font-semibold text-cream" }, "2. Fill in the deal"),
      h(
        "div",
        { className: "space-y-3" },
        h(
          "div",
          null,
          h("label", { className: labelClass }, "Title"),
          h("input", {
            value: title,
            onChange: (e: any) => setTitle(e.target.value),
            required: true,
            className: inputClass,
          })
          ),
        h(
          "div",
          { className: "grid grid-cols-2 gap-3" },
          h(
            "div",
            null,
            h("label", { className: labelClass }, "Now price"),
            h("input", {
              type: "number",
              step: "0.01",
              value: price,
              onChange: (e: any) => setPrice(e.target.value),
              required: true,
              className: inputClass,
            })
            ),
          h(
            "div",
            null,
            h("label", { className: labelClass }, "Was price (optional)"),
            h("input", {
              type: "number",
              step: "0.01",
              value: originalPrice,
              onChange: (e: any) => setOriginalPrice(e.target.value),
              className: inputClass,
            })
            )
          ),
        h(
          "div",
          null,
          h("label", { className: labelClass }, "Promo code (optional)"),
          h("input", {
            value: promoCode,
            onChange: (e: any) => setPromoCode(e.target.value),
            className: inputClass,
          })
          ),
        h(
          "div",
          null,
          h("label", { className: labelClass }, "Affiliate link"),
          h("input", {
            value: affiliateUrl,
            onChange: (e: any) => setAffiliateUrl(e.target.value),
            required: true,
            className: monoInputClass,
          })
          ),
        h(
          "div",
          null,
          h("label", { className: labelClass }, "Image URL"),
          h("input", {
            value: imageUrl,
            onChange: (e: any) => setImageUrl(e.target.value),
            className: monoInputClass,
          }),
          imageUrl
          ? h("img", {
            src: imageUrl,
            alt: "",
            className: "mt-2 h-32 w-32 rounded-tag object-contain bg-cream",
          })
          : null
          )
        )
      ),
    h(
      "div",
      { className: "flex items-center gap-3" },
      h(
        "button",
        {
          type: "submit",
          disabled: submitting,
          className: "rounded-tag bg-coral px-4 py-2 font-body text-sm font-semibold text-ink transition disabled:opacity-50",
        },
        submitting ? "Posting..." : "Post deal to Discord"
        ),
      message ? h("span", { className: "font-body text-xs text-slate" }, message) : null
      )
    )
  );
}
