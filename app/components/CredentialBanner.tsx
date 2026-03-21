"use client";
import { useEffect, useState } from "react";

interface HealthData {
  cashfree_reachable: boolean;
  environment: string;
  base_url: string;
  ping_error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export function CredentialBanner() {
  const [health, setHealth]       = useState<HealthData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/kyc/health`)
      .then((r) => r.json())
      .then((d) => { setHealth(d); setLoading(false); })
      .catch(() => {
        setHealth({ cashfree_reachable: false, environment: "unknown", base_url: API_BASE, ping_error: "Cannot reach backend — is NestJS running on port 3001?" });
        setLoading(false);
      });
  }, []);

  if (loading || dismissed) return null;
  if (health?.cashfree_reachable) return null;

  const msg = health?.ping_error ?? "Cashfree unreachable";
  const isBackendDown = msg.includes("backend") || msg.includes("3001");

  return (
    <div className="flex items-start justify-between gap-3 px-5 py-3 text-[12px]"
      style={{
        background: "rgba(255,170,68,0.08)",
        borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "rgba(255,170,68,0.25)",
      }}>
      <div className="flex items-start gap-2.5">
        <span style={{ color: "var(--color-warn)", flexShrink: 0, marginTop: 1 }}>⚠</span>
        <div>
          <span className="font-semibold" style={{ color: "var(--color-warn)" }}>
            {isBackendDown ? "NestJS backend not reachable" : "Cashfree credentials invalid or not set"}
          </span>
          <span className="ml-2" style={{ color: "var(--color-mid)" }}>{msg}</span>
          {!isBackendDown && (
            <span className="ml-2 text-[10px]" style={{ color: "var(--color-dim)" }}>
              Copy .env.example → .env in the API project, add credentials, then restart the API server.
            </span>
          )}
        </div>
      </div>
      <button onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded cursor-pointer"
        style={{ background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,170,68,0.3)", color: "var(--color-warn)", fontFamily: "var(--font-sans)" }}>
        Dismiss
      </button>
    </div>
  );
}
