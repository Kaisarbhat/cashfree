import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { pan, dob } = await req.json();

    if (!pan) {
      return NextResponse.json({ error: "pan is required" }, { status: 400 });
    }

    const body: Record<string, string> = { pan };
    if (dob) body.dob = dob;

    const data = await cashfreePost("/v2/verification/pan/360", body);

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
