"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-tag border border-line px-3 py-1.5 font-body text-xs text-slate transition hover:border-coral hover:text-coral"
    >
      Log out
    </button>
  );
}
