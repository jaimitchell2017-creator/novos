# NOVOS release checklist

Before publishing a release, verify that the actual package exists.

- [ ] Web/PWA: `dist/`
- [ ] Windows: `release/NOVOS Setup*.exe`
- [ ] Linux: `release/NOVOS*.AppImage`
- [ ] macOS: `release/NOVOS*.dmg`
- [ ] Android: APK produced by Android Studio/Gradle
- [ ] iOS: iOS build produced by Xcode
- [ ] Test login
- [ ] Test built-in apps
- [ ] Test App Builder HTML preview/publish
- [ ] Test NOVOS AI with a simple prompt
- [ ] Confirm an AI error does not reload the whole OS
- [ ] Test Browser back/forward/reload
- [ ] Test a site that allows embedding in the web build
- [ ] Test Chromium Browser behavior in the Electron build
- [ ] Test camera permission
- [ ] Test local Notes persistence
- [ ] Test mobile touch layout

Never publish a download button for a package that has not actually been built and uploaded.
