const { functions, db } = require('../runtime');

const assertAdminUser = async (context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = userDoc.exists ? userDoc.data() : null;
  const isAdmin = userData?.role === 'admin';

  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
  }
};

module.exports = {
  assertAdminUser
};
