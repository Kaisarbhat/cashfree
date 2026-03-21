// app/lib/api.ts — calls NestJS backend at NEXT_PUBLIC_API_URL

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type ApiResult<T = unknown> =
  | { ok: true; data: T; raw: string }
  | { ok: false; error: string; raw: string };

async function kycPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}/kyc/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const raw = JSON.stringify(
      { endpoint: `POST /api/kyc/${path}`, status: res.status, response: data },
      null,
      2,
    );
    if (!res.ok)
      return {
        ok: false,
        error: data?.message ?? data?.error ?? `HTTP ${res.status}`,
        raw,
      };
    return { ok: true, data: data as T, raw };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      ok: false,
      error: msg,
      raw: JSON.stringify({ error: msg }, null, 2),
    };
  }
}

async function kycForm<T>(path: string, form: FormData): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}/kyc/${path}`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    const raw = JSON.stringify(
      { endpoint: `POST /api/kyc/${path}`, status: res.status, response: data },
      null,
      2,
    );
    if (!res.ok)
      return {
        ok: false,
        error: data?.message ?? data?.error ?? `HTTP ${res.status}`,
        raw,
      };
    return { ok: true, data: data as T, raw };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      ok: false,
      error: msg,
      raw: JSON.stringify({ error: msg }, null, 2),
    };
  }
}

async function kycGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}/kyc/${path}`);
    const data = await res.json();
    const raw = JSON.stringify(
      { endpoint: `GET /api/kyc/${path}`, status: res.status, response: data },
      null,
      2,
    );
    if (!res.ok)
      return { ok: false, error: data?.message ?? `HTTP ${res.status}`, raw };
    return { ok: true, data: data as T, raw };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      ok: false,
      error: msg,
      raw: JSON.stringify({ error: msg }, null, 2),
    };
  }
}

export const api = {
  health: () => kycGet("health"),
  aadhaarSendOtp: (aadhaar_number: string) =>
    kycPost("aadhaar/send-otp", { aadhaar_number }),
  aadhaarVerifyOtp: (ref_id: string, otp: string) =>
    kycPost("aadhaar/verify-otp", { ref_id, otp }),
  digilockerInitiate: (redirect_url?: string) =>
    kycPost("digilocker/initiate", redirect_url ? { redirect_url } : {}),
  panLite: (pan: string) => kycPost("pan/lite", { pan }),
  pan360: (pan: string, dob?: string) =>
    kycPost("pan/360", dob ? { pan, dob } : { pan }),
  panOcr: (file: File) => {
    const f = new FormData();
    f.append("image", file);
    return kycForm("pan/ocr", f);
  },
  bavSync: (account_number: string, ifsc: string, name?: string) =>
    kycPost(
      "bav/sync",
      name ? { account_number, ifsc, name } : { account_number, ifsc },
    ),
  bavAsync: (account_number: string, ifsc: string, reference_id: string) =>
    kycPost("bav/async", { account_number, ifsc, reference_id }),
  ifsc: (ifsc: string) => kycPost("ifsc", { ifsc }),
  reversePennyDrop: (name?: string) =>
    kycPost("reverse-penny-drop", name ? { name } : {}),
  nameMatch: (name1: string, name2: string) =>
    kycPost("name-match", { name1, name2 }),
  faceLiveness: (file: File) => {
    const f = new FormData();
    f.append("image", file);
    return kycForm("face/liveness", f);
  },
  faceMatch: (selfie: File, document: File) => {
    const f = new FormData();
    f.append("selfie", selfie);
    f.append("document", document);
    return kycForm("face/match", f);
  },
  vkycInitiate: (
    agent_mode = false,
    customer_name: string,
    customer_mobile: string,
  ) => kycPost("vkyc/initiate", { customer_name, customer_mobile, agent_mode }),
  statement: (file: File) => {
    const f = new FormData();
    f.append("statement", file);
    return kycForm("statement", f);
  },
  aaConsent: (mobile: string, period: string) =>
    kycPost("aa/consent", { mobile, period }),
};
