"use client";
import { useState } from "react";
import { NavId, DotStatus } from "./lib/utils";
import { Sidebar } from "./components/Sidebar";
import { CredentialBanner } from "./components/CredentialBanner";
import { AadhaarPanel } from "./components/AadhaarPanel";
import { PANPanel } from "./components/PANPanel";
import { BAVPanel } from "./components/BAVPanel";
import {
  ArchitecturePanel,
  IntegrationPanel,
  PricingPanel,
  StatementPanel,
} from "./components/Panels";
import { BiometricPanel } from "./components/BiometricsPanel";

export default function Home() {
  const [active, setActive] = useState<NavId>("aadhaar");
  const [dots, setDots] = useState<Record<string, DotStatus>>({});
  const markDone = (id: string) => setDots((p) => ({ ...p, [id]: "ok" }));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <CredentialBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={active} dots={dots} onNav={setActive} />
        <main className="flex-1 overflow-y-auto bg-bg px-9 py-8">
          <div
            className="flex flex-col gap-6 max-w-[1000px]"
            style={{ padding: "30px" }}
          >
            {active === "aadhaar" && (
              <AadhaarPanel onVerified={() => markDone("aadhaar")} />
            )}
            {active === "pan" && (
              <PANPanel onVerified={() => markDone("pan")} />
            )}
            {active === "bav" && (
              <BAVPanel onVerified={() => markDone("bav")} />
            )}
            {active === "statement" && (
              <StatementPanel onVerified={() => markDone("statement")} />
            )}
            {active === "biometric" && (
              <BiometricPanel onVerified={() => markDone("biometric")} />
            )}
            {active === "integration" && <IntegrationPanel />}
            {active === "architecture" && <ArchitecturePanel />}
            {active === "pricing" && <PricingPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}
