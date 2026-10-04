import { useState, useRef, useCallback } from "react";
import type { CustomDomain } from "../types";

interface Props {
  customDomains: CustomDomain[];
  onAddDomain: (d: CustomDomain) => void;
  onRemoveDomain: (domain: string) => void;
}

function resolveUrl(input: string, domains: CustomDomain[]): string {
  const trimmed = input.trim();

  // Check custom domains (e.g. "mysite.novos")
  const matchedDomain = domains.find((d) => d.domain === trimmed || trimmed === `https://${d.domain}` || trimmed === `http://${d.domain}`);
  if (matchedDomain) return matchedDomain.url;

  // If it looks like a real URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  // If it has a dot but no space — treat as URL
  if (trimmed.includes(".") && !trimmed.includes(" ")) return `https://${trimmed}`;

  // Otherwise — Google search
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export default function Browser({ customDomains, onAddDomain, onRemoveDomain }: Props) {
  const [url, setUrl] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [tab, setTab] = useState<"browser" | "domains">("browser");
  const [newDomain, setNewDomain] = useState({ domain: "", url: "", title: "" });
  const [domainError, setDomainError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [viewKey, setViewKey] = useState(0);

  const navigate = useCallback(
    (target: string) => {
      const resolved = resolveUrl(target, customDomains);
      setUrl(resolved);
      setInputVal(target);
      setLoading(true);
      setHistory((h) => {
        const newH = [...h.slice(0, histIdx + 1), resolved];
        setHistIdx(newH.length - 1);
        return newH;
      });
    },
    [customDomains, histIdx]
  );

  const goBack = () => {
    if (histIdx > 0) {
      const newIdx = histIdx - 1;
      setHistIdx(newIdx);
      setUrl(history[newIdx]);
      setInputVal(history[newIdx]);
      setLoading(true);
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      setUrl(history[newIdx]);
      setInputVal(history[newIdx]);
      setLoading(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) navigate(inputVal);
  };

  const addDomain = () => {
    setDomainError("");
    if (!newDomain.domain.trim()) { setDomainError("Domain name is required"); return; }
    if (!newDomain.url.trim()) { setDomainError("URL is required"); return; }
    if (!newDomain.url.startsWith("http")) { setDomainError("URL must start with http:// or https://"); return; }
    const domainName = newDomain.domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    onAddDomain({ domain: domainName, url: newDomain.url.trim(), title: newDomain.title.trim() || domainName });
    setNewDomain({ domain: "", url: "", title: "" });
  };

  return (
    <div className="h-full flex flex-col text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {/* Nav bar */}
      <div className="flex-shrink-0 border-b border-cyan-500/10 px-2 pt-2 pb-1.5">
        {/* Tabs */}
        <div className="flex gap-1 mb-2">
          {[{ id: "browser" as const, label: "Browser" }, { id: "domains" as const, label: "My Sites & Domains" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: tab === t.id ? "rgba(0,229,255,0.15)" : "transparent",
                color: tab === t.id ? "#00e5ff" : "rgba(255,255,255,0.4)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* URL Bar */}
        <div className="flex items-center gap-2">
          <button onClick={goBack} disabled={histIdx <= 0} className="p-1.5 rounded-lg text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors text-sm">←</button>
          <button onClick={goForward} disabled={histIdx >= history.length - 1} className="p-1.5 rounded-lg text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors text-sm">→</button>
          <button onClick={() => { if (url) { setLoading(true); setViewKey((k) => k + 1); if (iframeRef.current) iframeRef.current.src = url; } }} className="p-1.5 rounded-lg text-white/40 hover:text-white/80 transition-colors text-sm">↻</button>

          <form onSubmit={handleSubmit} className="flex-1 flex">
            <div className="flex-1 flex items-center gap-2 bg-white/5 border border-cyan-500/20 rounded-xl px-3 py-1.5 focus-within:border-cyan-400/40 transition-all">
              <span className="text-white/30 text-xs">{loading ? "⏳" : "🔒"}</span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search or enter address... (e.g. mysite.novos)"
                className="flex-1 bg-transparent text-white/80 text-xs outline-none placeholder-white/20"
              />
            </div>
          </form>
        </div>

        {/* Bookmarks — custom domains only */}
        {customDomains.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto os-scrollbar pb-1">
          {customDomains.map((d) => (
            <button
              key={d.domain}
              onClick={() => navigate(d.domain)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all whitespace-nowrap flex-shrink-0"
            >
              <span>🌐</span>
              <span>{d.title || d.domain}</span>
            </button>
          ))}
        </div>
        )}
      </div>

      {tab === "browser" && (
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {!url ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🌐</div>
                <h2 className="text-white/60 text-lg font-semibold mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>Navigator</h2>
                <p className="text-white/30 text-sm max-w-sm">Enter any URL above to visit a website, or register your own custom NovOS domain in the My Sites tab.</p>
              </div>

              {customDomains.length > 0 && (
                <div className="w-full max-w-sm">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-3">My Sites</p>
                  <div className="grid grid-cols-2 gap-2">
                    {customDomains.map((d) => (
                      <button
                        key={d.domain}
                        onClick={() => navigate(d.domain)}
                        className="glass-light rounded-xl p-3 flex items-center gap-2 text-left hover:border-cyan-500/30 transition-all"
                      >
                        <span>🌐</span>
                        <div className="min-w-0">
                          <p className="text-white/70 text-xs font-medium truncate">{d.title}</p>
                          <p className="text-cyan-400/60 text-[10px] truncate">{d.domain}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {customDomains.length === 0 && (
                <button
                  onClick={() => setTab("domains")}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.25)", color: "#00e5ff" }}
                >
                  + Register your first site →
                </button>
              )}
            </div>
          ) : (
            (window as any).electronAPI ? (() => {
              const NativeWebview = "webview" as any;
              return <NativeWebview
                key={viewKey}
                src={url}
                className="absolute inset-0 w-full h-full border-0 block"
                allowpopups="true"
                title="NOVOS Browser"
                onDidStartLoading={() => setLoading(true)}
                onDidStopLoading={() => setLoading(false)}
              />;
            })() : (
              <iframe
                key={viewKey}
                ref={iframeRef}
                src={url}
                className="absolute inset-0 w-full h-full border-0 block"
                onLoad={() => setLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                title="Browser"
              />
            )
          )}
        </div>
      )}

      {tab === "domains" && (
        <div className="flex-1 overflow-y-auto os-scrollbar p-6">
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>My Sites & Custom Domains</h2>
              <p className="text-white/40 text-sm">Register a custom NovOS domain that points to any website — including Google Sites.</p>
            </div>

            {/* Add domain */}
            <div className="glass-light rounded-2xl p-4 space-y-3">
              <h3 className="text-white/70 text-sm font-semibold">Register New Domain</h3>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Domain Name</label>
                <input
                  value={newDomain.domain}
                  onChange={(e) => setNewDomain((d) => ({ ...d, domain: e.target.value }))}
                  placeholder="mysite.novos"
                  className="w-full bg-white/5 border border-cyan-500/20 rounded-xl px-3 py-2 text-white/80 text-sm outline-none focus:border-cyan-400/40 transition-all placeholder-white/20"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Points To (URL)</label>
                <input
                  value={newDomain.url}
                  onChange={(e) => setNewDomain((d) => ({ ...d, url: e.target.value }))}
                  placeholder="https://sites.google.com/view/mysite"
                  className="w-full bg-white/5 border border-cyan-500/20 rounded-xl px-3 py-2 text-white/80 text-sm outline-none focus:border-cyan-400/40 transition-all placeholder-white/20"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Display Title (optional)</label>
                <input
                  value={newDomain.title}
                  onChange={(e) => setNewDomain((d) => ({ ...d, title: e.target.value }))}
                  placeholder="My Awesome Site"
                  className="w-full bg-white/5 border border-cyan-500/20 rounded-xl px-3 py-2 text-white/80 text-sm outline-none focus:border-cyan-400/40 transition-all placeholder-white/20"
                />
              </div>
              {domainError && <p className="text-red-400 text-xs">{domainError}</p>}
              <button
                onClick={addDomain}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                Register Domain
              </button>
            </div>

            {/* Domain list */}
            {customDomains.length > 0 && (
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-widest mb-3">Registered Domains</h3>
                <div className="space-y-2">
                  {customDomains.map((d) => (
                    <div key={d.domain} className="glass-light rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-cyan-400 text-sm font-mono">{d.domain}</p>
                        <p className="text-white/30 text-xs truncate mt-0.5">→ {d.url}</p>
                      </div>
                      <button
                        onClick={() => navigate(d.domain)}
                        className="px-3 py-1 rounded-lg text-xs text-cyan-400/70 hover:bg-cyan-500/10 transition-colors"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => onRemoveDomain(d.domain)}
                        className="px-2 py-1 rounded-lg text-xs text-red-400/50 hover:bg-red-500/10 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-light rounded-xl p-4 border border-cyan-500/10">
              <p className="text-white/50 text-xs leading-relaxed">
                <span className="text-cyan-400 font-semibold">Tip:</span> Build your own website, then paste its URL here and give it a custom NovOS domain like{" "}
                <span className="font-mono text-cyan-300">mysite.novos</span> to access it instantly from the browser.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
