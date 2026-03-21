import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { aadhaar_number, consent = "Y" } = await req.json();

    if (!aadhaar_number) {
      return NextResponse.json({ error: "aadhaar_number is required" }, { status: 400 });
    }

    const data = await cashfreePost("/v2/verification/aadhaar/otp", {
      aadhaar_number,
      consent,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
