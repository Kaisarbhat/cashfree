import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { name1, name2 } = await req.json();

    if (!name1 || !name2) {
      return NextResponse.json({ error: "name1 and name2 are required" }, { status: 400 });
    }

    const data = await cashfreePost("/v2/verification/name-match", {
      name1,
      name2,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
