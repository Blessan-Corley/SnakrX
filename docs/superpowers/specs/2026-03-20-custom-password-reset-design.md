# Custom Password Reset Design

**Goal:** Replace the Firebase-hosted password reset experience with a SnakrX-branded reset email and a SnakrX-hosted reset page on `https://snakrx-23b0b.web.app`.

## Scope

- Keep Firebase Authentication as the security backend for reset tokens and password updates.
- Generate password reset links server-side with the Firebase Admin SDK.
- Send reset emails through the existing Nodemailer path so the email matches SnakrX branding.
- Add a public `/reset-password` route that validates the action code and completes the password reset inside the SnakrX UI.

## Architecture

### Backend

- Add a callable Cloud Function that accepts an email address and always returns a generic success response.
- The function will:
  - normalize the email
  - generate a Firebase password reset link with `handleCodeInApp: true`
  - target `https://snakrx-23b0b.web.app/reset-password`
  - send the email through the shared SnakrX email template layer
- For unknown users, the function should still return success to avoid account enumeration.

### Frontend

- Replace the direct `sendPasswordResetEmail` call with a Firebase Functions client request.
- Add a `ResetPasswordPage` route that:
  - reads `mode`, `oobCode`, and optional continuation params from the URL
  - verifies the reset code through Firebase Auth
  - renders branded invalid, expired, loading, form, and success states
  - confirms the new password with Firebase Auth
- Keep the existing `ForgotPasswordPage` UX, but point it at the new backend email path.

## UX

- Reuse the product’s dark/orange visual language.
- Make the reset screen feel like the login/register flows, not a Firebase handler page.
- Use clear messaging for:
  - link validation
  - expired or invalid link
  - successful password reset
- Redirect the success state back to `/login`.

## Error Handling

- Unknown email addresses should not expose whether an account exists.
- Invalid or expired reset codes should show a recoverable message and direct users back to `/forgot-password`.
- Backend email failures should return a generic retryable message to the client.

## Testing

- Add backend tests for reset link generation and generic success behavior.
- Add frontend service tests for the reset callable.
- Add page tests for:
  - forgot-password submission path
  - valid reset code flow
  - invalid/expired code state
  - successful password change
