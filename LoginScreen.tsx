import { useState, useEffect } from "react";

interface Props {
  onLogin: (email: string, name: string) => void;
}

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: (i * 127.3) % 100,
  y: (i * 97.7) % 100,
  r: ((i * 31) % 3) * 0.5 + 0.5,
  delay: (i * 0.3) % 4,
  dur: 2 + (i % 4),
}));

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"email" | "name">("email");
  const [error, setError] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = email.trim().toLowerCase();
    if (!t || !t.includes("@")) { setError("Please enter a valid email address"); return; }
    setError(""); setStep("name");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter a username"); return; }
    onLogin(email.trim().toLowerCase(), name.trim());
  };

  const hh = time.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = time.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="relative h-full w-full overflow-hidden wallpaper-aurora flex flex-col items-center justify-center select-none">

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none opacity-60" />

      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        {STARS.map((s) => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white">
            <animate attributeName="opacity" values="0.1;0.7;0.1" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Animated nebula orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)", animation: "orb-drift 20s ease-in-out infinite" }} />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", animation: "orb-drift-2 26s ease-in-out infinite" }} />
        <div className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", animation: "orb-drift 18s ease-in-out infinite reverse" }} />
      </div>

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)", animation: "scan 8s linear infinite", boxShadow: "0 0 20px rgba(0,229,255,0.3)" }} />

      {/* ── Top: Logo ── */}
      <div className="animate-boot mb-2 flex flex-col items-center gap-3">
        {/* Spinning ring logo */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-violet-500/30 animate-spin-rev" />
          <div className="absolute inset-4 rounded-full" style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(124,58,237,0.3))", boxShadow: "0 0 24px rgba(0,229,255,0.4)" }} />
          <span className="relative text-3xl glow-text" style={{ textShadow: "0 0 16px rgba(0,229,255,0.9)" }}>✦</span>
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-[0.15em]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-white" style={{ textShadow: "0 0 30px rgba(0,229,255,0.4)" }}>NOV</span>
            <span className="shimmer-text">OS</span>
          </h1>
          <p className="text-white/30 text-[11px] tracking-[0.4em] uppercase mt-1">Next Generation Operating System</p>
        </div>
      </div>

      {/* ── Center: Clock ── */}
      <div className="animate-boot my-6 text-center" style={{ animationDelay: "0.1s" }}>
        <div className="tabular-nums font-black leading-none"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(3rem, 10vw, 5.5rem)", color: "rgba(255,255,255,0.92)", textShadow: "0 0 40px rgba(0,229,255,0.3), 0 0 80px rgba(0,229,255,0.15)" }}>
          {hh}
        </div>
        <p className="text-white/40 text-sm tracking-widest mt-2">{dateStr}</p>
      </div>

      {/* ── Login card ── */}
      <div className="animate-boot w-full max-w-[360px] px-4" style={{ animationDelay: "0.2s" }}>
        <div className="grad-border animate-glow-pulse">
          <div className="grad-border-inner p-7">

            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <p className="text-white/50 text-xs tracking-[0.3em] uppercase">Sign in to NovOS</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/40 text-[10px] tracking-[0.2em] uppercase block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="os-input w-full text-sm"
                  />
                </div>

                {error && (
                  <p className="text-red-400/80 text-xs flex items-center gap-1.5">
                    <span>⚠</span> {error}
                  </p>
                )}

                <button type="submit" className="os-btn-primary w-full">Continue →</button>

                <p className="text-center text-white/20 text-[10px] tracking-wider pt-1">
                  Open to all · Admin access by invite
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ background: "conic-gradient(from 0deg, #00e5ff, #7c3aed, #f0abfc, #00e5ff)" }} />
                    <div className="absolute inset-0.5 rounded-full" style={{ background: "linear-gradient(135deg, #08143c, #020918)" }} />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  </div>
                  <p className="text-white/40 text-xs truncate max-w-full px-2">{email}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/40 text-[10px] tracking-[0.2em] uppercase block">Username</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Choose a username"
                    autoFocus
                    className="os-input w-full text-sm"
                  />
                </div>

                {error && (
                  <p className="text-red-400/80 text-xs flex items-center gap-1.5">
                    <span>⚠</span> {error}
                  </p>
                )}

                <button type="submit" className="os-btn-primary w-full">Enter NovOS</button>
                <button type="button" onClick={() => { setStep("email"); setError(""); }}
                  className="w-full text-white/25 text-xs hover:text-white/50 transition-colors py-1">
                  ← Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
