import { useState, useEffect } from "react";
import { OSUser, OSSettings } from "../types";

interface Props {
  user: OSUser;
  settings: OSSettings;
  onLogout: () => void;
  onOpenApp: (id: string) => void;
}

export default function TopBar({ user, settings, onLogout, onOpenApp }: Props) {
  const [time, setTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number }> };
    nav.getBattery?.().then((b) => setBattery(Math.round(b.level * 100)));
  }, []);

  const timeStr = time.toLocaleTimeString("en-AU", {
    hour: "2-digit", minute: "2-digit",
    second: settings.showSeconds ? "2-digit" : undefined,
    hour12: settings.clockFormat === "12",
  });
  const dateStr = time.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div
      className="absolute top-0 left-0 right-0 h-10 z-[9999] flex items-center px-4 select-none"
      style={{
        background: "linear-gradient(180deg, rgba(4,12,32,0.92) 0%, rgba(4,12,32,0.8) 100%)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(0,229,255,0.1)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => onOpenApp("appstore")}
          className="flex items-center gap-2 group"
        >
          <span className="text-cyan-400 text-sm" style={{ textShadow: "0 0 8px rgba(0,229,255,0.7)", transition: "text-shadow 0.2s" }}>✦</span>
          <span
            className="text-white/80 text-[11px] font-bold tracking-[0.25em] group-hover:text-white transition-colors"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            NOVOS
          </span>
        </button>

        {user.isAdmin && (
          <div className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.15em]"
            style={{ background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.15)" }}>
            ADMIN
          </div>
        )}
      </div>

      {/* Center: Clock */}
      <button
        className="flex flex-col items-center hover:opacity-80 transition-opacity"
        onClick={() => onOpenApp("settings")}
      >
        <span
          className="text-white/90 text-sm font-semibold tabular-nums leading-tight"
          style={{ fontFamily: "'Orbitron', sans-serif", textShadow: "0 0 12px rgba(0,229,255,0.3)" }}
        >
          {timeStr}
        </span>
        <span className="text-white/30 text-[9px] tracking-widest leading-none">{dateStr}</span>
      </button>

      {/* Right */}
      <div className="flex items-center gap-2.5 flex-1 justify-end">
        {/* Wifi icon */}
        <div className="text-white/40">
          <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor">
            <path d="M7 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM7 5.5A5.5 5.5 0 0 1 10.89 7l-1.1 1.1A4 4 0 0 0 3.21 8.1L2.11 7A5.5 5.5 0 0 1 7 5.5zM7 2A9 9 0 0 1 13.36 4.64L12.25 5.75A7.5 7.5 0 0 0 1.75 5.75L.64 4.64A9 9 0 0 1 7 2z"/>
          </svg>
        </div>

        {/* Battery */}
        {battery !== null && (
          <div className="flex items-center gap-1 text-white/40">
            <div className="relative flex items-center">
              <div className="w-5 h-3 rounded-sm border border-white/25 relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: battery > 20 ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.7)", width: `${battery}%` }} />
              </div>
              <div className="w-0.5 h-1.5 rounded-r-sm bg-white/25 ml-px" />
            </div>
            <span className="text-[10px]">{battery}%</span>
          </div>
        )}

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-xl transition-all hover:bg-white/8"
            style={{ border: "1px solid transparent", ...(showMenu ? { background: "rgba(0,229,255,0.08)", borderColor: "rgba(0,229,255,0.2)" } : {}) }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)", boxShadow: "0 0 8px rgba(0,229,255,0.4)" }}>
              {user.name[0]?.toUpperCase()}
            </div>
            <span className="text-white/60 text-[11px] font-medium hidden sm:block max-w-20 truncate">{user.name}</span>
            <span className="text-white/30 text-[9px]">▾</span>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-10 min-w-48 rounded-2xl p-1.5 z-[9999] animate-fade-in"
                style={{
                  background: "linear-gradient(160deg, rgba(8,22,52,0.97), rgba(4,12,32,0.99))",
                  border: "1px solid rgba(0,229,255,0.2)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
                }}
              >
                <div className="px-3 py-2.5 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)", boxShadow: "0 0 12px rgba(0,229,255,0.4)" }}>
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/90 text-sm font-semibold truncate" style={{ fontFamily: "'Exo 2', sans-serif" }}>{user.name}</p>
                      <p className="text-white/30 text-[10px] truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="h-px mx-2 mb-1" style={{ background: "rgba(0,229,255,0.1)" }} />
                <button onClick={() => { onOpenApp("settings"); setShowMenu(false); }}
                  className="sidebar-item">
                  <span>⚙️</span> Settings
                </button>
                <button onClick={() => { onLogout(); setShowMenu(false); }}
                  className="sidebar-item mt-1 text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
                  <span>⏻</span> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
