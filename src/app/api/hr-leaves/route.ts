import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase.from("hr_leaves").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, start_date, end_date, type, substitute_user_id } = body;

  const { data, error } = await supabase.from("hr_leaves").insert([
    { user_id, start_date, end_date, type, substitute_user_id, status: "pending" },
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, start_date, end_date, type, status, substitute_user_id } = body;

  const { data, error } = await supabase
    .from("hr_leaves")
    .update({ start_date, end_date, type, status, substitute_user_id })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body;

  const { data, error } = await supabase.from("hr_leaves").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
