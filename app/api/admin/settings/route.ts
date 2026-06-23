import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    await updateSettings({
      discordWebhookUrls: Array.isArray(body.discordWebhookUrls)
        ? body.discordWebhookUrls
        : undefined,
      searchKeywords: Array.isArray(body.searchKeywords) ? body.searchKeywords : undefined,
      minSavingPercent:
        typeof body.minSavingPercent === "number" ? body.minSavingPercent : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to save" }, { status: 500 });
  }
}
