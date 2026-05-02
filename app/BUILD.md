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

## EAS environment variables

Local `.env` is gitignored AND not uploaded to EAS Build. Public env vars
that the bundle needs (e.g. `EXPO_PUBLIC_SUPABASE_URL`) must be set in
the EAS environment per build profile:

```bash
npx eas-cli env:create --scope project \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://wfgwjjshspduiujoaatw.supabase.co" \
  --visibility plaintext --environment preview

npx eas-cli env:create --scope project \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "sb_publishable_..." \
  --visibility plaintext --environment preview
```

Already set in this project (preview environment): `EXPO_PUBLIC_SUPABASE_URL`,
`EXPO_PUBLIC_SUPABASE_ANON_KEY`.

For production, set them again under `--environment production`.

## OTA updates

After production build, push JS-only updates without store review:

```bash
npx eas-cli update --branch production --message "fix: dashboard counts"
```
