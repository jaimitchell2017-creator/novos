# NOVOS build guide

This project is the portable NOVOS source. It can run as a normal web app and can also be packaged as a desktop app.

## Web / ChromeOS
`npm install` then `npm run build`. Deploy `dist/` to any static host. ChromeOS can use the web app as an installed PWA.

## Windows / Linux / macOS
`npm install` then run one of:
- `npm run desktop:windows`
- `npm run desktop:linux`
- `npm run desktop:mac`

The desktop shell uses Electron/Chromium. The NOVOS Navigator switches from an iframe in the web build to an Electron `<webview>` in the native build, so websites are rendered by Chromium instead of being forced into a normal website iframe.

## Android / iOS
The React web app is ready to be wrapped with a native WebView container (for example Capacitor). Android APKs can be built with Android Studio/Gradle. iOS builds require Xcode on macOS. Building locally does not itself require a paid store subscription; publishing to official stores can have separate account requirements.

## Free distribution
You can host the web download page on GitHub Pages or another static host. Native installers can be linked from that page after they are built. Do not claim a download exists until the corresponding file has actually been uploaded.

## Lockfile note

If you change dependencies, run `npm install` (or use the package manager you normally use) so the lockfile is regenerated for the package manager you choose. The included source is the authoritative project configuration.
