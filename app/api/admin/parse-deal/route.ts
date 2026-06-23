import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { parseDealText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

try {
  const parsed = await parseDealText(text);
  return NextResponse.json(parsed);
} catch (err: any) {
  return NextResponse.json(
    { error: err.message ?? "Failed to parse with AI" },
    { status: 500 }
    );
}
}
