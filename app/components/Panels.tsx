"use client";
import { useState, useRef } from "react";
import {
  Card,
  Chip,
  Note,
  InfoGrid,
  ScoreBar,
  ResponseBox,
  Btn,
  FormRow,
  FormGroup,
  Input,
  Select,
  Tabs,
  UploadZone,
  CodeBlock,
  CompTable,
} from "./ui";
import { scoreLabel } from "../lib/utils";
import { api } from "../lib/api";

// ─────────────────────────────────────────────────────────────
// STATEMENT PANEL
// ─────────────────────────────────────────────────────────────
export function StatementPanel({ onVerified }: { onVerified: () => void }) {
  const [tab, setTab] = useState("upload");
  const stmtInput = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [panName, setPanName] = useState("");
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const [nmScore, setNmScore] = useState<number | null>(null);
  const [nmVerdict, setNmVerdict] = useState("");
  const [rawResp, setRawResp] = useState("");
  const [error, setError] = useState("");
  const [checks, setChecks] = useState<Array<{ label: string; pass: boolean }>>(
    [],
  );
  const [aaMob, setAaMob] = useState("");
  const [aaPeriod, setAaPeriod] = useState("LAST_6_MONTHS");
  const [aaLoading, setAaLoading] = useState(false);
  const [aaResp, setAaResp] = useState("");
  const [aaError, setAaError] = useState("");

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("PDF files only");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB");
      return;
    }
    setError("");
    setLoading(true);
    setInfo(null);
    setChecks([]);
    const res = await api.statement(file);
    setLoading(false);
    setRawResp(res.raw);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    setInfo(d);
    if (panName) {
      const holderName = String(d.name ?? d.account_holder ?? "");
      if (holderName) {
        const nmRes = await api.nameMatch(panName, holderName);
        if (nmRes.ok) {
          const nm = nmRes.data as Record<string, unknown>;
          const score = Number(nm.score ?? nm.match_score ?? 0);
          setNmScore(score);
          setNmVerdict(scoreLabel(score));
        }
      }
    }
    const period = String(d.statement_period ?? d.period ?? "");
    const bankName = String(d.bank_name ?? "");
    const tampered = d.is_tampered === true || d.is_tampered === "true";
    const avgBal = Number(d.average_balance ?? d.avg_balance ?? 0);
    setChecks([
      {
        label: panName
          ? nmScore !== null
            ? `Score ${nmScore}`
            : "Name match run"
          : "Skipped (no PAN name)",
        pass: !!panName,
      },
      { label: period || "Period extracted", pass: !!period },
      { label: bankName || "Bank extracted", pass: !!bankName },
      {
        label: tampered ? "TAMPER DETECTED ⚠" : "Clean — no tamper",
        pass: !tampered,
      },
      {
        label:
          avgBal > 0
            ? `₹${avgBal.toLocaleString()} avg balance`
            : "Balance extracted",
        pass: avgBal > 0,
      },
      { label: "Statement parsed successfully", pass: true },
    ]);
    onVerified();
  };

  const handleAA = async () => {
    if (!aaMob) {
      setAaError("Enter mobile number");
      return;
    }
    setAaError("");
    setAaLoading(true);
    const res = await api.aaConsent(aaMob, aaPeriod);
    setAaLoading(false);
    setAaResp(res.raw);
    if (!res.ok) {
      setAaError(res.error);
      return;
    }
    const d = res.data as Record<string, unknown>;
    if (d.redirect_url) window.open(String(d.redirect_url), "_blank");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Bank Statement Verification"
        badge={<Chip label="Upload & OCR" type="warn" />}
      >
        <Tabs
          tabs={[
            { id: "upload", label: "PDF Upload + OCR" },
            { id: "aa", label: "Account Aggregator" },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "upload" && (
          <div className="flex flex-col gap-5">
            <Note
              type="err"
              title="Security — server-side only"
              body="PDF goes from your browser to your Next.js server route, which calls Cashfree Smart OCR. Never sent directly to Cashfree from the browser."
            />
            <input
              ref={stmtInput}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
            <UploadZone
              icon={loading ? "⏳" : "📑"}
              title={
                loading ? "Parsing statement…" : "Upload Bank Statement PDF"
              }
              subtitle="Supports password-protected PDFs · Max 10 MB · 3–6 months recommended"
              onClick={() => !loading && stmtInput.current?.click()}
            />
            <FormGroup label="PAN Name to cross-check (optional)">
              <Input
                placeholder="Name on PAN — used for name match"
                value={panName}
                onChange={(e) => setPanName(e.target.value)}
              />
            </FormGroup>
            {error && <div className="text-[12px] text-err">⚠ {error}</div>}
            {info && (
              <>
                <InfoGrid
                  cells={[
                    {
                      k: "Account Holder",
                      v: String(info.name ?? info.account_holder ?? "—"),
                      accent: true,
                    },
                    {
                      k: "Account Number",
                      v: String(
                        info.account_number ?? info.masked_account ?? "—",
                      ),
                    },
                    { k: "Bank", v: String(info.bank_name ?? "—") },
                    { k: "IFSC", v: String(info.ifsc ?? "—") },
                    {
                      k: "Period",
                      v: String(info.statement_period ?? info.period ?? "—"),
                    },
                    {
                      k: "Avg Balance",
                      v: info.average_balance
                        ? `₹${Number(info.average_balance).toLocaleString()}`
                        : "—",
                    },
                    {
                      k: "Transactions",
                      v: String(
                        info.transaction_count ??
                          info.transactions_count ??
                          "—",
                      ),
                    },
                    {
                      k: "Tamper",
                      v: (
                        <Chip
                          label={info.is_tampered ? "DETECTED" : "CLEAN"}
                          type={info.is_tampered ? "err" : "ok"}
                        />
                      ),
                    },
                  ]}
                />
                {nmScore !== null && (
                  <ScoreBar
                    label="Name Match — PAN vs Statement Holder"
                    score={nmScore}
                    verdict={nmVerdict}
                  />
                )}
                <ResponseBox content={rawResp} />
              </>
            )}
            {!info && rawResp && <ResponseBox content={rawResp} error />}
          </div>
        )}

        {tab === "aa" && (
          <div className="flex flex-col gap-5">
            <Note
              type="ok"
              title="Prefer Account Aggregator for credit decisions above ₹2 lakhs"
              body="AA fetches data directly from the bank over a regulated consent channel — no human-touchable PDF in the chain."
            />
            <FormRow>
              <FormGroup label="Mobile Number">
                <Input
                  value={aaMob}
                  onChange={(e) => setAaMob(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </FormGroup>
              <FormGroup label="Statement Period">
                <Select
                  value={aaPeriod}
                  onChange={(e) =>
                    setAaPeriod((e.target as HTMLSelectElement).value)
                  }
                >
                  <option value="LAST_1_MONTH">Last 1 month</option>
                  <option value="LAST_3_MONTHS">Last 3 months</option>
                  <option value="LAST_6_MONTHS">Last 6 months</option>
                  <option value="LAST_1_YEAR">Last 1 year</option>
                </Select>
              </FormGroup>
            </FormRow>
            {aaError && <div className="text-[12px] text-err">⚠ {aaError}</div>}
            <div>
              <Btn variant="ghost" loading={aaLoading} onClick={handleAA}>
                Request AA Consent →
              </Btn>
            </div>
            {aaResp && <ResponseBox content={aaResp} />}
          </div>
        )}
      </Card>

      <Card title="Statement Verification Checklist">
        <CompTable
          headers={["Check", "Method", "Threshold", "Status"]}
          rows={[
            [
              { text: "Account holder vs PAN name" },
              { text: "Name Match API" },
              { text: "Score ≥ 65" },
              {
                text: checks[0]
                  ? (checks[0].pass ? "✓ " : "⚠ ") + checks[0].label
                  : "Pending",
                color: checks[0]?.pass ? "ok" : checks[0] ? "warn" : "default",
              },
            ],
            [
              { text: "Statement period present" },
              { text: "OCR date range" },
              { text: "Date range" },
              {
                text: checks[1] ? "✓ " + checks[1].label : "Pending",
                color: checks[1] ? "ok" : "default",
              },
            ],
            [
              { text: "Bank name extracted" },
              { text: "OCR extraction" },
              { text: "Non-empty" },
              {
                text: checks[2] ? "✓ " + checks[2].label : "Pending",
                color: checks[2] ? "ok" : "default",
              },
            ],
            [
              { text: "Document tamper flag" },
              { text: "Cashfree fraud" },
              { text: "false" },
              {
                text: checks[3]
                  ? (checks[3].pass ? "✓ " : "⚠ ") + checks[3].label
                  : "Pending",
                color: checks[3]?.pass ? "ok" : checks[3] ? "err" : "default",
              },
            ],
            [
              { text: "Average balance" },
              { text: "OCR data" },
              { text: "Your min" },
              {
                text: checks[4] ? "✓ " + checks[4].label : "Pending",
                color: checks[4] ? "ok" : "default",
              },
            ],
            [
              { text: "Parse successful" },
              { text: "Smart OCR" },
              { text: "No errors" },
              {
                text: checks[5] ? "✓ " + checks[5].label : "Pending",
                color: checks[5] ? "ok" : "default",
              },
            ],
          ]}
        />
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INTEGRATION PANEL
// ─────────────────────────────────────────────────────────────
export function IntegrationPanel() {
  const [tab, setTab] = useState("new");
  return (
    <div className="flex flex-col gap-6">
      <Card title="How to Integrate — Step by Step">
        <Tabs
          tabs={[
            { id: "new", label: "New Project" },
            { id: "existing", label: "Existing Project" },
            { id: "stmt", label: "Statement Upload" },
            { id: "webhook", label: "Webhooks" },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "new" && (
          <div className="flex flex-col gap-4">
            <p className="text-[12px] leading-relaxed text-mid">
              Two projects work together. The NestJS API (
              <code className="px-1 rounded text-[11px] code-inline">
                cashfree-kyc-api
              </code>
              ) runs on port 3001 and holds all Cashfree credentials. The
              Next.js frontend (
              <code className="px-1 rounded text-[11px] code-inline">
                cashfree-kyc-poc
              </code>
              ) runs on port 3000 and calls the NestJS API.
            </p>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              1. Install both projects
            </div>
            <CodeBlock>{`cd cashfree-kyc-api && npm install\ncd ../cashfree-kyc-poc && npm install`}</CodeBlock>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              2. Set credentials in the API (cashfree-kyc-api/.env)
            </div>
            <CodeBlock>{`CASHFREE_CLIENT_ID=your_sandbox_client_id\nCASHFREE_CLIENT_SECRET=your_sandbox_client_secret\nCASHFREE_ENV=sandbox\nPORT=3001`}</CodeBlock>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              3. Start both servers
            </div>
            <CodeBlock>{`# Terminal 1\ncd cashfree-kyc-api && npm run start:dev\n\n# Terminal 2\ncd cashfree-kyc-poc && npm run dev`}</CodeBlock>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              4. How the layers connect
            </div>
            <p className="text-[11.5px] leading-relaxed text-mid">
              Each panel calls{" "}
              <code className="px-1 rounded text-[11px] code-inline">
                app/lib/api.ts
              </code>{" "}
              → NestJS{" "}
              <code className="px-1 rounded text-[11px] code-inline">
                POST /api/kyc/*
              </code>{" "}
              → Cashfree. Credentials never reach the browser.
            </p>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              5. Sandbox test credentials
            </div>
            <CodeBlock>{`Aadhaar : 999941057058\nPAN     : ABCDE1234F\nOTP     : 123456  (always succeeds in sandbox)\nAccount : 026291800001191  IFSC: YESB0000262`}</CodeBlock>
          </div>
        )}

        {tab === "existing" && (
          <div className="flex flex-col gap-4">
            <p className="text-[12px] leading-relaxed text-mid">
              Adding Cashfree KYC to an existing NestJS application. Import{" "}
              <code className="px-1 rounded text-[11px] code-inline">
                KycModule
              </code>{" "}
              — all routes come with it.
            </p>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              1. Import KycModule in your AppModule
            </div>
            <CodeBlock>{`// src/app.module.ts\nimport { KycModule } from './kyc/kyc.module';\n\n@Module({\n  imports: [\n    ConfigModule.forRoot({ isGlobal: true }),\n    KycModule,\n    YourExistingModule,\n  ],\n})\nexport class AppModule {}`}</CodeBlock>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              2. Extend your users table
            </div>
            <CodeBlock>{`ALTER TABLE users ADD COLUMN kyc_status  VARCHAR(20) DEFAULT 'PENDING';\nALTER TABLE users ADD COLUMN kyc_pan     BOOLEAN DEFAULT FALSE;\nALTER TABLE users ADD COLUMN kyc_aadhaar BOOLEAN DEFAULT FALSE;\nALTER TABLE users ADD COLUMN kyc_bank    BOOLEAN DEFAULT FALSE;`}</CodeBlock>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              3. Guard routes that need verified identity
            </div>
            <CodeBlock>{`@Injectable()\nexport class KycGuard implements CanActivate {\n  canActivate(ctx: ExecutionContext): boolean {\n    const req = ctx.switchToHttp().getRequest();\n    if (req.user?.kyc_status !== 'COMPLETED')\n      throw new ForbiddenException('KYC not completed');\n    return true;\n  }\n}`}</CodeBlock>
          </div>
        )}

        {tab === "stmt" && (
          <div className="flex flex-col gap-4">
            <p className="text-[12px] leading-relaxed text-mid">
              Browser uploads to NestJS, which calls Cashfree Smart OCR
              server-side via multer + base64.
            </p>
            <CodeBlock>{`async statementOcr(pdfBuffer: Buffer) {\n  return this.cf.postV2('/verification/ocr/bank-statement', {\n    doc1:      pdfBuffer.toString('base64'),\n    doc1_type: 'pdf',\n  });\n}`}</CodeBlock>
          </div>
        )}

        {tab === "webhook" && (
          <div className="flex flex-col gap-4">
            <p className="text-[12px] leading-relaxed text-mid">
              Add a webhook controller to the NestJS API. Validate HMAC-SHA256
              before trusting the payload.
            </p>
            <CodeBlock>{`@Post('cashfree')\n@HttpCode(200)\nhandle(@Req() req: Request, @Headers() headers: Record<string,string>) {\n  const sig    = headers['x-webhook-signature'];\n  const ts     = headers['x-webhook-timestamp'];\n  const secret = process.env.CASHFREE_CLIENT_SECRET!;\n  const expected = crypto\n    .createHmac('sha256', secret)\n    .update(ts + JSON.stringify(req.body))\n    .digest('base64');\n  if (sig !== expected) throw new ForbiddenException('Invalid sig');\n  // handle event...\n  return { ok: true };\n}`}</CodeBlock>
            <Note
              type="default"
              title="Register your webhook URL"
              body="Dashboard → Developers → Secure ID → Webhooks → Add Endpoint. Use your NestJS API public URL."
            />
          </div>
        )}
      </Card>

      <Card title="Best Practices Checklist">
        <CompTable
          headers={["Rule", "Why it matters", "Implementation"]}
          rows={[
            [
              { text: "Credentials server-side only" },
              { text: "Exposes secret if client-side" },
              { text: "CASHFREE_* env vars only", color: "ok" },
            ],
            [
              { text: "Validate webhook HMAC" },
              { text: "Prevents forged events" },
              { text: "crypto.createHmac in route.ts", color: "ok" },
            ],
            [
              { text: "Mask Aadhaar before DB write" },
              { text: "UIDAI compliance, legal risk" },
              { text: "Store only last 4 digits", color: "ok" },
            ],
            [
              { text: "Never log PAN/Aadhaar/account" },
              { text: "Audit exposure, PCI risk" },
              { text: "Strip from logger middleware", color: "ok" },
            ],
            [
              { text: "Rate-limit OTP endpoints" },
              { text: "Brute-force / cost abuse" },
              { text: "5 req / 15 min / IP", color: "ok" },
            ],
            [
              { text: "Name Match after every BAV" },
              { text: "Account may belong to other person" },
              { text: "Chain in bav-sync route", color: "warn" },
            ],
            [
              { text: "DigiLocker fallback after 2 fails" },
              { text: "~15% users have unlinked mobile" },
              { text: "Auto-fallback in AadhaarPanel", color: "warn" },
            ],
          ]}
        />
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ARCHITECTURE PANEL
// ─────────────────────────────────────────────────────────────
export function ArchitecturePanel() {
  return (
    <div className="flex flex-col gap-6">
      <Card title="Server-Side vs Client-Side — What Runs Where">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              label: "Client (browser / mobile app)",
              cls: "text-accent",
              items: [
                ["✓", "OTP input form", false],
                ["✓", "File picker for PDF / images", false],
                ["✓", "Selfie capture (camera)", false],
                ["✓", "DigiLocker redirect", false],
                ["✓", "Video KYC link", false],
                ["✓", "Polls your backend for status", false],
                ["✗", "Never calls Cashfree directly", true],
                ["✗", "Never holds credentials", true],
              ],
            },
            {
              label: "NestJS API  (cashfree-kyc-api  ·  port 3001)",
              cls: "text-ok",
              items: [
                ["✓", "Holds CASHFREE_CLIENT_ID + SECRET", false],
                ["✓", "All Cashfree API calls", false],
                ["✓", "OTP initiation + verification", false],
                ["✓", "PAN / Aadhaar / BAV calls", false],
                ["✓", "Image → base64 → Face API", false],
                ["✓", "PDF → base64 → Smart OCR", false],
                ["✓", "Webhook HMAC validation", false],
                ["✓", "Aadhaar masking before DB", false],
              ],
            },
          ].map((col) => (
            <div key={col.label} className="rounded-lg p-[14px] surface-base">
              <div
                className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${col.cls}`}
              >
                {col.label}
              </div>
              {col.items.map(([sym, txt, err], i) => (
                <div
                  key={i}
                  className={`text-[11.5px] leading-loose ${err ? "text-err" : "text-mid"}`}
                >
                  {sym} {txt}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-widest mb-2 text-dim">
          Request flow
        </div>
        <pre className="rounded-lg p-4 text-[11px] leading-loose overflow-x-auto surface-base text-mid text-mono">
          <span className="text-accent">BROWSER (Next.js · port 3000)</span>
          {`
  OTP form / file picker / selfie
        │  fetch("http://localhost:3001/api/kyc/...")
        ▼
`}
          <span className="text-ok">
            NESTJS API (cashfree-kyc-api · port 3001)
          </span>
          {`
  KycController  →  KycService  →  CashfreeService
  Calls Cashfree with x-client-id / x-client-secret
        │  HTTPS to sandbox.cashfree.com
        ▼
`}
          <span className="text-soft">
            CASHFREE SECURE ID (sandbox.cashfree.com)
          </span>
          {`
  Aadhaar OTP  ·  PAN  ·  BAV  ·  OCR  ·  Face
        │  Webhook — async results
        ▼
`}
          <span className="text-ok">
            NESTJS WEBHOOK (/api/webhook/cashfree)
          </span>
          {`
  Validate HMAC-SHA256  →  Update DB  →  200 OK`}
        </pre>
      </Card>

      <Card title="Scenario Comparison">
        <CompTable
          headers={["Scenario", "APIs", "Cost/user", "Time", "Use case"]}
          rows={[
            [
              { text: "Minimal KYC" },
              { text: "PAN Lite + Aadhaar OTP + Liveness + BAV + Name Match" },
              { text: "₹7–16", color: "ok" },
              { text: "3–4 min" },
              { text: "Consumer apps, wallets" },
            ],
            [
              { text: "Standard KYC" },
              {
                text: "PAN 360 + Aadhaar OTP + DigiLocker + Face Match + RPD + Stmt",
              },
              { text: "₹20–70", color: "warn" },
              { text: "6–8 min" },
              { text: "NBFC, lending, fintech" },
            ],
            [
              { text: "Full KYC+Video" },
              {
                text: "All above + Video KYC + Geolocation + AA 6-month statement",
              },
              { text: "₹80–150", color: "err" },
              { text: "10–15 min" },
              { text: "Banking, loans >₹50K" },
            ],
          ]}
        />
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRICING PANEL
// ─────────────────────────────────────────────────────────────
export function PricingPanel() {
  const [users, setUsers] = useState(10000);
  const [scenario, setScenario] = useState(45);
  const monthly = users * scenario;
  const annual = monthly * 12;

  const gwRates: Array<[string, string, boolean?]> = [
    ["UPI / Debit / Netbanking", "1.95%"],
    ["Domestic Credit Cards", "1.95%"],
    ["UPI on Credit Cards", "2.15%"],
    ["Pay Later", "2.50%"],
    ["International Visa / MC", "2.99%"],
    ["American Express", "2.95%"],
    ["Virtual Bank Account", "₹20/txn"],
  ];
  const secureRates: Array<[string, string, boolean?]> = [
    ["IFSC Verification", "Free", true],
    ["PAN Lite", "₹0.50–1"],
    ["PAN 360", "₹1–3"],
    ["Aadhaar OTP (both steps)", "₹1–3"],
    ["DigiLocker", "₹3–8"],
    ["Smart OCR per page", "₹2–6"],
    ["BAV Sync", "₹3–5"],
    ["Reverse Penny Drop", "₹5–10 + ₹1"],
    ["Face Liveness / Match", "₹2–5"],
    ["Name Match", "₹0.50–2"],
    ["Account Aggregator", "₹15–30"],
    ["Video KYC — AI", "₹30–60"],
    ["Video KYC — Agent", "₹80–150"],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card title="Pricing Reference">
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: "Payment Gateway (Public)", rows: gwRates },
            { title: "Secure ID APIs (Estimated)", rows: secureRates },
          ].map((card) => (
            <div key={card.title} className="rounded-lg p-[14px] surface-base">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest mb-3 text-dim">
                {card.title}
              </h4>
              {card.rows.map(([name, val, free]) => (
                <div
                  key={name}
                  className="flex justify-between items-center py-1.5 border-b border-line"
                >
                  <span className="text-[11.5px] text-mid">{name}</span>
                  <span
                    className={`text-[11.5px] font-semibold text-mono ${free ? "text-ok" : "text-warn"}`}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Note
          type="default"
          title="Secure ID pricing is contact-sales only"
          body="All Secure ID rates above are estimates. Contact Cashfree sales for your actual negotiated rates based on volume."
        />
      </Card>

      <Card title="Cost Calculator">
        <FormRow>
          <FormGroup label="Monthly users to verify">
            <Input
              type="number"
              value={users}
              min={100}
              onChange={(e) => setUsers(parseInt(e.target.value) || 10000)}
            />
          </FormGroup>
          <FormGroup label="KYC scenario">
            <Select
              value={scenario}
              onChange={(e) =>
                setScenario(parseInt((e.target as HTMLSelectElement).value))
              }
            >
              <option value={12}>Minimal KYC (~₹7–16/user)</option>
              <option value={45}>Standard KYC (~₹20–70/user)</option>
              <option value={115}>Full KYC + Video (~₹80–150/user)</option>
            </Select>
          </FormGroup>
        </FormRow>
        <InfoGrid
          cells={[
            { k: "Monthly users", v: users.toLocaleString() },
            { k: "Cost per user", v: `~₹${scenario}` },
            { k: "Monthly cost", v: `~₹${monthly.toLocaleString()}` },
            { k: "Annual cost", v: `~₹${annual.toLocaleString()}` },
            {
              k: "% of ₹1Cr GMV",
              v: `${((monthly / 10_000_000) * 100).toFixed(2)}%`,
            },
            {
              k: "Break-even GMV",
              v: `₹${(scenario * 100).toLocaleString()}/user`,
            },
          ]}
        />
      </Card>
    </div>
  );
}
