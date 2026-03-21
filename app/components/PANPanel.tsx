"use client";
import { useState, useRef } from "react";
import {
  Card,
  Chip,
  Note,
  InfoGrid,
  ResponseBox,
  ScoreBar,
  Btn,
  FormRow,
  FormGroup,
  Input,
  Select,
  Tabs,
  UploadZone,
} from "./ui";
import { validPAN, scoreLabel } from "../lib/utils";
import { api } from "../lib/api";

export function PANPanel({ onVerified }: { onVerified: () => void }) {
  const [tab, setTab] = useState("lite");

  // PAN Lite
  const [lPan, setLPan] = useState("");
  const [lLoading, setLL] = useState(false);
  const [lResp, setLResp] = useState("");
  const [lError, setLError] = useState("");

  // PAN 360
  const [p3Pan, setP3Pan] = useState("");
  const [p3Dob, setP3Dob] = useState("");
  const [p3Loading, setP3L] = useState(false);
  const [p3Info, setP3Info] = useState<Record<string, unknown> | null>(null);
  const [p3Resp, setP3Resp] = useState("");
  const [p3Error, setP3Error] = useState("");

  // OCR
  const ocrRef = useRef<HTMLInputElement | null>(null);
  const [ocrLoading, setOcrL] = useState(false);
  const [ocrResp, setOcrResp] = useState("");
  const [ocrError, setOcrError] = useState("");

  // Name Match
  const [nm1, setNm1] = useState("");
  const [nm2, setNm2] = useState("");
  const [nmLoading, setNmL] = useState(false);
  const [nmScore, setNmScore] = useState<number | null>(null);
  const [nmVerdict, setNmVerd] = useState("");
  const [nmResp, setNmResp] = useState("");
  const [nmError, setNmError] = useState("");

  const handleLite = async () => {
    if (!validPAN(lPan)) {
      setLError("Enter a valid PAN e.g. ABCDE1234F");
      return;
    }
    setLError("");
    setLL(true);
    const res = await api.panLite(lPan);
    setLL(false);
    setLResp(res.raw);
    if (!res.ok) {
      setLError(res.error);
      return;
    }
    onVerified();
  };

  const handle360 = async () => {
    if (!validPAN(p3Pan)) {
      setP3Error("Enter a valid PAN e.g. ABCDE1234F");
      return;
    }
    setP3Error("");
    setP3L(true);
    const res = await api.pan360(p3Pan, p3Dob || undefined);
    setP3L(false);
    setP3Resp(res.raw);
    if (!res.ok) {
      setP3Error(res.error);
      return;
    }
    setP3Info(res.data as Record<string, unknown>);
    onVerified();
  };

  const handleOcr = async (file: File) => {
    setOcrError("");
    setOcrL(true);
    const res = await api.panOcr(file);
    setOcrL(false);
    setOcrResp(res.raw);
    if (!res.ok) setOcrError(res.error);
  };

  const handleNm = async () => {
    if (!nm1 || !nm2) {
      setNmError("Enter both names");
      return;
    }
    setNmError("");
    setNmL(true);
    const res = await api.nameMatch(nm1, nm2);
    setNmL(false);
    setNmResp(res.raw);
    if (!res.ok) {
      setNmError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    const score = Number(d.score ?? d.match_score ?? 0);
    setNmScore(score);
    setNmVerd(scoreLabel(score));
  };

  const linked = (v: unknown) => v === true || v === "true" || v === "YES";

  return (
    <div className="flex flex-col gap-6">
      <Card title="PAN Card Verification">
        <Tabs
          tabs={[
            { id: "lite", label: "PAN Lite" },
            { id: "360", label: "PAN 360 (Advanced)" },
            { id: "ocr", label: "OCR Pre-fill" },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "lite" && (
          <div className="flex flex-col gap-5">
            <FormRow>
              <FormGroup label="PAN Number">
                <Input
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={lPan}
                  onChange={(e) => setLPan(e.target.value.toUpperCase())}
                />
              </FormGroup>
              <FormGroup label="Purpose">
                <Select>
                  <option>Pre-screening</option>
                  <option>Eligibility Check</option>
                </Select>
              </FormGroup>
            </FormRow>
            {lError && (
              <div
                className="text-[12px]"
                style={{ color: "var(--color-err)" }}
              >
                ⚠ {lError}
              </div>
            )}
            <div>
              <Btn variant="ghost" loading={lLoading} onClick={handleLite}>
                Verify (Lite)
              </Btn>
            </div>
            {lResp && <ResponseBox content={lResp} />}
          </div>
        )}

        {tab === "360" && (
          <div className="flex flex-col gap-5">
            <Note
              type="acc"
              title="Use PAN 360 for regulated KYC flows"
              body="Returns name, DOB, gender, Aadhaar-linked status, mobile linkage. PAN Lite is pre-screening only."
            />
            <FormRow>
              <FormGroup label="PAN Number">
                <Input
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={p3Pan}
                  onChange={(e) => setP3Pan(e.target.value.toUpperCase())}
                />
              </FormGroup>
              <FormGroup label="Date of Birth (optional)">
                <Input
                  type="date"
                  value={p3Dob}
                  onChange={(e) => setP3Dob(e.target.value)}
                />
              </FormGroup>
            </FormRow>
            {p3Error && (
              <div
                className="text-[12px]"
                style={{ color: "var(--color-err)" }}
              >
                ⚠ {p3Error}
              </div>
            )}
            <div>
              <Btn variant="acc" loading={p3Loading} onClick={handle360}>
                Verify PAN 360
              </Btn>
            </div>
            {p3Info && (
              <>
                <InfoGrid
                  cells={[
                    {
                      k: "PAN Name",
                      v: String(p3Info.registered_name ?? "—"),
                      accent: true,
                    },
                    {
                      k: "Status",
                      v: (
                        <Chip
                          label={String(p3Info.pan_status ?? "VALID")}
                          type="ok"
                        />
                      ),
                    },
                    {
                      k: "Aadhaar Linked",
                      v: (
                        <Chip
                          label={linked(p3Info.aadhaar_linked) ? "YES" : "NO"}
                          type={linked(p3Info.aadhaar_linked) ? "ok" : "err"}
                        />
                      ),
                    },
                    { k: "DOB", v: String(p3Info.date_of_birth ?? "—") },
                    {
                      k: "Gender",
                      v:
                        p3Info.gender === "M"
                          ? "Male"
                          : p3Info.gender === "F"
                            ? "Female"
                            : String(p3Info.gender ?? "—"),
                    },
                    {
                      k: "Mobile Linked",
                      v: (
                        <Chip
                          label={linked(p3Info.mobile_linked) ? "YES" : "NO"}
                          type={linked(p3Info.mobile_linked) ? "ok" : "warn"}
                        />
                      ),
                    },
                  ]}
                />
                <ResponseBox content={p3Resp} />
              </>
            )}
            {!p3Info && p3Resp && <ResponseBox content={p3Resp} error />}
          </div>
        )}

        {tab === "ocr" && (
          <div className="flex flex-col gap-5">
            <Note
              type="default"
              title="OCR is for data pre-fill only"
              body="Always follow OCR capture with PAN Lite or PAN 360 to verify against NSDL. OCR alone is not KYC."
            />
            <input
              ref={ocrRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleOcr(f);
              }}
            />
            <UploadZone
              icon={ocrLoading ? "⏳" : "📸"}
              title={
                ocrLoading ? "Extracting fields…" : "Upload PAN Card Image"
              }
              subtitle="JPEG · PNG · PDF · Max 5 MB"
              onClick={() => !ocrLoading && ocrRef.current?.click()}
            />
            {ocrError && (
              <div
                className="text-[12px]"
                style={{ color: "var(--color-err)" }}
              >
                ⚠ {ocrError}
              </div>
            )}
            {ocrResp && <ResponseBox content={ocrResp} />}
          </div>
        )}
      </Card>

      <Card title="Name Match — PAN vs Bank">
        <div className="flex flex-col gap-5">
          <FormRow>
            <FormGroup label="Name from PAN / Aadhaar">
              <Input
                placeholder="Rajesh Kumar Singh"
                value={nm1}
                onChange={(e) => setNm1(e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Name from Bank / Statement">
              <Input
                placeholder="R. K. Singh"
                value={nm2}
                onChange={(e) => setNm2(e.target.value)}
              />
            </FormGroup>
          </FormRow>
          {nmError && (
            <div className="text-[12px]" style={{ color: "var(--color-err)" }}>
              ⚠ {nmError}
            </div>
          )}
          <div>
            <Btn variant="ghost" loading={nmLoading} onClick={handleNm}>
              Run Name Match
            </Btn>
          </div>
          {nmScore !== null && (
            <>
              <ScoreBar
                label="Match Score"
                score={nmScore}
                verdict={nmVerdict}
              />
              <ResponseBox content={nmResp} />
            </>
          )}
          {nmScore === null && nmResp && <ResponseBox content={nmResp} error />}
        </div>
      </Card>
    </div>
  );
}
