import { redirect } from "next/navigation";
import Link from "next/link";
import { createElement as h } from "react";
import { isAdminRequest } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import NewDealForm from "@/components/NewDealForm";

export default function NewDealPage() {
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
      h("h1", { className: "font-display text-2xl text-cream" }, "New deal"),
      h(
        Link,
        { href: "/admin/settings", className: "font-body text-xs text-slate underline" },
        "Settings"
        )
      ),
    h(LogoutButton, null)
    ),
  h(NewDealForm, null)
  );
}
