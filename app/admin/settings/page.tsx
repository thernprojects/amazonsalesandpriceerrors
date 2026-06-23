import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import SettingsForm from "@/components/SettingsForm";

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

      <SettingsForm />

      <p className="mt-6 font-body text-xs text-slate">
        Amazon PA-API keys and the cron secret are set in Vercel&apos;s
        environment variables, not here — those are credentials, not
        day-to-day settings.
      </p>
    </main>
  );
}
