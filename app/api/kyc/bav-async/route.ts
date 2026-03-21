import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { account_number, ifsc, name, reference_id } = await req.json();

    if (!account_number || !ifsc) {
      return NextResponse.json(
        { error: "account_number and ifsc are required" },
        { status: 400 }
      );
    }

    const body: Record<string, string> = {
      account_number,
      ifsc,
      reference_id: reference_id || `bav-${Date.now()}`,
    };
    if (name) body.name = name;

    const data = await cashfreePost("/v2/verification/bank-account/async", body);

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
