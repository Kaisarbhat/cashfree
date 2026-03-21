import { NextResponse } from "next/server";

export async function GET() {
  const id = process.env.CASHFREE_CLIENT_ID;
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  const env = process.env.CASHFREE_ENV ?? "sandbox";

  const credentialsSet = !!(
    id && id !== "your_sandbox_client_id_here" &&
    secret && secret !== "your_sandbox_client_secret_here"
  );

  const base = env === "production"
    ? "https://api.cashfree.com/verification"
    : "https://sandbox.cashfree.com/verification";

  let cashfreeReachable = false;
  let pingError = "";

  if (credentialsSet) {
    try {
      // Lightweight ping — IFSC is the cheapest API call, often free
      const res = await fetch(`${base}/v2/verification/ifsc`, {
        method: "POST",
        headers: {
          "x-client-id": id!,
          "x-client-secret": secret!,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ifsc: "HDFC0000001" }),
      });
      cashfreeReachable = res.status !== 401 && res.status !== 403;
      if (!cashfreeReachable) {
        const body = await res.json().catch(() => ({}));
        pingError = body?.message ?? `HTTP ${res.status}`;
      }
    } catch (e) {
      pingError = e instanceof Error ? e.message : "Network error";
    }
  }

  return NextResponse.json({
    credentials_set: credentialsSet,
    environment: env,
    base_url: base,
    cashfree_reachable: cashfreeReachable,
    ping_error: pingError || null,
  });
}
