import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/deals?sort=discount_desc|discount_asc|price_asc|price_desc&category=...
export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") ?? "discount_desc";
  const category = req.nextUrl.searchParams.get("category");

  let query = supabase.from("deals").select("*").eq("status", "live");

  if (category) {
    query = query.eq("category", category);
  }

  switch (sort) {
    case "discount_asc":
      query = query.order("discount_pct", { ascending: true, nullsFirst: true });
      break;
    case "price_asc":
      query = query.order("sale_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("sale_price", { ascending: false });
      break;
    case "discount_desc":
    default:
      query = query.order("discount_pct", { ascending: false, nullsFirst: false });
      break;
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deals: data });
}
