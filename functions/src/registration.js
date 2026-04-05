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

const completeEmailRegistrationHandler = async (data, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeAdmin = services.admin || admin;
  const runtimeDb = services.db || db;
  const runtimeSanitizeText = services.sanitizeText || sanitizeText;
  const runtimeLogCallableError = services.logCallableError || logCallableError;
  const runtimeRegistrationCore = services.registrationCore || registrationCore;

  try {
    return await runtimeRegistrationCore.completeEmailRegistrationCore(data, {
      admin: runtimeAdmin,
      db: runtimeDb
    });
  } catch (error) {
    runtimeLogCallableError('completeEmailRegistration', error, {
      email: runtimeSanitizeText(data?.email || '', 160).toLowerCase()
    });

    if (error instanceof runtimeFunctions.https.HttpsError) {
      throw error;
    }

    throw new runtimeFunctions.https.HttpsError(
      'internal',
      'Unable to complete signup right now. Please try again.'
    );
  }
};

const completeEmailRegistration = functions.https.onCall(async (data) => (
  completeEmailRegistrationHandler(data)
));

module.exports = {
  completeEmailRegistration,
  __private__: {
    ...registrationCore,
    completeEmailRegistrationHandler
  }
};
