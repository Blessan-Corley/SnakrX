# Deployment Readiness

This checklist captures what must be true for SnakrX to behave correctly after deployment, and what still needs backend work before the trust model is considered strong.

## Must Configure Before Deploy

- Firebase Hosting, Firestore, Storage, and Functions must be deployed together:
  - `firebase deploy --only hosting,functions,firestore,storage`
- Frontend environment variables must be present in `.env`:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- Functions environment values must be configured:
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `EMAIL_FROM`
  - `OTP_SALT`
  - `SUPPORT_EMAIL_TO` (recommended)

## Now Hardened

- Signup completion is server-owned and requires a verified OTP.
- OTP hashing now fails closed if `OTP_SALT` is missing.
- Support attachments are uploaded and validated server-side.
- Firestore blocks direct writes to shared leaderboard and support ticket collections.
- Storage blocks direct client writes to avatar and support attachment paths.
- Game finalization, trusted stat updates, achievement unlock state, and friend-count stat projection now run through Cloud Functions.
- Client writes to `publicProfiles` are limited to presentation fields rather than trusted stats.
- Avatar uploads now verify binary signatures for allowed image types before storage.
- Banned users are blocked from ranked leaderboard submission and from creating new game session documents through Firestore rules.
- Client-side deletion of `users` and `publicProfiles` documents is blocked.

## Remaining Backend Risks

### 1. Gameplay is still client-executed

Current state:
- The browser still decides movement, scoring inputs, and match outcomes before sending the final session payload.
- Cloud Functions validate and persist the payload, but there is no server-authoritative simulation.

Impact:
- A determined attacker can still attempt to fabricate valid-looking sessions within allowed limits.

Recommended fix:
- Move competitive gameplay toward a server-authoritative or replay-verifiable model if anti-cheat becomes a product requirement.

### 2. Username reservation still relies on client repair behavior for old accounts

Current state:
- New registrations create username reservations server-side.
- Existing historical users can still rely on client-side username reservation backfill if the reservation document is missing.

Impact:
- Tightening username rules immediately could strand old accounts that lack reservation docs.

Recommended fix:
- Run a one-time admin migration that backfills missing `usernames/{username}` docs from `users`.
- After the migration, restrict username reservation writes to admin-only.

### 3. Avatar validation is stronger but still not true normalization

Current state:
- Avatar uploads now validate MIME type, byte size, and basic file signatures.

Impact:
- Malformed-but-header-valid images can still be stored because the function does not decode and re-encode images.

Recommended fix:
- Add image decoding/normalization in the avatar function before upload.

### 4. Admin ban state does not fully disable all product actions

Current state:
- Banned users are blocked from leaderboard submission and new game document creation.

Impact:
- Other authenticated flows may still remain available depending on product policy.

Recommended fix:
- Decide whether bans are leaderboard-only or account-wide.
- If account-wide, centralize a reusable banned-user check across sensitive callables.

## Recommended Next Implementation Order

1. Backfill username reservation documents, then lock reservation writes to admin-only
2. Add avatar image normalization
3. Add function-level tests for OTP, support, avatar, achievement, and leaderboard flows
4. Decide whether bans are account-wide and centralize that policy in callables
5. Explore a more server-owned competitive scoring model
