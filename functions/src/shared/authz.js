const { functions, db } = require('../runtime');

const assertAdminUserCore = async (context, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeDb = services.db || db;

  if (!context.auth?.uid) {
    throw new runtimeFunctions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const userDoc = await runtimeDb.collection('users').doc(context.auth.uid).get();
  const userData = userDoc.exists ? userDoc.data() : null;
  const isAdmin = userData?.role === 'admin';

  if (!isAdmin) {
    throw new runtimeFunctions.https.HttpsError('permission-denied', 'Admin access required.');
  }
};

const assertAdminUser = async (context) => assertAdminUserCore(context);

module.exports = {
  assertAdminUser,
  __private__: {
    assertAdminUserCore
  }
};
