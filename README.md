# NOVOS

NOVOS is a browser-based operating system and app ecosystem built from the original uploaded Figma export, expanded into a portable multi-platform codebase.

## Included

- NOVOS desktop UI with login, windows, dock and settings
- Navigator browser with custom NOVOS domains
- Files
- Settings
- App Store
- App Builder for single-file HTML apps
- Notes
- Calculator
- Weather
- Camera
- NOVOS Flappy
- Bug Checker
- Get NOVOS
- NOVOS AI using Transformers.js 3.8.1 + SmolLM2-135M-Instruct-ONNX with q4/WASM configuration and no API key
- PWA/web support
- Electron/Chromium desktop packaging
- Capacitor configuration for Android/iOS packaging

## Important AI note

NOVOS AI is designed for on-device inference without a paid API key. The first run may need to download model assets before the model is available from the local cache. Generation errors are caught in the app so they should not reload the whole NOVOS interface.

## Browser note

The web version is subject to normal browser iframe security restrictions. Sites that disallow embedding may refuse to load. The Electron desktop build uses Chromium's `<webview>` for the browser surface instead of the normal web-page iframe. It does not bypass website security policies.

## Build

```bash
npm install
npm run build
```

Desktop:

```bash
npm run desktop:windows
npm run desktop:linux
npm run desktop:mac
```

Mobile setup:

```bash
npm run mobile:init
```

Then follow `docs/MOBILE-BUILD.md`.

See `BUILD.md`, `PROJECT-MAP.md`, and `docs/RELEASE-CHECKLIST.md` for more information.

## NOVOS local-first architecture

The App Builder no longer depends on Supabase. Accounts, app listings and reviews are stored locally on the device. Native NOVOS applications use the `.napp` v1 format and can be imported/exported from the App Builder.

For a public multi-device store, a separate backend can be added later; this build deliberately does not require one.
