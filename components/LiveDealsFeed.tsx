"use client";

import { useEffect, useState } from "react";
import DealCard from "./DealCard";
import type { Deal } from "@/lib/supabase";

const SORT_OPTIONS = [
  { value: "discount_desc", label: "Highest discount" },
  { value: "discount_asc", label: "Lowest discount" },
  { value: "price_asc", label: "Lowest price" },
  { value: "price_desc", label: "Highest price" },
] as const;

export default function LiveDealsFeed() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sort, setSort] = useState<string>("discount_desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/deals?sort=${sort}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDeals(data.deals ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sort]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulseDot rounded-full bg-coral" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            Live deals
          </span>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-tag border border-line bg-inkRaised px-3 py-2 font-body text-sm text-cream outline-none focus:border-coral"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="font-body text-sm text-slate">Loading deals…</p>
      ) : deals.length === 0 ? (
        <p className="font-body text-sm text-slate">
          Nothing live right now. Check back soon, deals get pulled in as they drop.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
