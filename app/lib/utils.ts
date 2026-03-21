// ── Types ────────────────────────────────────────────────────

export type NavId =
  | "aadhaar"
  | "pan"
  | "bav"
  | "statement"
  | "biometric"
  | "integration"
  | "architecture"
  | "pricing";

export type DotStatus = "pending" | "ok" | "err";

export interface NavItem {
  id: NavId;
  icon: string;
  label: string;
  group: string;
}

// ── Nav config ───────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { id: "aadhaar", icon: "🔐", label: "Aadhaar OTP", group: "Identity" },
  { id: "pan", icon: "🪪", label: "PAN Verify", group: "Identity" },
  { id: "bav", icon: "🏦", label: "Bank Account", group: "Banking" },
  { id: "statement", icon: "📄", label: "Statement Upload", group: "Banking" },
  { id: "biometric", icon: "👁", label: "Face / Video", group: "Biometric" },
  // { id: "integration",  icon: "⚙",  label: "Integration",       group: "Developer" },
  // { id: "architecture", icon: "🗺", label: "Architecture",      group: "Developer" },
  // { id: "pricing",      icon: "₹",  label: "Pricing",           group: "Developer" },
];

// ── Helpers ──────────────────────────────────────────────────

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function fakeResp(endpoint: string, data: unknown): string {
  return JSON.stringify({ endpoint, response: data }, null, 2);
}

export function scoreColor(score: number): string {
  if (score >= 75) return "var(--color-ok)";
  if (score >= 50) return "var(--color-warn)";
  return "var(--color-err)";
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "STRONG MATCH — auto-approve";
  if (score >= 50) return "PARTIAL MATCH — review required";
  return "NO MATCH — reject";
}

export function formatAadhaar(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function validPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
}
