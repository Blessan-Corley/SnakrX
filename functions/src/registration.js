const { functions, admin, db } = require('./runtime');
const {
  OTP_COLLECTION,
  OTP_TTL_MS,
  getEmailKey,
  sanitizeText
} = require('./shared/utils');
const {
  createDefaultPublicProfileData,
  createDefaultUserProfileData
} = require('./shared/profileSeeds');
const {
  logCallableError,
  logCallableInfo
} = require('./shared/observability');
const { createRegistrationCore } = require('./registrationCore');

const registrationCore = createRegistrationCore({
  functions,
  sanitizeText,
  OTP_COLLECTION,
  OTP_TTL_MS,
  getEmailKey,
  createDefaultUserProfileData,
  createDefaultPublicProfileData,
  logCallableInfo,
  logCallableError
});

const completeEmailRegistration = functions.https.onCall(async (data) => {
  try {
    return await registrationCore.completeEmailRegistrationCore(data, {
      admin,
      db
    });
  } catch (error) {
    logCallableError('completeEmailRegistration', error, {
      email: sanitizeText(data?.email || '', 160).toLowerCase()
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Unable to complete signup right now. Please try again.'
    );
  }
});

module.exports = {
  completeEmailRegistration,
  __private__: {
    ...registrationCore
  }
};
