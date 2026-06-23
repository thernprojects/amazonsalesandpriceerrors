import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function AdminSettingsPage() {
  // Defense in depth: middleware already redirected anyone without a
  // plausible cookie, this re-checks the HMAC signature on the Node
  // runtime before rendering anything admin-only.
  if (!isAdminRequest()) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream">Settings</h1>
        <LogoutButton />
      </div>

      <section className="mb-6 rounded-tag border border-line bg-inkRaised p-5">
        <h2 className="font-body text-sm font-semibold text-cream">Deal sourcing</h2>
        <p className="mt-1 font-body text-xs text-slate">
          Search keywords and minimum discount % live in the cron route for now
          (app/api/cron/fetch-amazon-deals/route.ts). Wiring these to editable
          fields here is the natural next step once the basic pipeline is
          confirmed working.
        </p>
      </section>

      <section className="mb-6 rounded-tag border border-line bg-inkRaised p-5">
        <h2 className="font-body text-sm font-semibold text-cream">Discord webhooks</h2>
        <p className="mt-1 font-body text-xs text-slate">
          Managed via the DISCORD_WEBHOOK_URLS environment variable (comma
          separated). Every new live deal posts to all of them automatically.
        </p>
      </section>

      <section className="rounded-tag border border-line bg-inkRaised p-5">
        <h2 className="font-body text-sm font-semibold text-cream">Pending review queue</h2>
        <p className="mt-1 font-body text-xs text-slate">
          Twitter-sourced submissions land here with status &quot;pending_review&quot;
          before going live. Not wired up to a UI yet — flag if you want this
          built next.
        </p>
      </section>
    </main>
  );
}
