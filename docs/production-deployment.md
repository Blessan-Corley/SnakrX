# Production Deployment Checklist

This checklist covers the minimum setup needed for SnakrX to work correctly after deployment.

## 1. Select the Firebase Project Explicitly

Use an explicit Firebase project before any deploy:

```bash
firebase use --add
firebase projects:list
```

Do not assume the committed `.firebaserc` default is correct for every machine or CI environment.

## 2. Configure Frontend Environment Variables

Populate the root `.env` with:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## 3. Configure Functions Environment Variables

The deployed Functions runtime does not use the local `.env` file automatically.

Set these values in the production Functions environment before deploy:

- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `SUPPORT_EMAIL_TO`
- `OTP_SALT`

Operational expectations:

- missing `EMAIL_USER` / `EMAIL_PASS` will break OTP and support mail delivery
- missing `OTP_SALT` will hard-fail OTP request and verify calls

## 4. Verify Before Deploying

```bash
npm install
npm run verify:release
npm run e2e:public
```

Optional:

```bash
npm run e2e:auth
```

Auth-required Playwright specs need:

- `E2E_EMAIL`
- `E2E_PASSWORD`

Those credentials must belong to a real app-ready account with Firestore profile documents.

## 5. Deploy in a Safe Order

The root deploy script already does this and validates required environment variables first:

```bash
npm run deploy:firebase
```

Equivalent manual command:

```bash
firebase deploy --project <your-project-id> --only firestore:rules,firestore:indexes,storage,functions,hosting
```

## 6. Post-Deploy Smoke Tests

Run these checks against production immediately after release:

1. Request an OTP code and verify that email delivery succeeds.
2. Complete signup and confirm `users`, `publicProfiles`, and `usernames` are created.
3. Upload and remove a profile avatar.
4. Submit a support ticket with an attachment.
5. Play a game, save the session, and confirm the leaderboard updates.
6. Open the admin support flow and update a ticket status.

## 7. Known Backend Limits

These are still important even after the recent hardening:

- gameplay remains client-executed, not server-authoritative
- persisted game documents and primary stat updates now go through Cloud Functions
- achievement collection and social stat projection now also go through Cloud Functions
- full competitive anti-cheat guarantees would require a more server-owned scoring model

## 8. Recommended Next Backend Work

High priority:

- add direct tests for `otp`, `support`, `avatar`, `achievements`, and `leaderboards` function modules
- add a protected deploy workflow that uses explicit Firebase project targeting and environment approval

Medium priority:

- remove or uncommit the default project alias from `.firebaserc`
- add authenticated E2E secrets in CI so protected flows run automatically
- add a rollback and incident runbook
