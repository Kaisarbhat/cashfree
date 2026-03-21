import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { ifsc } = await req.json();

    if (!ifsc) {
      return NextResponse.json({ error: "ifsc is required" }, { status: 400 });
    }

    const data = await cashfreePost("/v2/verification/ifsc", { ifsc });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
