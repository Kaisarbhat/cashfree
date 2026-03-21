"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Card,
  Chip,
  Note,
  FlowDiagram,
  InfoGrid,
  ScoreBar,
  ResponseBox,
  Btn,
  FormRow,
  FormGroup,
  Input,
  Tabs,
  UploadZone,
} from "./ui";
import { scoreLabel } from "../lib/utils";
import { api } from "../lib/api";

// ── Camera capture component ──────────────────────────────────
function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (file: File, url: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [captured, setCaptured] = useState<string | null>(null);

  // Start camera on mount
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch (e) {
        setError(
          e instanceof Error && e.name === "NotAllowedError"
            ? "Camera access denied. Allow camera in your browser and try again."
            : `Camera error: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    })();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d")!;
    // Mirror the image so it looks natural (front camera is mirrored)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataURL);
    // Stop camera immediately after capture
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const retake = useCallback(() => {
    setCaptured(null);
    // Restart camera
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      } catch (e) {
        setError(`Camera error: ${e instanceof Error ? e.message : String(e)}`);
      }
    })();
  }, []);

  const confirm = useCallback(() => {
    if (!captured) return;
    // Convert dataURL → Blob → File
    const byteStr = atob(captured.split(",")[1]);
    const arr = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
    const blob = new Blob([arr], { type: "image/jpeg" });
    const file = new File([blob], `selfie-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCapture(file, captured);
  }, [captured, onCapture]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90">
      <div className="surface-card rounded-xl p-5 flex flex-col gap-4 w-full max-w-md">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-white">
            📷 Camera — Selfie Capture
          </span>
          <button
            onClick={onClose}
            className="text-dim hover:text-soft text-[18px] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && <Note type="err" title="Camera unavailable" body={error} />}

        {!error && (
          <div className="rounded-lg overflow-hidden surface-base relative">
            {!captured ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg"
                style={{ transform: "scaleX(-1)", display: "block" }}
              />
            ) : (
              <img
                src={captured}
                alt="Captured selfie"
                className="w-full rounded-lg"
              />
            )}
            {/* Face guide overlay */}
            {!captured && ready && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="rounded-full opacity-30"
                  style={{
                    width: 180,
                    height: 220,
                    border: "2px dashed #c8ff3e",
                  }}
                />
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3">
          {!captured ? (
            <>
              <Btn variant="acc" disabled={!ready || !!error} onClick={capture}>
                {ready ? "📸 Capture" : "Starting camera…"}
              </Btn>
              <Btn variant="ghost" small onClick={onClose}>
                Cancel
              </Btn>
            </>
          ) : (
            <>
              <Btn variant="acc" onClick={confirm}>
                ✓ Use this photo
              </Btn>
              <Btn variant="ghost" small onClick={retake}>
                Retake
              </Btn>
            </>
          )}
        </div>

        <p className="text-[11px] text-dim">
          Position your face inside the oval. Good lighting, no glasses if
          possible.
        </p>
      </div>
    </div>
  );
}

// ── Main BiometricPanel ───────────────────────────────────────
export function BiometricPanel({ onVerified }: { onVerified: () => void }) {
  // Face liveness + match
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfieURL, setSelfieURL] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docURL, setDocURL] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioInfo, setBioInfo] = useState<Record<string, unknown> | null>(null);
  const [bioScore, setBioScore] = useState<number | null>(null);
  const [bioVerdict, setBioVerdict] = useState("");
  const [bioResp, setBioResp] = useState("");
  const [bioError, setBioError] = useState("");

  // VKYC
  const [vkTab, setVkTab] = useState("ai");
  const [vkName, setVkName] = useState("");
  const [vkMob, setVkMob] = useState("");
  const [vkAiLoading, setVkAiLoading] = useState(false);
  const [vkAiResp, setVkAiResp] = useState("");
  const [vkAiError, setVkAiError] = useState("");
  const [vkAgLoading, setVkAgLoading] = useState(false);
  const [vkAgResp, setVkAgResp] = useState("");
  const [vkAgError, setVkAgError] = useState("");

  // Doc file picker
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (file: File, url: string) => {
    setSelfieFile(file);
    setSelfieURL(url);
    setShowCamera(false);
  };

  const handleDocPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setDocFile(f);
      setDocURL(URL.createObjectURL(f));
    }
  };

  const handleBio = async () => {
    if (!selfieFile) {
      setBioError("Capture a selfie first using the camera");
      return;
    }
    if (!docFile) {
      setBioError("Upload an ID document photo");
      return;
    }
    setBioError("");
    setBioLoading(true);

    const [lvRes, fmRes] = await Promise.all([
      api.faceLiveness(selfieFile),
      api.faceMatch(selfieFile, docFile),
    ]);
    setBioLoading(false);

    const combinedRaw = JSON.stringify(
      {
        face_liveness: JSON.parse(lvRes.raw).response,
        face_match: JSON.parse(fmRes.raw).response,
      },
      null,
      2,
    );
    setBioResp(combinedRaw);

    if (!lvRes.ok && !fmRes.ok) {
      setBioError(fmRes.error || lvRes.error);
      return;
    }

    const lv = lvRes.ok ? (lvRes.data as Record<string, unknown>) : {};
    const fm = fmRes.ok ? (fmRes.data as Record<string, unknown>) : {};
    setBioInfo({ ...lv, ...fm });

    // face_match_score is the correct field from FaceMatchResponseSchema
    const score = Number(fm.face_match_score ?? fm.score ?? 0);
    setBioScore(score);
    setBioVerdict(scoreLabel(score));
    onVerified();
  };

  const handleVkycAI = async () => {
    if (!vkName || !vkMob) {
      setVkAiError("Enter customer name and mobile");
      return;
    }
    setVkAiError("");
    setVkAiLoading(true);
    const res = await api.vkycInitiate(false, vkName, vkMob);
    setVkAiLoading(false);
    setVkAiResp(res.raw);
    if (!res.ok) {
      setVkAiError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    // Correct field from VKYCLinkResponseSchema is 'vkyc_link'
    const link = String(d.vkyc_link ?? d.link ?? d.session_link ?? "");
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      setVkAiError(
        "Session created but no link returned — check the API response below",
      );
    }
  };

  const handleVkycAgent = async () => {
    if (!vkName || !vkMob) {
      setVkAgError("Enter customer name and mobile");
      return;
    }
    setVkAgError("");
    setVkAgLoading(true);
    const res = await api.vkycInitiate(true, vkName, vkMob);
    setVkAgLoading(false);
    setVkAgResp(res.raw);
    if (!res.ok) {
      setVkAgError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    const link = String(d.vkyc_link ?? d.link ?? "");
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  // Liveness result extraction — response has nested 'liveness' object
  const livenessStatus = bioInfo
    ? String(
        (bioInfo.liveness as Record<string, unknown>)?.status ??
          bioInfo.status ??
          "—",
      )
    : null;
  const livenessScore = bioInfo?.liveness_score
    ? Number(bioInfo.liveness_score).toFixed(2)
    : null;
  const faceMatchResult = bioInfo
    ? String(bioInfo.face_match_result ?? bioInfo.result ?? "—")
    : null;
  const faceMatchScore = bioInfo?.face_match_score
    ? Number(bioInfo.face_match_score).toFixed(1)
    : null;

  return (
    <>
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="flex flex-col gap-6">
        <Card title="Face Liveness + Face Match">
          <FlowDiagram
            steps={[
              { label: "Camera", type: "client" },
              { label: "Capture frame", type: "client" },
              { label: "Your Server", type: "server" },
              { label: "Face Liveness", type: "api" },
              { label: "Face Match", type: "api" },
              { label: "Result", type: "done" },
            ]}
          />

          <div style={{ marginBlock: "16px" }}>
            <Note
              type="default"
              title="Selfie must be captured live from camera"
              body="Cashfree Face Liveness detects spoofing from printed photos. Always capture the selfie directly from the camera — do not upload a saved photo."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5">
            {/* Selfie — camera capture only */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] uppercase tracking-widest text-dim">
                Live Selfie
              </div>
              {selfieURL ? (
                <div className="relative rounded-xl overflow-hidden surface-base">
                  <img
                    src={selfieURL}
                    alt="Selfie"
                    className="w-full object-cover"
                    style={{ maxHeight: 180 }}
                  />
                  <button
                    onClick={() => setShowCamera(true)}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer btn-acc"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <div
                  className="rounded-xl text-center cursor-pointer transition-all py-7 px-5 upload-idle hover:upload-hover"
                  onClick={() => setShowCamera(true)}
                  style={{
                    padding: "28px 20px",
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: "var(--color-line2",
                    color: "var(--color-dim)",
                  }}
                >
                  <div className="text-3xl mb-2">🤳</div>
                  <div className="text-[13px] font-semibold mb-1 text-soft">
                    Open Camera
                  </div>
                  <div className="text-[11px]">
                    Live capture required for liveness check
                  </div>
                </div>
              )}
            </div>

            {/* Document — file upload */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] uppercase tracking-widest text-dim">
                ID Document Photo
              </div>
              <input
                ref={docInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleDocPick}
              />
              {docURL ? (
                <div className="relative rounded-xl overflow-hidden surface-base">
                  <img
                    src={docURL}
                    alt="ID document"
                    className="w-full object-cover"
                    style={{ maxHeight: 180 }}
                  />
                  <button
                    onClick={() => docInputRef.current?.click()}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer btn-ghost"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <UploadZone
                  icon="🪪"
                  title="Upload ID Photo"
                  subtitle="Aadhaar / PAN front · JPEG · PNG"
                  onClick={() => docInputRef.current?.click()}
                />
              )}
            </div>
          </div>

          {bioError && (
            <div className="mt-3 text-[12px] text-err">⚠ {bioError}</div>
          )}

          <div style={{ marginTop: "16px" }}>
            <Btn variant="acc" loading={bioLoading} onClick={handleBio}>
              {bioLoading
                ? "Running liveness + face match…"
                : "Run Liveness + Face Match →"}
            </Btn>
          </div>

          {bioInfo && (
            <>
              <InfoGrid
                cells={[
                  {
                    k: "Liveness Status",
                    v: (
                      <Chip
                        label={livenessStatus ?? "—"}
                        type={livenessStatus === "VALID" ? "ok" : "err"}
                      />
                    ),
                    accent: true,
                  },
                  {
                    k: "Liveness Score",
                    v: livenessScore ? `${livenessScore} / 1.0` : "—",
                  },
                  {
                    k: "Face Match",
                    v: (
                      <Chip
                        label={faceMatchResult ?? "—"}
                        type={
                          String(faceMatchResult).includes("MATCH")
                            ? "ok"
                            : "err"
                        }
                      />
                    ),
                  },
                  {
                    k: "Match Score",
                    v: faceMatchScore ? `${faceMatchScore} / 100` : "—",
                  },
                  { k: "Gender (est.)", v: String(bioInfo.gender ?? "—") },
                  {
                    k: "Mask Detected",
                    v: bioInfo.maskDetected_first_image ? "YES" : "No",
                  },
                ]}
              />
              <ScoreBar
                label="Face Match Similarity"
                score={bioScore}
                verdict={bioVerdict}
              />
              <ResponseBox content={bioResp} />
            </>
          )}
          {!bioInfo && bioResp && <ResponseBox content={bioResp} error />}
        </Card>

        {/* ── Video KYC ─────────────────────────────────────── */}
        <Card title="Video KYC" badge={<Chip label="RBI V-CIP" type="dim" />}>
          <FlowDiagram
            steps={[
              { label: "Customer details", type: "client" },
              { label: "Your Server", type: "server" },
              { label: "Cashfree VKYC", type: "api" },
              { label: "Session link →", type: "done" },
              { label: "Customer opens", type: "client" },
            ]}
          />

          <div style={{ marginBlock: "16px" }}>
            <Note
              type="default"
              title="VKYC requires prior dashboard activation"
              body="Video KYC (V-CIP) must be enabled on your Cashfree Secure ID account before sessions can be created. Contact Cashfree support to enable it."
            />
          </div>

          <Tabs
            tabs={[
              { id: "ai", label: "AI-only (₹30–60)" },
              { id: "agent", label: "Agent-assisted (₹80–150)" },
            ]}
            active={vkTab}
            onChange={setVkTab}
          />

          <FormRow>
            <FormGroup label="Customer Full Name">
              <Input
                value={vkName}
                onChange={(e) => setVkName(e.target.value)}
                placeholder="Full legal name as on ID"
              />
            </FormGroup>
            <FormGroup label="Customer Mobile">
              <Input
                value={vkMob}
                onChange={(e) => setVkMob(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </FormGroup>
          </FormRow>

          {vkTab === "ai" && (
            <div className="mt-5 flex flex-col gap-3">
              <p className="text-[12px] text-mid leading-relaxed">
                Creates a VKYC session. Cashfree returns a{" "}
                <code className="code-inline px-1 rounded text-[11px]">
                  vkyc_link
                </code>{" "}
                — open it in a new tab for the customer to complete on their
                device.
              </p>
              {vkAiError && (
                <div className="text-[12px] text-err">⚠ {vkAiError}</div>
              )}
              <div>
                <Btn
                  variant="ghost"
                  loading={vkAiLoading}
                  onClick={handleVkycAI}
                >
                  Generate Session Link →
                </Btn>
              </div>
              {vkAiResp && <ResponseBox content={vkAiResp} />}
            </div>
          )}

          {vkTab === "agent" && (
            <div className="mt-5 flex flex-col gap-3">
              <div style={{ marginBlock: "10px" }}>
                <Note
                  type="default"
                  title="Use agent mode for banking and loans above ₹50,000"
                  body="A live KYC agent joins for regulatory signoff. Typical wait: 10–30 minutes."
                />
              </div>
              {vkAgError && (
                <div className="text-[12px] text-err">⚠ {vkAgError}</div>
              )}
              <div>
                <Btn
                  variant="warn"
                  loading={vkAgLoading}
                  onClick={handleVkycAgent}
                >
                  Schedule Agent Session →
                </Btn>
              </div>
              {vkAgResp && <ResponseBox content={vkAgResp} />}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
