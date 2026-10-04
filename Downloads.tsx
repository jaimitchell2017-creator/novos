const platforms = [
  ['windows', '🪟', 'Windows', 'NOVOS-Setup.exe', 'Electron / Chromium'],
  ['linux', '🐧', 'Linux', 'NOVOS.AppImage', 'Electron / Chromium'],
  ['macos', '🍎', 'macOS', 'NOVOS.dmg', 'Electron / Chromium'],
  ['android', '🤖', 'Android', 'NOVOS.apk', 'Capacitor / Android Studio'],
  ['ios', '📱', 'iOS', 'NOVOS iOS build', 'Capacitor / Xcode'],
  ['chromeos', '💻', 'ChromeOS', 'NOVOS web/PWA', 'Browser / PWA'],
] as const;

export default function Downloads() {
  return (
    <div className="h-full overflow-auto p-6 text-white">
      <h1 className="text-2xl font-bold">⬇️ Get NOVOS</h1>
      <p className="text-white/40 text-sm mt-1 mb-6">
        NOVOS can be packaged for desktop, mobile and the web from the same codebase.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {platforms.map(([id, icon, name, file, method]) => (
          <div key={id} className="glass-light rounded-2xl p-5">
            <div className="text-3xl">{icon}</div>
            <h2 className="font-semibold mt-2">{name}</h2>
            <p className="text-white/35 text-xs mt-1">{file}</p>
            <p className="text-cyan-400/50 text-[10px] mt-1">{method}</p>
            <div className="mt-4 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-center text-white/40 text-xs">
              Build required
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-100/70 text-xs">
        This screen never pretends an installer exists when it has not been built. After you build a
        package, upload the real file to your release host and connect the download button to it.
      </div>
    </div>
  );
}
