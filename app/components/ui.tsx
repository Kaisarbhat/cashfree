"use client";
import React, { useState } from "react";

// ── Card ─────────────────────────────────────────────────────
export function Card({
  title,
  badge,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: "var(--color-bg2)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-line)",
        padding: "24px",
      }}
    >
      {title && (
        <div
          className="flex items-center gap-3"
          style={{ marginBottom: "20px" }}
        >
          <span
            className="flex-1 text-[14px] font-semibold"
            style={{ color: "var(--color-white)" }}
          >
            {title}
          </span>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Chip ─────────────────────────────────────────────────────
type ChipType = "ok" | "warn" | "err" | "dim" | "acc";
export function Chip({
  label,
  type = "dim",
}: {
  label: string;
  type?: ChipType;
}) {
  const s: Record<ChipType, React.CSSProperties> = {
    ok: {
      background: "rgba(68,221,136,0.12)",
      color: "var(--color-ok)",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "rgba(68,221,136,0.3)",
    },
    warn: {
      background: "rgba(255,170,68,0.12)",
      color: "var(--color-warn)",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "rgba(255,170,68,0.3)",
    },
    err: {
      background: "rgba(255,85,85,0.12)",
      color: "var(--color-err)",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "rgba(255,85,85,0.3)",
    },
    dim: {
      background: "var(--color-bg3)",
      color: "var(--color-mid)",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "var(--color-line2)",
    },
    acc: {
      background: "rgba(200,255,62,0.12)",
      color: "var(--color-accent)",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "rgba(200,255,62,0.3)",
    },
  };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide"
      style={{ ...s[type], padding: "4px 8px" }}
    >
      {label}
    </span>
  );
}

// ── Note ─────────────────────────────────────────────────────
type NoteType = "default" | "ok" | "err" | "acc";
export function Note({
  type = "default",
  title,
  body,
}: {
  type?: NoteType;
  title: string;
  body: string;
}) {
  const accent = {
    default: "var(--color-warn)",
    ok: "var(--color-ok)",
    err: "var(--color-err)",
    acc: "var(--color-accent)",
  }[type];
  return (
    <div
      className="flex gap-3 rounded-lg my-3"
      style={{
        padding: "12px 16px",
        background: "var(--color-bg)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-line)",
        borderLeftWidth: 3,
        borderLeftStyle: "solid",
        borderLeftColor: accent,
      }}
    >
      <div>
        <div
          className="text-[12px] font-semibold mb-1"
          style={{ color: accent }}
        >
          {title}
        </div>
        <div
          className="text-[12px] leading-relaxed"
          style={{ color: "var(--color-mid)" }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

// ── Flow Diagram ──────────────────────────────────────────────
type FlowNodeType = "client" | "server" | "api" | "done";
const flowStyle: Record<FlowNodeType, React.CSSProperties> = {
  client: {
    background: "rgba(200,255,62,0.1)",
    color: "var(--color-accent)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(200,255,62,0.25)",
  },
  server: {
    background: "rgba(68,221,136,0.1)",
    color: "var(--color-ok)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(68,221,136,0.25)",
  },
  api: {
    background: "rgba(255,255,255,0.05)",
    color: "var(--color-soft)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--color-line2)",
  },
  done: {
    background: "rgba(255,170,68,0.1)",
    color: "var(--color-warn)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,170,68,0.25)",
  },
};
export function FlowDiagram({
  steps,
}: {
  steps: Array<{ label: string; type: FlowNodeType }>;
}) {
  return (
    <div
      className="flex items-center flex-wrap gap-0 rounded-lg mb-6"
      style={{
        padding: "12px 16px",
        background: "var(--color-bg)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-line)",
      }}
    >
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <span
            className="rounded text-[11px] font-semibold whitespace-nowrap"
            style={{ ...flowStyle[s.type], padding: "4px 6px" }}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span
              className="px-1.5 text-[12px]"
              style={{ color: "var(--color-dim)" }}
            >
              →
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Info Grid ─────────────────────────────────────────────────
export function InfoGrid({
  cells,
}: {
  cells: Array<{ k: string; v: React.ReactNode; accent?: boolean }>;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-5">
      {cells.map((c, i) => (
        <div
          key={i}
          className="rounded-lg"
          style={{
            padding: "12px 14px",
            background: "var(--color-bg)",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "var(--color-line)",
          }}
        >
          <div
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-dim)" }}
          >
            {c.k}
          </div>
          <div
            className="text-[13px] font-semibold"
            style={{
              color: c.accent ? "var(--color-ok)" : "var(--color-white)",
            }}
          >
            {c.v}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Score Bar ─────────────────────────────────────────────────
export function ScoreBar({
  label,
  score,
  verdict,
}: {
  label: string;
  score: number | null;
  verdict: string;
}) {
  const color =
    score === null
      ? "var(--color-dim)"
      : score >= 75
        ? "var(--color-ok)"
        : score >= 50
          ? "var(--color-warn)"
          : "var(--color-err)";
  return (
    <div
      className="rounded-lg text-center mt-5"
      style={{
        padding: "24px",
        background: "var(--color-bg)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-line)",
      }}
    >
      <div
        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
        style={{ color: "var(--color-dim)" }}
      >
        {label}
      </div>
      <div
        className="text-[56px] font-bold leading-none mb-3"
        style={{ color, fontFamily: "var(--font-mono)" }}
      >
        {score ?? "—"}
      </div>
      <div
        className="h-1.5 rounded-full mx-auto mb-3"
        style={{ background: "var(--color-bg3)", width: "50%" }}
      >
        <div
          className="h-full rounded-full score-bar-fill"
          style={{ width: score ? `${score}%` : "0%", background: color }}
        />
      </div>
      {verdict && (
        <div className="text-[12px] font-semibold" style={{ color }}>
          {verdict}
        </div>
      )}
    </div>
  );
}

// ── Response Box ──────────────────────────────────────────────
export function ResponseBox({
  content,
  error = false,
}: {
  content: string;
  error?: boolean;
}) {
  return (
    <div style={{ marginBlock: "16px" }}>
      <div
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-dim)", marginBottom: "8px" }}
      >
        API Response
      </div>
      <pre
        className="rounded-lg text-[11.5px] max-h-[240px] overflow-y-auto leading-relaxed whitespace-pre-wrap"
        style={{
          padding: "14px 16px",
          background: "var(--color-bg)",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "var(--color-line)",
          color: error ? "var(--color-err)" : "#77cc77",
          fontFamily: "var(--font-mono)",
        }}
      >
        {content}
      </pre>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner() {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full"
      style={{
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "rgba(255,255,255,0.2)",
        borderTopColor: "currentColor",
        animation: "spin-anim 0.7s linear infinite",
      }}
    />
  );
}

// ── Button ────────────────────────────────────────────────────
type BtnVariant = "acc" | "ghost" | "ok" | "warn";
const btnBase: Record<BtnVariant, React.CSSProperties> = {
  acc: { background: "var(--color-accent)", color: "#000" },
  ghost: {
    background: "transparent",
    color: "var(--color-soft)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--color-line2)",
  },
  ok: {
    background: "rgba(68,221,136,0.12)",
    color: "var(--color-ok)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(68,221,136,0.3)",
  },
  warn: {
    background: "rgba(255,170,68,0.12)",
    color: "var(--color-warn)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,170,68,0.3)",
  },
};
export function Btn({
  variant = "ghost",
  disabled = false,
  loading = false,
  onClick,
  children,
  small = false,
}: {
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex w-fit items-center gap-2 rounded-lg font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${small ? "px-3 py-1.5 text-[11px]" : "px-5 py-2.5 text-[12px]"}`}
      style={{
        fontFamily: "var(--font-sans)",
        ...btnBase[variant],
        padding: "4px 6px",
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

// ── Form helpers ──────────────────────────────────────────────
export function FormRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>{children}</div>
  );
}
export function FormGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-dim)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-bg3)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--color-line2)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "var(--color-txt)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  outline: "none",
  width: "100%",
};
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...(focus ? { borderColor: "var(--color-accent)" } : {}),
        ...props.style,
      }}
      onFocus={(e) => {
        setFocus(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        props.onBlur?.(e);
      }}
    />
  );
}
export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
  },
) {
  return (
    <select {...props} style={{ ...inputStyle, ...props.style }}>
      {props.children}
    </select>
  );
}

// ── HR ────────────────────────────────────────────────────────
export function HR() {
  return (
    <div
      style={{ height: 1, background: "var(--color-line)", marginBlock: "8px" }}
    />
  );
}

// ── Tabs ──────────────────────────────────────────────────────
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-lg"
      style={{
        background: "var(--color-bg)",
        padding: "6px",
        marginBottom: "20px",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="px-4 py-2 rounded-md text-[12px] font-medium cursor-pointer transition-all flex-1"
          style={{
            fontFamily: "var(--font-sans)",
            background: active === t.id ? "var(--color-bg2)" : "transparent",
            color: active === t.id ? "var(--color-white)" : "var(--color-mid)",
            borderWidth: active === t.id ? 1 : 0,
            borderStyle: "solid",
            borderColor: "var(--color-line)",
            padding: "8px 16px",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Upload Zone ───────────────────────────────────────────────
export function UploadZone({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="rounded-xl text-center cursor-pointer transition-all"
      style={{
        padding: "28px 20px",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: hov ? "var(--color-accent)" : "var(--color-line2)",
        color: hov ? "var(--color-soft)" : "var(--color-dim)",
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div
        className="text-[13px] font-semibold mb-1"
        style={{ color: "var(--color-soft)" }}
      >
        {title}
      </div>
      <div className="text-[11px]">{subtitle}</div>
    </div>
  );
}

// ── Code Block ────────────────────────────────────────────────
export function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="rounded-lg text-[11.5px] max-h-[300px] overflow-auto leading-relaxed whitespace-pre"
      style={{
        padding: "16px 18px",
        background: "var(--color-bg)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-line)",
        color: "var(--color-soft)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </pre>
  );
}

// ── OTP Input ─────────────────────────────────────────────────
export function OTPInput({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [fi, setFi] = useState<number | null>(null);
  return (
    <div className="flex gap-2.5 max-w-[320px]">
      {values.map((v, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          value={v}
          maxLength={1}
          onChange={(e) => {
            const n = [...values];
            n[i] = e.target.value.slice(-1);
            onChange(n);
            if (e.target.value && i < 5)
              document.getElementById(`otp-${i + 1}`)?.focus();
          }}
          onFocus={() => setFi(i)}
          onBlur={() => setFi(null)}
          className="flex-1 aspect-square text-center text-lg font-bold rounded-lg outline-none"
          style={{
            background: "var(--color-bg3)",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor:
              fi === i ? "var(--color-accent)" : "var(--color-line2)",
            color: "var(--color-txt)",
            fontFamily: "var(--font-mono)",
            caretColor: "var(--color-accent)",
            minWidth: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── Comparison Table ──────────────────────────────────────────
type CellColor = "ok" | "warn" | "err" | "acc" | "default";
const cellCols: Record<CellColor, string> = {
  ok: "var(--color-ok)",
  warn: "var(--color-warn)",
  err: "var(--color-err)",
  acc: "var(--color-accent)",
  default: "var(--color-soft)",
};
export function CompTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<{ text: string; color?: CellColor }>>;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-line)",
      }}
    >
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-[10px] uppercase tracking-widest"
                style={{
                  background: "var(--color-bg)",
                  color: "var(--color-dim)",
                  borderBottomWidth: 1,
                  borderBottomStyle: "solid",
                  borderBottomColor: "var(--color-line)",
                  padding: "8px 16px",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                borderBottomWidth: 1,
                borderBottomStyle: "solid",
                borderBottomColor: "var(--color-line)",
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-3"
                  style={{
                    color: cellCols[cell.color ?? "default"],
                    fontWeight: ci === 0 ? 500 : 400,
                    ...(ci === 0 ? { color: "var(--color-txt)" } : {}),
                    padding: "8px 16px",
                  }}
                >
                  {cell.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
