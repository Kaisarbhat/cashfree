import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { mobile, period = "LAST_6_MONTHS" } = await req.json();

    if (!mobile) {
      return NextResponse.json({ error: "mobile is required" }, { status: 400 });
    }

    const data = await cashfreePost("/v2/verification/account-aggregator/consent", {
      mobile,
      consent_types: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
      fi_types: ["DEPOSIT"],
      date_range: period,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
