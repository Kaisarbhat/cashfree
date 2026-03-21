import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { customer_name, customer_mobile, document_type = "AADHAAR", agent_mode = false } = await req.json();

    if (!customer_name || !customer_mobile) {
      return NextResponse.json(
        { error: "customer_name and customer_mobile are required" },
        { status: 400 }
      );
    }

    const endpoint = agent_mode
      ? "/v2/verification/vkyc/agent/create"
      : "/v2/verification/vkyc/create";

    const data = await cashfreePost(endpoint, {
      customer_name,
      customer_mobile,
      document_type,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
