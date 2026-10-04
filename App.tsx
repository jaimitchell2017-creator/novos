import { useState, useEffect, useCallback } from "react";
import { OSUser, OSApp, OSWindow, OSSettings, CustomDomain } from "./types";
import { createOrLoginAccount, loadSession, clearSession } from "./lib/localStore";
import LoginScreen from "./components/LoginScreen";
import Desktop from "./components/Desktop";

const ADMIN_EMAILS: string[] = [];

const DEFAULT_APPS: OSApp[] = [
  {
    id: "browser",
    name: "Navigator",
    icon: "🌐",
    description: "A powerful web browser with custom domain support and site builder",
    category: "Utilities",
    builtIn: true,
    type: "builtin",
    installed: true,
    version: "1.0",
    author: "NovOS",
    rating: 5,
    downloads: 10000,
  },
  {
    id: "files",
    name: "Files",
    icon: "📁",
    description: "Browse, manage and access files including USB drives and external storage",
    category: "Utilities",
    builtIn: true,
    type: "builtin",
    installed: true,
    version: "1.0",
    author: "NovOS",
    rating: 5,
    downloads: 10000,
  },
  {
    id: "settings",
    name: "Settings",
    icon: "⚙️",
    description: "Customize your NovOS experience — wallpaper, theme, and system preferences",
    category: "Utilities",
    builtIn: true,
    type: "builtin",
    installed: true,
    version: "1.0",
    author: "NovOS",
    rating: 5,
    downloads: 10000,
  },
  {
    id: "appstore",
    name: "App Store",
    icon: "🛒",
    description: "Discover and install apps for your NovOS system",
    category: "Utilities",
    builtIn: true,
    type: "builtin",
    installed: true,
    version: "1.0",
    author: "NovOS",
    rating: 5,
    downloads: 10000,
  },
  {
    id: "appbuilder",
    name: "App Builder",
    icon: "🔧",
    description: "Create and publish apps to the NovOS App Store — admin only",
    category: "Developer",
    builtIn: true,
    adminOnly: true,
    type: "builtin",
    installed: true,
    version: "1.0",
    author: "NovOS",
    rating: 5,
    downloads: 0,
  },
  { id: "notes", name: "Notes", icon: "📝", description: "Write and save notes locally", category: "Productivity", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
  { id: "calculator", name: "Calculator", icon: "🧮", description: "Fast everyday calculator", category: "Utilities", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
  { id: "weather", name: "Weather", icon: "🌤️", description: "Live weather with free data", category: "Utilities", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
  { id: "camera", name: "Camera", icon: "📷", description: "Use your device camera and take photos", category: "Utilities", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
  { id: "flappy", name: "NOVOS Flappy", icon: "🐤", description: "A simple NOVOS game", category: "Entertainment", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
  { id: "ai", name: "NOVOS AI", icon: "🤖", description: "Ask NOVOS AI for help", category: "Developer", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
  { id: "downloads", name: "Get NOVOS", icon: "⬇️", description: "Download NOVOS for Windows, Linux, macOS, Android, iOS and ChromeOS", category: "Utilities", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
  { id: "bugchecker", name: "Bug Checker", icon: "🪲", description: "Check code for common bugs", category: "Developer", builtIn: true, type: "builtin", installed: true, version: "1.0", author: "NOVOS", rating: 5, downloads: 1000 },
];

const DEFAULT_SETTINGS: OSSettings = {
  wallpaper: "wallpaper-aurora",
  accentColor: "#00e5ff",
  userName: "User",
  clockFormat: "12",
  showSeconds: true,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

export default function App() {
  const [user, setUser] = useState<OSUser | null>(() => {
    const saved = loadSession();
    return saved ? { email: saved.email, name: saved.username, username: saved.username, isAdmin: saved.isAdmin } : null;
  });
  const [settings, setSettings] = useState<OSSettings>(() =>
    loadFromStorage("novos_settings", DEFAULT_SETTINGS)
  );
  const [apps, setApps] = useState<OSApp[]>(() => {
    const stored = loadFromStorage<OSApp[]>("novos_apps", []);
    const builtInIds = DEFAULT_APPS.map((a) => a.id);
    const customApps = stored.filter((a) => !builtInIds.includes(a.id));
    return [...DEFAULT_APPS, ...customApps];
  });
  const [windows, setWindows] = useState<OSWindow[]>([]);
  const [nextZ, setNextZ] = useState(100);
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>(() =>
    loadFromStorage("novos_domains", [])
  );

  useEffect(() => {
    const custom = apps.filter((a) => !a.builtIn);
    localStorage.setItem("novos_apps", JSON.stringify(custom));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem("novos_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("novos_domains", JSON.stringify(customDomains));
  }, [customDomains]);

  const login = useCallback((email: string, name: string) => {
    const account = createOrLoginAccount(email, name);
    setUser({ email: account.email, name: account.username, username: account.username, isAdmin: account.isAdmin || ADMIN_EMAILS.includes(account.email) });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setWindows([]);
  }, []);

  const openApp = useCallback(
    (appId: string) => {
      const app = apps.find((a) => a.id === appId);
      if (!app) return;
      if (app.adminOnly && !user?.isAdmin) return;

      const existing = windows.find((w) => w.appId === appId);
      if (existing) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existing.id ? { ...w, minimized: false, zIndex: nextZ } : w
          )
        );
        setNextZ((z) => z + 1);
        return;
      }

      const isMobile = window.innerWidth < 768;
      const w = isMobile ? window.innerWidth : Math.min(900, window.innerWidth - 80);
      const h = isMobile ? window.innerHeight - 60 : Math.min(620, window.innerHeight - 120);
      const x = isMobile ? 0 : Math.random() * Math.max(0, window.innerWidth - w - 80) + 40;
      const y = isMobile ? 40 : Math.random() * Math.max(0, window.innerHeight - h - 100) + 40;

      const newWindow: OSWindow = {
        id: `win-${Date.now()}`,
        appId,
        title: app.name,
        icon: app.icon,
        x,
        y,
        width: w,
        height: h,
        minimized: false,
        maximized: isMobile,
        zIndex: nextZ,
      };
      setWindows((prev) => [...prev, newWindow]);
      setNextZ((z) => z + 1);
    },
    [apps, windows, user, nextZ]
  );

  const closeWindow = useCallback((winId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== winId));
  }, []);

  const updateWindow = useCallback((winId: string, changes: Partial<OSWindow>) => {
    setWindows((prev) => prev.map((w) => (w.id === winId ? { ...w, ...changes } : w)));
  }, []);

  const bringToFront = useCallback(
    (winId: string) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === winId ? { ...w, zIndex: nextZ } : w))
      );
      setNextZ((z) => z + 1);
    },
    [nextZ]
  );

  const addApp = useCallback((app: OSApp) => {
    setApps((prev) => {
      const without = prev.filter((a) => a.id !== app.id);
      return [...without, { ...app, installed: true }];
    });
  }, []);

  // Marks as uninstalled but keeps it in the store
  const uninstallApp = useCallback((appId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId && !a.builtIn ? { ...a, installed: false } : a))
    );
    setWindows((prev) => prev.filter((w) => w.appId !== appId));
  }, []);

  const installApp = useCallback((appId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, installed: true } : a))
    );
  }, []);

  const addCustomDomain = useCallback((domain: CustomDomain) => {
    setCustomDomains((prev) => {
      const without = prev.filter((d) => d.domain !== domain.domain);
      return [...without, domain];
    });
  }, []);

  const removeCustomDomain = useCallback((domain: string) => {
    setCustomDomains((prev) => prev.filter((d) => d.domain !== domain));
  }, []);

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <Desktop
      user={user}
      apps={apps}
      windows={windows}
      settings={settings}
      customDomains={customDomains}
      onOpenApp={openApp}
      onCloseWindow={closeWindow}
      onUpdateWindow={updateWindow}
      onBringToFront={bringToFront}
      onAddApp={addApp}
      onInstallApp={installApp}
      onUninstallApp={uninstallApp}
      onUpdateSettings={setSettings}
      onAddCustomDomain={addCustomDomain}
      onRemoveCustomDomain={removeCustomDomain}
      onLogout={logout}
    />
  );
}
