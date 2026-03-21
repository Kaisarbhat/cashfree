"use client";
import { useState } from "react";
import {
  Card,
  Note,
  InfoGrid,
  ScoreBar,
  ResponseBox,
  Btn,
  FormRow,
  FormGroup,
  Input,
  Tabs,
} from "./ui";
import { scoreLabel } from "../lib/utils";
import { api } from "../lib/api";

export function BAVPanel({ onVerified }: { onVerified: () => void }) {
  const [tab, setTab] = useState("sync");

  // Sync
  const [acc, setAcc] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [pan, setPan] = useState("");
  const [syncLoading, setSyncL] = useState(false);
  const [syncInfo, setSyncInfo] = useState<Record<string, unknown> | null>(
    null,
  );
  const [syncScore, setSyncScore] = useState<number | null>(null);
  const [syncVerdict, setSyncV] = useState("");
  const [syncResp, setSyncResp] = useState("");
  const [syncError, setSyncError] = useState("");
  const [ifscInfo, setIfscInfo] = useState<Record<string, unknown> | null>(
    null,
  );
  const [ifscLoading, setIfscL] = useState(false);

  // RPD
  const [rpdName, setRpdName] = useState("");
  const [rpdLoading, setRpdL] = useState(false);
  const [rpdInfo, setRpdInfo] = useState<Record<string, unknown> | null>(null);
  const [rpdResp, setRpdResp] = useState("");
  const [rpdError, setRpdError] = useState("");

  // Async
  const [aAcc, setAAcc] = useState("");
  const [aIfsc, setAIfsc] = useState("");
  const [aRef, setARef] = useState(() => `bav-ref-${Date.now()}`);

  const [asyncLoading, setAsyncL] = useState(false);
  const [asyncResp, setAsyncResp] = useState("");
  const [asyncError, setAsyncError] = useState("");

  const handleSync = async () => {
    if (!acc || !ifsc) {
      setSyncError("Enter account number and IFSC");
      return;
    }
    setSyncError("");
    setSyncL(true);
    const res = await api.bavSync(acc, ifsc, pan || undefined);
    setSyncL(false);
    setSyncResp(res.raw);
    if (!res.ok) {
      setSyncError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    setSyncInfo(d);
    if (pan && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      const holderName = String(
        d.account_holder_name ?? d.name_at_bank ?? d.name ?? "",
      );
      if (holderName) {
        const nmRes = await api.nameMatch(pan, holderName);
        if (nmRes.ok) {
          const nm = nmRes.data as Record<string, unknown>;
          const score = Number(nm.score ?? 0);
          setSyncScore(score);
          setSyncV(scoreLabel(score));
        }
      }
    }
    onVerified();
  };

  const handleIfsc = async () => {
    if (!ifsc) {
      setSyncError("Enter IFSC first");
      return;
    }
    setSyncError("");
    setIfscL(true);
    const res = await api.ifsc(ifsc);
    setIfscL(false);
    if (res.ok) setIfscInfo(res.data as Record<string, unknown>);
    else setSyncError(res.error);
  };

  const handleRPD = async () => {
    setRpdError("");
    setRpdL(true);
    const res = await api.reversePennyDrop(rpdName || undefined);
    setRpdL(false);
    setRpdResp(res.raw);
    if (!res.ok) {
      setRpdError(res.error);
      return;
    }
    setRpdInfo(res.data as Record<string, unknown>);
  };

  const handleAsync = async () => {
    if (!aAcc || !aIfsc) {
      setAsyncError("Enter account number and IFSC");
      return;
    }
    setAsyncError("");
    setAsyncL(true);
    const res = await api.bavAsync(aAcc, aIfsc, aRef);
    setAsyncL(false);
    setAsyncResp(res.raw);
    if (!res.ok) setAsyncError(res.error);
  };

  return (
    <Card title="Bank Account Verification">
      <Tabs
        tabs={[
          { id: "sync", label: "Sync (Instant)" },
          { id: "rpd", label: "Reverse Penny Drop" },
          { id: "async", label: "Async / Webhook" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* ── SYNC ── */}
      {tab === "sync" && (
        <div className="flex flex-col gap-5">
          <FormRow>
            <FormGroup label="Account Number">
              <Input
                placeholder="1234567890123456"
                value={acc}
                onChange={(e) => setAcc(e.target.value)}
              />
            </FormGroup>
            <FormGroup label="IFSC Code">
              <Input
                placeholder="HDFC0001234"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="PAN Number (optional — for name cross-match)">
              <Input
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
              />
            </FormGroup>
            <div className="flex items-end gap-3 justify-end">
              <Btn
                variant="ghost"
                small
                loading={ifscLoading}
                onClick={handleIfsc}
              >
                IFSC Lookup (Free)
              </Btn>
              <Btn variant="acc" loading={syncLoading} onClick={handleSync}>
                Verify Account
              </Btn>
            </div>
          </FormRow>

          {ifscInfo && (
            <div
              className="rounded-lg px-4 py-3 text-[12px]"
              style={{
                background: "var(--color-bg)",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "var(--color-line)",
                color: "var(--color-soft)",
              }}
            >
              {String(ifscInfo.bank_name ?? "")} ·{" "}
              {String(ifscInfo.branch ?? "")} · {String(ifscInfo.city ?? "")}
            </div>
          )}

          {syncError && (
            <div className="text-[12px]" style={{ color: "var(--color-err)" }}>
              ⚠ {syncError}
            </div>
          )}

          {syncInfo && (
            <>
              <InfoGrid
                cells={[
                  {
                    k: "Account Holder",
                    v: String(
                      syncInfo.account_holder_name ??
                        syncInfo.name_at_bank ??
                        "—",
                    ),
                    accent: true,
                  },
                  { k: "Status", v: String(syncInfo.account_status ?? "—") },
                  { k: "Bank", v: String(syncInfo.bank_name ?? "—") },
                  { k: "Type", v: String(syncInfo.account_type ?? "—") },
                  { k: "Branch", v: String(syncInfo.branch ?? "—") },
                  { k: "UPI", v: syncInfo.upi_enabled ? "Enabled" : "—" },
                ]}
              />
              {syncScore !== null && (
                <ScoreBar
                  label="Name Match — PAN vs Bank Account"
                  score={syncScore}
                  verdict={syncVerdict}
                />
              )}
              <ResponseBox content={syncResp} />
            </>
          )}
          {!syncInfo && syncResp && <ResponseBox content={syncResp} error />}
        </div>
      )}

      {/* ── RPD ── */}
      {tab === "rpd" && (
        <div className="flex flex-col gap-5">
          <Note
            type="ok"
            title="UPI-based — highest accuracy name verification"
            body="Cashfree sends a ₹1 UPI collect request to the customer. On approval, the bank-confirmed account holder name is returned via IMPS. No account number or IFSC required."
          />
          <FormGroup label="Expected holder name (optional — for pre-match reference)">
            <Input
              placeholder="Account holder name"
              value={rpdName}
              onChange={(e) => setRpdName(e.target.value)}
            />
          </FormGroup>
          {rpdError && (
            <div className="text-[12px]" style={{ color: "var(--color-err)" }}>
              ⚠ {rpdError}
            </div>
          )}
          <div>
            <Btn variant="ok" loading={rpdLoading} onClick={handleRPD}>
              {rpdLoading
                ? "Creating UPI collect request…"
                : "Initiate Reverse Penny Drop →"}
            </Btn>
          </div>
          {rpdInfo && (
            <>
              <InfoGrid
                cells={[
                  {
                    k: "Bank-Verified Name",
                    v: String(rpdInfo.name_at_bank ?? "—"),
                    accent: true,
                  },
                  { k: "UPI VPA", v: String(rpdInfo.upi ?? "—") },
                  { k: "Bank Account", v: String(rpdInfo.bank_account ?? "—") },
                  { k: "IFSC", v: String(rpdInfo.ifsc ?? "—") },
                  { k: "Status", v: String(rpdInfo.status ?? "COMPLETED") },
                  {
                    k: "Verification ID",
                    v: String(rpdInfo.verification_id ?? "—"),
                  },
                ]}
              />
              <ResponseBox content={rpdResp} />
            </>
          )}
          {!rpdInfo && rpdResp && <ResponseBox content={rpdResp} error />}
        </div>
      )}

      {/* ── ASYNC ── */}
      {tab === "async" && (
        <div className="flex flex-col gap-5">
          <Note
            type="default"
            title="Async mode — result delivered to your webhook"
            body="Submit the request now. Cashfree posts the result to your registered webhook URL within 30 minutes."
          />
          <FormRow>
            <FormGroup label="Account Number">
              <Input
                placeholder="1234567890123456"
                value={aAcc}
                onChange={(e) => setAAcc(e.target.value)}
              />
            </FormGroup>
            <FormGroup label="IFSC Code">
              <Input
                placeholder="SBIN0001234"
                value={aIfsc}
                onChange={(e) => setAIfsc(e.target.value.toUpperCase())}
              />
            </FormGroup>
            <FormGroup label="Reference ID">
              <Input value={aRef} onChange={(e) => setARef(e.target.value)} />
            </FormGroup>
            <FormGroup label="Webhook URL">
              <Input
                placeholder="https://yourdomain.com/api/webhook/cashfree"
                readOnly
                style={{ opacity: 0.5 }}
              />
            </FormGroup>
          </FormRow>
          {asyncError && (
            <div className="text-[12px]" style={{ color: "var(--color-err)" }}>
              ⚠ {asyncError}
            </div>
          )}
          <div>
            <Btn variant="ghost" loading={asyncLoading} onClick={handleAsync}>
              Submit Async →
            </Btn>
          </div>
          {asyncResp && <ResponseBox content={asyncResp} />}
        </div>
      )}
    </Card>
  );
}
