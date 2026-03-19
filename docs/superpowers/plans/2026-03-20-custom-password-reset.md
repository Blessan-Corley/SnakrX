# Custom Password Reset Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a SnakrX-branded password reset email and reset page while keeping Firebase Authentication as the secure backend.

**Architecture:** A new callable Function will generate Firebase reset links and send them through the shared SnakrX email template path. The frontend will switch forgot-password to that callable and add a public `/reset-password` route that verifies and completes the reset inside the app.

**Tech Stack:** React, React Router, Firebase Auth, Firebase Functions, Firebase Admin SDK, Vitest

---

### Task 1: Add failing backend tests for branded reset email delivery

**Files:**
- Modify: `F:\My Projects\SnakrX\functions\src\shared\emailUtils.test.js`
- Create: `F:\My Projects\SnakrX\functions\src\passwordReset.test.js`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run `npm run test:run -- functions/src/shared/emailUtils.test.js functions/src/passwordReset.test.js` and confirm failure**
- [ ] **Step 3: Implement the minimal backend password reset function and template**
- [ ] **Step 4: Re-run the same tests and confirm pass**

### Task 2: Add failing frontend tests for the reset service and page

**Files:**
- Create: `F:\My Projects\SnakrX\src\services\firebase\passwordReset.js`
- Create: `F:\My Projects\SnakrX\src\services\firebase\passwordReset.test.js`
- Create: `F:\My Projects\SnakrX\src\pages\auth\ResetPasswordPage.jsx`
- Modify: `F:\My Projects\SnakrX\src\pages\auth\authPages.test.jsx`

- [ ] **Step 1: Write the failing tests for the callable client and reset page states**
- [ ] **Step 2: Run `npm run test:run -- src/services/firebase/passwordReset.test.js src/pages/auth/authPages.test.jsx` and confirm failure**
- [ ] **Step 3: Implement the minimal client API, page, and route wiring**
- [ ] **Step 4: Re-run the same tests and confirm pass**

### Task 3: Wire auth operations to the new reset flow

**Files:**
- Modify: `F:\My Projects\SnakrX\src\hooks\auth\authOperations.js`
- Modify: `F:\My Projects\SnakrX\src\hooks\auth\auth.test.js`
- Modify: `F:\My Projects\SnakrX\src\App.jsx`
- Modify: `F:\My Projects\SnakrX\src\services\firebase\index.js`
- Modify: `F:\My Projects\SnakrX\src\services\firebase\config.js`

- [ ] **Step 1: Write the failing hook/route tests for the new password reset request path**
- [ ] **Step 2: Run `npm run test:run -- src/hooks/auth/auth.test.js src/pages/auth/authPages.test.jsx` and confirm failure**
- [ ] **Step 3: Implement the minimal route/export wiring and hook integration**
- [ ] **Step 4: Re-run the same tests and confirm pass**

### Task 4: Verify the whole flow

**Files:**
- Modify: `F:\My Projects\SnakrX\functions\index.js`

- [ ] **Step 1: Run `npm run test:run -- functions/src/passwordReset.test.js functions/src/shared/emailUtils.test.js src/services/firebase/passwordReset.test.js src/hooks/auth/auth.test.js src/pages/auth/authPages.test.jsx`**
- [ ] **Step 2: Run `npm run lint -- functions/src/passwordReset.js functions/src/passwordReset.test.js functions/src/shared/emailUtils.js functions/src/shared/emailUtils.test.js src/services/firebase/passwordReset.js src/services/firebase/passwordReset.test.js src/hooks/auth/authOperations.js src/hooks/auth/auth.test.js src/pages/auth/ResetPasswordPage.jsx src/pages/auth/authPages.test.jsx src\App.jsx src\services\firebase\index.js src\services\firebase\config.js`**
- [ ] **Step 3: Deploy with `npm run deploy:firebase` after env validation passes**
