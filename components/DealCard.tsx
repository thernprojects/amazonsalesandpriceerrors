import Image from "next/image";
import type { Deal } from "@/lib/supabase";

export default function DealCard({ deal }: { deal: Deal }) {
  return (
    <a
      href={deal.affiliate_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="tag-notch group block rotate-[-0.6deg] rounded-tag border border-line bg-inkRaised p-4 transition hover:-translate-y-1 hover:rotate-0 hover:border-coral/60"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-[4px] bg-cream">
        <Image
          src={deal.image_url}
          alt={deal.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain"
        />
        {deal.discount_pct ? (
          <div className="absolute right-2 top-2 flex h-12 w-12 -rotate-12 items-center justify-center rounded-full bg-coral font-display text-[11px] leading-none text-cream shadow-md">
            -{deal.discount_pct}%
          </div>
        ) : null}
      </div>

      <p className="line-clamp-2 font-body text-sm font-medium text-cream">{deal.title}</p>

      <div className="mt-2 flex items-baseline gap-2 font-mono">
        <span className="text-lg font-semibold text-gold">${deal.sale_price.toFixed(2)}</span>
        {deal.original_price ? (
          <span className="text-xs text-slate line-through">
            ${deal.original_price.toFixed(2)}
          </span>
        ) : null}
      </div>
    </a>
  );
}
