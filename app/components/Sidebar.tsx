import { NAV_ITEMS, NavId, DotStatus } from "../lib/utils";

export function Sidebar({
  active,
  dots,
  onNav,
}: {
  active: NavId;
  dots: Record<string, DotStatus>;
  onNav: (id: NavId) => void;
}) {
  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];
  return (
    <aside
      className="flex flex-col overflow-y-auto flex-shrink-0"
      style={{
        width: 220,
        minWidth: 220,
        background: "var(--color-bg1)",
        borderRightWidth: 1,
        borderRightStyle: "solid",
        borderRightColor: "var(--color-line)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 "
        style={{
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "var(--color-line)",
          padding: "16px",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0"
          style={{ background: "var(--color-accent)", color: "#000" }}
        >
          CF
        </div>
        <div>
          <div
            className="text-[13px] font-semibold"
            style={{ color: "var(--color-soft)" }}
          >
            Cashfree KYC
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-dim)" }}>
            Integration POC
          </div>
        </div>
      </div>

      {/* Nav */}
      <div
        className="flex-1 px-3 py-4 flex flex-col gap-3"
        style={{ padding: "16px 8px" }}
      >
        {groups.map((group) => (
          <div key={group}>
            <div
              className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-dim)", marginBottom: "10px" }}
            >
              {group}
            </div>
            <div className="flex flex-col gap-0.5">
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const isActive = active === item.id;
                const dot = dots[item.id] ?? "pending";
                return (
                  <button
                    key={item.id}
                    onClick={() => onNav(item.id)}
                    className="w-full flex items-center gap-3 rounded-lg text-[13px] font-medium cursor-pointer transition-all"
                    style={{
                      padding: "9px 12px",
                      background: isActive ? "var(--color-bg2)" : "transparent",
                      color: isActive
                        ? "var(--color-white)"
                        : "var(--color-mid)",
                      fontFamily: "var(--font-sans)",
                      borderLeftWidth: 2,
                      borderLeftStyle: "solid",
                      borderLeftColor: isActive
                        ? "var(--color-accent)"
                        : "transparent",
                      borderTopWidth: 0,
                      borderRightWidth: 0,
                      borderBottomWidth: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "var(--color-bg2)";
                        e.currentTarget.style.color = "var(--color-txt)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-mid)";
                      }
                    }}
                  >
                    <span className="text-[15px] w-5 text-center flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          dot === "ok"
                            ? "var(--color-ok)"
                            : dot === "err"
                              ? "var(--color-err)"
                              : "var(--color-line2)",
                        boxShadow:
                          dot === "ok" ? "0 0 6px var(--color-ok)" : "none",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
