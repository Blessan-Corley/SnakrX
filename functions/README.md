# SnakrX Email and Support Functions

## Local configuration
Create a `functions/.env` file from `functions/.env.example` and set:

- `EMAIL_USER`: Gmail address used to send OTP and support emails.
- `EMAIL_PASS`: Gmail app password.
- `EMAIL_FROM`: Optional `From` label, for example `SnakrX <snakrxgame@gmail.com>`.
- `SUPPORT_EMAIL_TO`: Optional mailbox that receives support ticket notifications.
- `OTP_SALT`: Extra salt for OTP hashing.

Use a local `.firebaserc` file only for your own machine. Keep the project id out of commits by copying `.firebaserc.example` and setting the correct Firebase project locally.

Then deploy with an explicit project id:

```bash
firebase deploy --project <your-project-id> --only functions
```
