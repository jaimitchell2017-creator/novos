import { useRef, useCallback } from "react";
import { OSWindow } from "../types";

interface Props {
  win: OSWindow;
  children: React.ReactNode;
  onClose: () => void;
  onUpdate: (changes: Partial<OSWindow>) => void;
  onFocus: () => void;
}

export default function OSWindowComponent({ win, children, onClose, onUpdate, onFocus }: Props) {
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const isMobile = window.innerWidth < 768;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (win.maximized || isMobile) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
    },
    [win.maximized, win.x, win.y, isMobile]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const nx = Math.max(0, Math.min(window.innerWidth - win.width, dragRef.current.winX + dx));
      const ny = Math.max(40, Math.min(window.innerHeight - 80, dragRef.current.winY + dy));
      onUpdate({ x: nx, y: ny });
    },
    [win.width, onUpdate]
  );

  const handlePointerUp = useCallback(() => { dragRef.current = null; }, []);

  if (win.minimized) return null;

  const style: React.CSSProperties = win.maximized || isMobile
    ? { position: "fixed", top: 40, left: 0, right: 0, bottom: 56, width: "auto", height: "auto", zIndex: win.zIndex }
    : { position: "fixed", left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div
      style={style}
      className="os-window rounded-2xl flex flex-col overflow-hidden animate-slide-up"
      onClick={onFocus}
      onPointerDown={onFocus}
    >
      {/* Title bar */}
      <div
        className="os-window-titlebar flex items-center gap-3 px-4 h-11 flex-shrink-0 cursor-move select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={() => onUpdate({ maximized: !win.maximized })}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {[
            { bg: "#ef4444", hover: "#f87171", action: onClose, label: "×", title: "Close" },
            { bg: "#f59e0b", hover: "#fbbf24", action: () => onUpdate({ minimized: true }), label: "−", title: "Minimize" },
            { bg: "#22c55e", hover: "#4ade80", action: () => onUpdate({ maximized: !win.maximized }), label: "+", title: "Maximize" },
          ].map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); btn.action(); }}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-all hover:brightness-110"
              style={{ background: btn.bg, boxShadow: `0 0 6px ${btn.bg}55` }}
            >
              <span className="opacity-0 group-hover:opacity-100 text-black text-[9px] font-bold leading-none">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <span className="text-base leading-none">{win.icon}</span>
          <span
            className="text-white/60 text-[11px] font-medium tracking-widest truncate uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {win.title}
          </span>
        </div>

        <div className="w-12 flex-shrink-0" />
      </div>

      {/* Accent line */}
      <div className="h-px flex-shrink-0" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.6), rgba(124,58,237,0.4), transparent)" }} />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
