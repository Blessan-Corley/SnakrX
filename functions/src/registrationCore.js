const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const createRegistrationCore = ({
  functions,
  sanitizeText,
  OTP_COLLECTION,
  OTP_TTL_MS,
  getEmailKey,
  createDefaultUserProfileData,
  createDefaultPublicProfileData,
  logCallableInfo,
  logCallableError
}) => {
  const normalizeSignupPayload = (payload = {}) => {
    const email = sanitizeText(payload.email || '', 160).toLowerCase();
    const username = sanitizeText(payload.username || '', 32);
    const password = typeof payload.password === 'string' ? payload.password : '';
    const displayName = sanitizeText(payload.displayName || username, 64) || username;

    if (!EMAIL_REGEX.test(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Please enter a valid email address.');
    }

    if (username.length < 3 || username.length > 20 || !USERNAME_REGEX.test(username)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Username must be 3-20 characters and use only letters, numbers, and underscores.'
      );
    }

    if (password.length < 6 || password.length > 128) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Password must be between 6 and 128 characters.'
      );
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Password must include uppercase, lowercase, and numeric characters.'
      );
    }

    return {
      email,
      username: username.toLowerCase(),
      password,
      displayName
    };
  };

  const assertOtpReadyForSignup = ({ otpData, email, now }) => {
    if (!otpData) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Verify your email address before creating an account.'
      );
    }

    if (sanitizeText(otpData.email || '', 160).toLowerCase() !== email) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Verify your email address before creating an account.'
      );
    }

    if (otpData.consumedAt) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This verification code was already used. Request a new code to continue.'
      );
    }

    if (otpData.verified !== true) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Verify your email address before creating an account.'
      );
    }

    const verifiedAt = typeof otpData.verifiedAt?.toMillis === 'function'
      ? otpData.verifiedAt.toMillis()
      : Number(otpData.verifiedAt || 0);
    const expiresAt = typeof otpData.expiresAt?.toMillis === 'function'
      ? otpData.expiresAt.toMillis()
      : Number(otpData.expiresAt || 0);

    if (!verifiedAt || now - verifiedAt > OTP_TTL_MS) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email verification expired. Request a new code to continue.'
      );
    }

    if (expiresAt && now > expiresAt) {
      throw new functions.https.HttpsError(
        'deadline-exceeded',
        'Verification code has expired. Request a new code to continue.'
      );
    }
  };

  const ensureEmailNotRegistered = async (email, registrationAdmin) => {
    try {
      await registrationAdmin.auth().getUserByEmail(email);
      throw new functions.https.HttpsError(
        'already-exists',
        'An account with this email already exists. Please sign in instead.'
      );
    } catch (error) {
      if (error?.code === 'auth/user-not-found') {
        return;
      }

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw error;
    }
  };

  const completeEmailRegistrationCore = async (payload, services = {}) => {
    const registrationDb = services.db;
    const registrationAdmin = services.admin;
    const now = services.now || Date.now();
    const {
      email,
      username,
      password,
      displayName
    } = normalizeSignupPayload(payload);

    await ensureEmailNotRegistered(email, registrationAdmin);

    const otpRef = registrationDb.collection(OTP_COLLECTION).doc(getEmailKey(email));
    const otpSnap = await otpRef.get();
    const otpData = otpSnap.exists ? otpSnap.data() || {} : null;
    assertOtpReadyForSignup({ otpData, email, now });

    let createdUser = null;

    try {
      createdUser = await registrationAdmin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: true
      });

      const usernameRef = registrationDb.collection('usernames').doc(username);
      const userRef = registrationDb.collection('users').doc(createdUser.uid);
      const publicProfileRef = registrationDb.collection('publicProfiles').doc(createdUser.uid);
      const userProfileData = createDefaultUserProfileData({
        email,
        username,
        displayName
      });
      const publicProfileData = createDefaultPublicProfileData({
        uid: createdUser.uid,
        username,
        displayName,
        stats: userProfileData.stats
      });

      await registrationDb.runTransaction(async (transaction) => {
        const [usernameDoc, existingUserDoc] = await Promise.all([
          transaction.get(usernameRef),
          transaction.get(userRef)
        ]);

        const reservedBy = usernameDoc.exists ? usernameDoc.data()?.userId : null;
        if (reservedBy && reservedBy !== createdUser.uid) {
          throw new functions.https.HttpsError(
            'already-exists',
            'This username is already taken. Please choose another.'
          );
        }

        if (existingUserDoc.exists) {
          throw new functions.https.HttpsError(
            'already-exists',
            'An account with this email already exists. Please sign in instead.'
          );
        }

        transaction.set(usernameRef, {
          username,
          userId: createdUser.uid,
          createdAt: registrationAdmin.firestore.FieldValue.serverTimestamp(),
          updatedAt: registrationAdmin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        transaction.set(userRef, userProfileData, { merge: false });
        transaction.set(publicProfileRef, publicProfileData, { merge: false });
        transaction.set(otpRef, {
          consumedAt: registrationAdmin.firestore.Timestamp.fromMillis(now),
          consumedByUid: createdUser.uid,
          updatedAt: registrationAdmin.firestore.Timestamp.fromMillis(now)
        }, { merge: true });
      });

      logCallableInfo('completeEmailRegistration', {
        uid: createdUser.uid,
        email,
        username
      });

      return {
        success: true,
        uid: createdUser.uid,
        email,
        username
      };
    } catch (error) {
      if (createdUser?.uid) {
        try {
          await registrationAdmin.auth().deleteUser(createdUser.uid);
        } catch (cleanupError) {
          logCallableError('completeEmailRegistration.cleanup', cleanupError, {
            uid: createdUser.uid,
            email
          });
        }
      }

      throw error;
    }
  };

  return {
    normalizeSignupPayload,
    assertOtpReadyForSignup,
    completeEmailRegistrationCore
  };
};

module.exports = {
  createRegistrationCore
};
