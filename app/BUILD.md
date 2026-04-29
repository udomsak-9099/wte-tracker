# Build & Distribution

## Local development

### Web

```bash
cd app
npx expo start --web --port 8081
# open http://localhost:8081
```

### iOS simulator (requires Xcode)

```bash
cd app
npx expo run:ios
# first run takes ~5–10 min (Pod install + native compile)
```

### Android emulator (requires Android Studio + AVD)

```bash
cd app
npx expo run:android
```

## Cloud builds via EAS

EAS Build needs an Expo account. Login and configure once:

```bash
cd app
npx eas-cli@latest login
npx eas-cli build:configure
# This fills the `extra.eas.projectId` in app.json and `owner` field.
```

Then build:

```bash
# Internal preview build (sharable URL, no store)
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform android --profile preview

# Production build → submit to TestFlight / Play Internal
npx eas-cli build --platform ios --profile production
npx eas-cli build --platform android --profile production

# Submit to stores
npx eas-cli submit --platform ios
npx eas-cli submit --platform android
```

## Required before first production build

- **iOS**: App Store Connect API key (`.p8` file)
  - Create at https://appstoreconnect.apple.com/access/integrations/api
  - Configure on first `eas submit` — EAS prompts and stores it
- **Android**: Google Play service account JSON
  - Create in Google Cloud Console → IAM → Service accounts
  - Grant access in Play Console → Setup → API access
  - Save path in `eas.json` under `submit.production.android.serviceAccountKeyPath`
- **Google Play**: identity verification must be approved before publishing

## OTA updates

After production build, push JS-only updates without store review:

```bash
npx eas-cli update --branch production --message "fix: dashboard counts"
```
