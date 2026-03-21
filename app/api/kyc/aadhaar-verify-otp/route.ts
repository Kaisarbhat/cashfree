import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { ref_id, otp } = await req.json();

    if (!ref_id || !otp) {
      return NextResponse.json({ error: "ref_id and otp are required" }, { status: 400 });
    }

    const data = await cashfreePost("/v2/verification/aadhaar/otp/verify", {
      ref_id,
      otp,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
