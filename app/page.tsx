import LiveDealsFeed from "@/components/LiveDealsFeed";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-coral">Clearance rack, online</p>
        <h1 className="mt-1 font-display text-3xl text-cream sm:text-4xl">
          Silky&apos;s Deals and Steals
        </h1>
        <p className="mt-2 max-w-xl font-body text-sm text-slate">
          Real markdowns, pulled straight from the source the moment they drop.
        </p>
      </header>

      <LiveDealsFeed />
    </main>
  );
}
