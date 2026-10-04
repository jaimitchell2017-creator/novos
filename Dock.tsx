import { OSApp, OSWindow } from "../types";

interface Props {
  apps: OSApp[];
  windows: OSWindow[];
  user: { isAdmin: boolean };
  onOpenApp: (id: string) => void;
}

const PINNED_IDS = ["browser", "files", "settings", "appstore", "downloads", "ai", "notes", "calculator", "bugchecker", "flappy"];

export default function Dock({ apps, windows, user, onOpenApp }: Props) {
  const pinned = apps.filter((a) => {
    if (!PINNED_IDS.includes(a.id)) return false;
    if (a.adminOnly && !user.isAdmin) return false;
    return true;
  });

  const extras = apps.filter(
    (a) => !PINNED_IDS.includes(a.id) && a.installed && !(a.adminOnly && !user.isAdmin)
  );

  const hasExtras = extras.length > 0;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[9990] flex items-end">
      <div
        className="flex items-end px-3 py-2.5 rounded-2xl gap-1"
        style={{
          background: "linear-gradient(180deg, rgba(8,22,52,0.75) 0%, rgba(4,12,32,0.85) 100%)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          border: "1px solid rgba(0,229,255,0.16)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,229,255,0.08)",
        }}
      >
        {/* Pinned apps */}
        <div className="dock-icons flex items-end gap-1">
          {pinned.map((app) => (
            <DockIcon key={app.id} app={app} windows={windows} onOpen={() => onOpenApp(app.id)} />
          ))}
        </div>

        {/* Separator */}
        {hasExtras && (
          <div className="mx-2 self-stretch w-px" style={{ background: "rgba(0,229,255,0.15)" }} />
        )}

        {/* Extra installed apps */}
        {hasExtras && (
          <div className="dock-icons flex items-end gap-1">
            {extras.slice(0, 8).map((app) => (
              <DockIcon key={app.id} app={app} windows={windows} onOpen={() => onOpenApp(app.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DockIcon({ app, windows, onOpen }: { app: OSApp; windows: OSWindow[]; onOpen: () => void }) {
  const isOpen = windows.some((w) => w.appId === app.id && !w.minimized);
  const isMinimized = windows.some((w) => w.appId === app.id && w.minimized);

  return (
    <div className="dock-icon relative flex flex-col items-center group">
      {/* Tooltip */}
      <div
        className="absolute bottom-full mb-2.5 px-2.5 py-1.5 rounded-xl text-white/90 text-xs whitespace-nowrap pointer-events-none z-10
                   opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{
          fontFamily: "'Exo 2', sans-serif",
          background: "linear-gradient(135deg, rgba(8,22,52,0.95), rgba(4,12,32,0.98))",
          border: "1px solid rgba(0,229,255,0.25)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(0,229,255,0.08)",
          transform: "translateX(-50%)",
          left: "50%",
        }}
      >
        {app.name}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent"
          style={{ borderTopColor: "rgba(0,229,255,0.25)" }} />
      </div>

      {/* Icon button */}
      <button
        onClick={onOpen}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-none"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, rgba(0,229,255,0.18), rgba(124,58,237,0.12))"
            : "rgba(255,255,255,0.06)",
          border: `1px solid ${isOpen ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: isOpen ? "0 0 16px rgba(0,229,255,0.25), inset 0 1px 0 rgba(255,255,255,0.12)" : "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        title={app.name}
      >
        {app.icon}
      </button>

      {/* Running dot */}
      <div className="mt-1 h-1 flex items-center justify-center">
        {(isOpen || isMinimized) && (
          <div
            className="w-1 h-1 rounded-full"
            style={{
              background: isOpen ? "#00e5ff" : "rgba(0,229,255,0.4)",
              boxShadow: isOpen ? "0 0 6px #00e5ff, 0 0 12px rgba(0,229,255,0.5)" : "none",
            }}
          />
        )}
      </div>
    </div>
  );
}
