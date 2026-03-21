# Cashfree KYC POC — Next.js Frontend

Interactive proof-of-concept for Cashfree Secure ID APIs.
Calls the NestJS backend at http://localhost:3001.

## Quick Start

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at http://localhost:3000

## Environment Variables

| Key | Description |
|---|---|
| NEXT_PUBLIC_API_URL | NestJS backend URL (default: http://localhost:3001/api) |

## Running Both Together

```bash
# Terminal 1 — start the NestJS backend first
cd ../cashfree-kyc-api
npm run start:dev

# Terminal 2 — start the Next.js frontend
cd ../cashfree-kyc-poc
npm run dev
```

Then open http://localhost:3000. The credential banner shows green when Cashfree is reachable.

## Tests

```bash
npm test          # 57 tests (utils, api layer, components)
npm run test:watch
```

## Project Structure

```
app/
├── globals.css            # Tailwind v4 @theme tokens
├── layout.tsx / page.tsx  # Shell with sidebar + panel routing
├── lib/
│   ├── api.ts             # Typed fetch helpers → NestJS /api/kyc/*
│   └── utils.ts           # formatAadhaar, validPAN, scoreLabel, etc.
└── components/
    ├── ui.tsx             # Card, Chip, Note, Btn, Tabs, ScoreBar, etc.
    ├── Sidebar.tsx        # Nav sidebar with status dots
    ├── CredentialBanner.tsx
    ├── AadhaarPanel.tsx
    ├── PANPanel.tsx
    ├── BAVPanel.tsx
    └── panels.tsx         # Statement, Biometric, Integration, Architecture, Pricing
```
