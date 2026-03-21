import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const selfie = formData.get("selfie") as File | null;
    const docImg = formData.get("document") as File | null;

    if (!selfie || !docImg) {
      return NextResponse.json(
        { error: "selfie and document images are required" },
        { status: 400 }
      );
    }

    const [selfieBytes, docBytes] = await Promise.all([
      selfie.arrayBuffer(),
      docImg.arrayBuffer(),
    ]);

    const selfieB64 = Buffer.from(selfieBytes).toString("base64");
    const docB64 = Buffer.from(docBytes).toString("base64");

    const data = await cashfreePost("/v2/verification/face/match", {
      selfie_image: selfieB64,
      id_image: docB64,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
