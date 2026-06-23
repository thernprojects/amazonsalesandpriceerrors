import { redirect } from "next/navigation";
import Link from "next/link";
import { createElement as h } from "react";
import { isAdminRequest } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import SettingsForm from "@/components/SettingsForm";

export default function AdminSettingsPage() {
  if (!isAdminRequest()) {
    redirect("/admin");
  }

return h(
  "main",
  { className: "mx-auto max-w-2xl px-4 py-10" },
  h(
    "div",
    { className: "mb-8 flex items-center justify-between" },
    h(
      "div",
      null,
      h("h1", { className: "font-display text-2xl text-cream" }, "Settings"),
      h(
        Link,
        { href: "/admin/new-deal", className: "font-body text-xs text-slate underline" },
        "New deal"
        )
      ),
    h(LogoutButton, null)
    ),
  h(SettingsForm, null),
  h(
    "p",
    { className: "mt-6 font-body text-xs text-slate" },
    "Amazon Creators API keys and the cron secret are set in Vercel's environment variables, not here."
    )
  );
}
