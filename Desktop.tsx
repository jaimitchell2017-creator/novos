import { useState } from "react";
import { OSUser, OSApp, OSWindow, OSSettings, CustomDomain } from "../types";
import TopBar from "./TopBar";
import Dock from "./Dock";
import OSWindowComponent from "./OSWindow";
import AppStore from "../apps/AppStore";
import Settings from "../apps/Settings";
import FileManager from "../apps/FileManager";
import Browser from "../apps/Browser";
import AppBuilder from "../apps/AppBuilder";
import Notes from "../apps/Notes";
import Calculator from "../apps/Calculator";
import Weather from "../apps/Weather";
import Camera from "../apps/Camera";
import Flappy from "../apps/Flappy";
import AI from "../apps/AI";
import Downloads from "../apps/Downloads";
import BugChecker from "../apps/BugChecker";

interface Props {
  user: OSUser;
  apps: OSApp[];
  windows: OSWindow[];
  settings: OSSettings;
  customDomains: CustomDomain[];
  onOpenApp: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onUpdateWindow: (id: string, changes: Partial<OSWindow>) => void;
  onBringToFront: (id: string) => void;
  onAddApp: (app: OSApp) => void;
  onInstallApp: (id: string) => void;
  onUninstallApp: (id: string) => void;
  onUpdateSettings: (s: OSSettings) => void;
  onAddCustomDomain: (d: CustomDomain) => void;
  onRemoveCustomDomain: (domain: string) => void;
  onLogout: () => void;
}

function renderApp(appId: string, props: Props) {
  const app = props.apps.find((a) => a.id === appId);
  if (!app) return null;
  switch (appId) {
    case "appstore":  return <AppStore apps={props.apps} user={props.user} onOpenApp={props.onOpenApp} onInstallApp={props.onInstallApp} onUninstallApp={props.onUninstallApp} />;
    case "settings":  return <Settings settings={props.settings} user={props.user} onUpdate={props.onUpdateSettings} onLogout={props.onLogout} />;
    case "files":     return <FileManager />;
    case "browser":   return <Browser customDomains={props.customDomains} onAddDomain={props.onAddCustomDomain} onRemoveDomain={props.onRemoveCustomDomain} />;
    case "appbuilder": return <AppBuilder user={props.user} onPublish={props.onAddApp} />;
    case "notes": return <Notes />;
    case "calculator": return <Calculator />;
    case "weather": return <Weather />;
    case "camera": return <Camera />;
    case "flappy": return <Flappy />;
    case "ai": return <AI />;
    case "downloads": return <Downloads />;
    case "bugchecker": return <BugChecker />;
    default:
      if (app.type === "url" && app.url) return <iframe src={app.url} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation" title={app.name} />;
      if (app.type === "html" && app.code) return <iframe srcDoc={app.code} className="w-full h-full border-0" sandbox="allow-scripts allow-forms" title={app.name} />;
      return <div className="flex items-center justify-center h-full text-white/30">App unavailable</div>;
  }
}

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: (i * 127.3 + 50) % 100,
  y: (i * 97.7 + 20) % 100,
  r: ((i * 31) % 3) * 0.4 + 0.3,
  delay: (i * 0.4) % 5,
  dur: 3 + (i % 4),
}));

export default function Desktop(props: Props) {
  const { user, apps, windows, settings, onOpenApp, onCloseWindow, onUpdateWindow, onBringToFront } = props;
  const [iconSelected, setIconSelected] = useState<string | null>(null);

  const customApps = apps.filter((a) => a.installed && !a.builtIn && !(a.adminOnly && !user.isAdmin));

  return (
    <div className={`relative h-full w-full overflow-hidden ${settings.wallpaper}`}>

      {/* Animated stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        {STARS.map((s) => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white">
            <animate attributeName="opacity" values="0.08;0.5;0.08" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Ambient nebula orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[700px] h-[700px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.25) 0%, transparent 65%)", animation: "orb-drift 25s ease-in-out infinite" }} />
        <div className="absolute bottom-[5%] right-[2%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 65%)", animation: "orb-drift-2 30s ease-in-out infinite" }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* Top bar */}
      <TopBar user={user} settings={settings} onLogout={props.onLogout} onOpenApp={onOpenApp} />

      {/* Desktop icons — custom apps only */}
      {customApps.length > 0 && (
        <div className="absolute top-14 left-4 pt-2 flex flex-col gap-2">
          {customApps.slice(0, 10).map((app) => (
            <button
              key={app.id}
              onDoubleClick={() => onOpenApp(app.id)}
              onClick={() => setIconSelected(app.id === iconSelected ? null : app.id)}
              className="flex flex-col items-center gap-1.5 w-[72px] group py-2 px-1 rounded-xl transition-all"
              style={{
                background: iconSelected === app.id ? "rgba(0,229,255,0.1)" : "transparent",
                border: `1px solid ${iconSelected === app.id ? "rgba(0,229,255,0.3)" : "transparent"}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all group-hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, rgba(8,22,55,0.85), rgba(4,12,34,0.9))",
                  border: "1px solid rgba(0,229,255,0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {app.icon}
              </div>
              <span
                className="text-white/70 text-[10px] text-center leading-tight group-hover:text-white transition-colors truncate w-full"
                style={{ fontFamily: "'Exo 2', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
              >
                {app.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Windows */}
      {windows.map((win) => (
        <OSWindowComponent
          key={win.id}
          win={win}
          onClose={() => onCloseWindow(win.id)}
          onUpdate={(c) => onUpdateWindow(win.id, c)}
          onFocus={() => onBringToFront(win.id)}
        >
          {renderApp(win.appId, props)}
        </OSWindowComponent>
      ))}

      {/* Dock */}
      <Dock apps={apps} windows={windows} user={user} onOpenApp={onOpenApp} />
    </div>
  );
}
