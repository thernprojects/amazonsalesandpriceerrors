import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { scrapeProductMetadata } from "@/lib/scrape-metadata";

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

try {
  const metadata = await scrapeProductMetadata(url);
  return NextResponse.json(metadata);
} catch (err: any) {
  return NextResponse.json(
    { error: err.message ?? "Failed to fetch product info" },
    { status: 500 }
    );
}
}
