import { useState } from "react";
import { OSApp, OSUser } from "../types";
import { downloadNapp, makeNapp } from "../lib/napp";

const CATEGORIES = ["All", "Utilities", "Productivity", "Entertainment", "Developer", "Social", "Education"];

interface Props {
  apps: OSApp[];
  user: OSUser;
  onOpenApp: (id: string) => void;
  onInstallApp: (id: string) => void;
  onUninstallApp: (id: string) => void;
}

export default function AppStore({ apps, user, onOpenApp, onInstallApp, onUninstallApp }: Props) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<Record<string, number>>(() => { try { return JSON.parse(localStorage.getItem("novos_reviews") || "{}"); } catch { return {}; } });
  const rate = (id: string, rating: number) => { const next = { ...reviews, [id]: rating }; setReviews(next); localStorage.setItem("novos_reviews", JSON.stringify(next)); };

  const filtered = apps
    .filter((a) => !a.adminOnly || user.isAdmin)
    .filter((a) => category === "All" || a.category === category)
    .filter((a) =>
      !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="h-full flex flex-col bg-transparent text-white os-scrollbar" style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-cyan-500/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              App Store
            </h1>
            <p className="text-white/40 text-sm mt-0.5">{apps.filter((a) => !a.adminOnly || user.isAdmin).length} apps available</p>
          </div>
          {user.isAdmin && (
            <button
              onClick={() => onOpenApp("appbuilder")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              <span>+</span> Add App
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-cyan-500/20 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 outline-none focus:border-cyan-400/40 transition-all text-sm"
        />

        {/* Categories */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: category === c ? "rgba(0,229,255,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${category === c ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: category === c ? "#00e5ff" : "rgba(255,255,255,0.5)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* App Grid */}
      <div className="flex-1 overflow-y-auto os-scrollbar p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
            <span className="text-5xl">🔍</span>
            <p>No apps found</p>
            {user.isAdmin && (
              <button
                onClick={() => onOpenApp("appbuilder")}
                className="px-4 py-2 rounded-xl border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/10 transition-colors"
              >
                Create one →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                user={user}
                onOpen={() => onOpenApp(app.id)}
                onInstall={() => onInstallApp(app.id)}
                onUninstall={() => onUninstallApp(app.id)}
                review={reviews[app.id] || 0}
                onReview={(r) => rate(app.id, r)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppCard({ app, user, onOpen, onInstall, onUninstall, review, onReview }: {
  app: OSApp; user: OSUser;
  onOpen: () => void; onInstall: () => void; onUninstall: () => void;
  review: number; onReview: (rating: number) => void;
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i < (app.rating ?? 0));
  const isInstalled = app.installed !== false;

  return (
    <div className="glass-light rounded-2xl p-4 flex flex-col gap-3 hover:border-cyan-500/30 transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)" }}>
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white/90 font-semibold text-sm truncate">{app.name}</h3>
            {app.adminOnly && (
              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[9px] font-bold flex-shrink-0">ADMIN</span>
            )}
            {isInstalled && !app.builtIn && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 text-[9px] font-semibold flex-shrink-0">INSTALLED</span>
            )}
          </div>
          <p className="text-white/40 text-[11px] mt-0.5">{app.category} · {app.author ?? "Community"}</p>
          {app.rating !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {stars.map((filled, i) => (
                <span key={i} className="text-[10px]" style={{ color: filled ? "#fbbf24" : "rgba(255,255,255,0.15)" }}>★</span>
              ))}
              <span className="text-white/30 text-[10px] ml-1">{app.downloads?.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{app.description}</p>

      <div className="flex items-center gap-1 text-[10px] text-white/40">
        <span>Review:</span>{[1,2,3,4,5].map(n => <button key={n} onClick={() => onReview(n)} className={n <= review ? "text-amber-300" : "text-white/20"}>★</button>)}
      </div>
      {app.type === "html" && app.code && (
        <button onClick={() => downloadNapp(makeNapp({ id: app.id, name: app.name, version: app.version || "1.0.0", description: app.description, icon: app.icon, category: app.category, author: app.author || user.username, permissions: app.permissions || ["internet"] }, app.code!))} className="text-left text-[10px] text-cyan-300/70 hover:text-cyan-300">↓ Export this app as .napp</button>
      )}

      <div className="flex gap-2 mt-auto">
        {isInstalled ? (
          <>
            <button
              onClick={onOpen}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: "linear-gradient(90deg, rgba(0,229,255,0.2), rgba(124,58,237,0.2))",
                border: "1px solid rgba(0,229,255,0.3)",
                color: "#00e5ff",
              }}
            >
              Open
            </button>
            {!app.builtIn && (
              <button
                onClick={onUninstall}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400/70 hover:bg-red-500/10 border border-red-500/20 transition-all"
                title="Uninstall this app"
              >
                Uninstall
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onInstall}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: "linear-gradient(90deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))",
              border: "1px solid rgba(0,229,255,0.25)",
              color: "rgba(0,229,255,0.8)",
            }}
          >
            ＋ Install
          </button>
        )}
      </div>
    </div>
  );
}
