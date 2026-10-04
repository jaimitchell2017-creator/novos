# NOVOS project map

## Main OS
- `src/App.tsx` — login, app registry, windows, settings and persistence
- `src/components/Desktop.tsx` — desktop and built-in app routing
- `src/components/OSWindow.tsx` — movable/maximizable windows
- `src/components/Dock.tsx` — dock/app launcher
- `src/components/TopBar.tsx` — top system bar

## Built-in apps
- `src/apps/Browser.tsx` — Navigator; iframe on web, Chromium `<webview>` in Electron
- `src/apps/FileManager.tsx` — Files
- `src/apps/Settings.tsx` — personalization/system settings
- `src/apps/AppStore.tsx` — app installation/store UI
- `src/apps/AppBuilder.tsx` — HTML app builder and publishing
- `src/apps/Notes.tsx` — local notes
- `src/apps/Calculator.tsx` — calculator
- `src/apps/Weather.tsx` — free weather data
- `src/apps/Camera.tsx` — camera access
- `src/apps/Flappy.tsx` — NOVOS Flappy
- `src/apps/AI.tsx` — local Transformers.js AI
- `src/apps/BugChecker.tsx` — code checks
- `src/apps/Downloads.tsx` — platform build/download center

## Desktop packaging
- `electron/main.cjs` — Electron main process
- `electron/preload.cjs` — isolated preload bridge
- `electron-builder.yml` — Windows/Linux/macOS packaging targets

## Mobile packaging
- `capacitor.config.ts` — Capacitor configuration
- `docs/MOBILE-BUILD.md` — Android/iOS instructions

## Web/PWA
- `public/manifest.webmanifest`
- `public/sw.js`
