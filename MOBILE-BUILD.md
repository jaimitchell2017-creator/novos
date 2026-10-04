# NOVOS Android and iOS builds

The NOVOS React app can also be wrapped as a native mobile app with Capacitor.

## Android

1. Install Node.js and Android Studio.
2. Open a terminal in the NOVOS project folder.
3. Run:

```bash
npm install
npm run mobile:init
npm run mobile:sync
npx cap add android
npm run mobile:sync
npx cap open android
```

4. In Android Studio, wait for Gradle sync.
5. Choose a connected phone/emulator or a release build.
6. Build an APK from Android Studio.

For later updates, after changing NOVOS code run:

```bash
npm run mobile:sync
```

Then rebuild the Android app.

## iOS

iOS compilation requires macOS with Xcode.

1. Install Node.js and Xcode.
2. Open a terminal in the NOVOS project folder.
3. Run:

```bash
npm install
npm run mobile:init
npm run mobile:sync
npx cap add ios
npm run mobile:sync
npx cap open ios
```

4. In Xcode, choose a simulator or connected iPhone.
5. Set the appropriate signing/team settings in Xcode.
6. Build the iOS app.

## Important

The mobile wrapper contains the same NOVOS web application. Native device capabilities such as camera permissions may require platform configuration and user permission.

You can build and test locally without publishing to an app store. Store distribution has its own account, signing, review, and fee requirements.
