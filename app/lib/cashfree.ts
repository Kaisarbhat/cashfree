// lib/cashfree.ts
// Server-only — never import this from client components

const BASE =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/verification"
    : "https://sandbox.cashfree.com/verification";

function getHeaders(): HeadersInit {
  const id = process.env.CASHFREE_CLIENT_ID;
  const secret = process.env.CASHFREE_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error(
      "Missing CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET in environment variables. " +
        "Copy .env.local.example to .env.local and fill in your sandbox credentials."
    );
  }

  return {
    "x-client-id": id,
    "x-client-secret": secret,
    "x-api-version": "2023-08-01",
    "Content-Type": "application/json",
  };
}

export async function cashfreePost<T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Cashfree API error: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function cashfreeGet<T = unknown>(path: string): Promise<T> {
  const headers = getHeaders() as Record<string, string>;
  // GET requests don't need Content-Type
  delete headers["Content-Type"];

  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Cashfree API error: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
