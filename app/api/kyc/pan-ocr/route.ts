import { NextRequest, NextResponse } from "next/server";
import { cashfreePost } from "../../../lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "image file is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Determine media type
    const isJpeg = file.type === "image/jpeg" || file.type === "image/jpg";
    const isPng = file.type === "image/png";
    const isPdf = file.type === "application/pdf";

    let docType = "jpg";
    if (isPng) docType = "png";
    if (isPdf) docType = "pdf";

    const data = await cashfreePost("/v2/verification/ocr", {
      doc1: base64,
      doc1_type: docType,
      document_type: "pan",
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
