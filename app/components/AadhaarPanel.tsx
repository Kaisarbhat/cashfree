"use client";
import { useState, useRef } from "react";
import {
  Card,
  Chip,
  Note,
  FlowDiagram,
  InfoGrid,
  ResponseBox,
  Btn,
  FormRow,
  FormGroup,
  Input,
  Select,
  HR,
  OTPInput,
} from "./ui";
import { formatAadhaar } from "../lib/utils";
import { api } from "../lib/api";

export function AadhaarPanel({ onVerified }: { onVerified: () => void }) {
  const [aadhaar, setAadhaar] = useState("");
  const [refId, setRefId] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "done">("input");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendMsg, setSendMsg] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [rawResp, setRawResp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [dlLoading, setDlLoading] = useState(false);
  const [dlResp, setDlResp] = useState("");
  const [dlError, setDlError] = useState("");

  const startResend = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSend = async (isResend = false) => {
    const num = aadhaar.replace(/\s/g, "");
    if (num.length !== 12 || isNaN(Number(num))) {
      setError("Enter a valid 12-digit Aadhaar number");
      return;
    }
    setError("");
    setSendLoading(true);
    const res = await api.aadhaarSendOtp(num);
    setSendLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    setRefId(String(d.ref_id ?? ""));
    setRawResp(res.raw);
    setStep("otp");
    setSendMsg(
      isResend ? "✓ New OTP sent" : "✓ OTP sent to your registered mobile",
    );
    startResend();
    if (isResend) setOtp(["", "", "", "", "", ""]);
  };

  const handleVerify = async () => {
    const otpVal = otp.join("");
    if (otpVal.length !== 6) {
      setError("Enter all 6 OTP digits");
      return;
    }
    setError("");
    setVerifyLoading(true);
    const res = await api.aadhaarVerifyOtp(refId, otpVal);
    setVerifyLoading(false);
    setRawResp(res.raw);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.data as Record<string, unknown>);
    setStep("done");
    onVerified();
  };

  const handleDL = async () => {
    setDlError("");
    setDlLoading(true);
    const res = await api.digilockerInitiate();
    setDlLoading(false);
    setDlResp(res.raw);
    if (!res.ok) {
      setDlError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    const url = String(d.url ?? d.redirect_url ?? "");
    if (url) window.open(url, "_blank");
  };

  const genderLabel = (g: unknown) =>
    g === "M" ? "Male" : g === "F" ? "Female" : String(g ?? "—");

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Aadhaar OTP Verification"
        badge={<Chip label="UIDAI Direct" type="ok" />}
      >
        <FlowDiagram
          steps={[
            { label: "User Input", type: "client" },
            { label: "Your Server", type: "server" },
            { label: "Cashfree API", type: "api" },
            { label: "UIDAI OTP", type: "api" },
            { label: "User enters", type: "client" },
            { label: "Verify server", type: "server" },
            { label: "KYC data", type: "done" },
          ]}
        />

        <div style={{ marginBlock: "20px" }}>
          <FormRow>
            <FormGroup label="Aadhaar Number">
              <Input
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                value={aadhaar}
                disabled={step !== "input"}
                onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
              />
            </FormGroup>
            <FormGroup label="Consent">
              <Select disabled={step !== "input"}>
                <option value="Y">I consent to verification via UIDAI</option>
                <option value="N">Decline</option>
              </Select>
            </FormGroup>
          </FormRow>
        </div>

        <div className="flex items-center gap-3 mt-5">
          {step === "input" && (
            <Btn
              variant="acc"
              loading={sendLoading}
              onClick={() => handleSend(false)}
            >
              Send OTP
            </Btn>
          )}
          {sendMsg && (
            <span className="text-[12px]" style={{ color: "var(--color-ok)" }}>
              {sendMsg}
            </span>
          )}
        </div>

        {error && (
          <div
            className="mt-3 text-[12px]"
            style={{ color: "var(--color-err)" }}
          >
            ⚠ {error}
          </div>
        )}

        {(step === "otp" || step === "done") && (
          <div style={{ marginBlock: "8px" }}>
            <HR />
            <FormGroup label="6-digit OTP — sent to your UIDAI-registered mobile">
              <OTPInput values={otp} onChange={setOtp} />
            </FormGroup>
            <div className="flex gap-3 mt-5" style={{ marginBlock: "16px" }}>
              {step === "otp" && (
                <Btn
                  variant="ok"
                  loading={verifyLoading}
                  onClick={handleVerify}
                >
                  Verify OTP
                </Btn>
              )}
              <Btn
                variant="ghost"
                small
                disabled={resendTimer > 0}
                onClick={() => handleSend(true)}
              >
                Resend {resendTimer > 0 ? `(${resendTimer}s)` : ""}
              </Btn>
            </div>
          </div>
        )}

        {step === "done" && result && (
          <>
            <HR />
            <InfoGrid
              cells={[
                { k: "Full Name", v: String(result.name ?? "—"), accent: true },
                { k: "DOB", v: String(result.dob ?? "—") },
                { k: "Gender", v: genderLabel(result.gender) },
                {
                  k: "Aadhaar (Masked)",
                  v: String(result.masked_aadhaar ?? "—"),
                },
                {
                  k: "State",
                  v: String(
                    result.address?.toString().split(",").pop()?.trim() ??
                      result.state ??
                      "—",
                  ),
                },
                { k: "Status", v: <Chip label="VERIFIED" type="ok" /> },
              ]}
            />
            <ResponseBox content={rawResp} />
          </>
        )}
        {rawResp && step === "otp" && <ResponseBox content={rawResp} />}
      </Card>

      <Card
        title="DigiLocker Fallback"
        badge={<Chip label="Use when OTP fails twice" type="dim" />}
      >
        <Note
          type="default"
          title="No linked mobile? Use DigiLocker"
          body="DigiLocker fetches a government-signed e-Aadhaar XML. The user authenticates with their DigiLocker credentials — no UIDAI-linked mobile needed."
        />
        <div className="mt-5 flex items-start gap-4">
          <div className="flex-1">
            <p
              className="text-[12px] leading-relaxed mb-4"
              style={{ color: "var(--color-mid)", marginBlock: "16px" }}
            >
              Click below to generate a DigiLocker OAuth URL. Cashfree creates
              the session and returns a redirect URL. Open it in a new tab for
              the customer.
            </p>
            {dlError && (
              <div
                className="mb-3 text-[12px]"
                style={{ color: "var(--color-err)" }}
              >
                ⚠ {dlError}
              </div>
            )}
            <Btn variant="ghost" loading={dlLoading} onClick={handleDL}>
              Initiate DigiLocker OAuth →
            </Btn>
          </div>
        </div>
        {dlResp && <ResponseBox content={dlResp} />}
      </Card>
    </div>
  );
}
