const { admin } = require('../runtime');

const checkRateLimit = async (docRef, limit, windowMs, fieldPrefix) => {
  const now = Date.now();
  const doc = await docRef.get();
  const data = doc.exists ? doc.data() : {};

  const windowStartValue = data[`${fieldPrefix}WindowStart`];
  const windowStart = windowStartValue?.toMillis
    ? windowStartValue.toMillis()
    : (windowStartValue || now);
  const requestCount = data[`${fieldPrefix}Count`] || 0;

  const withinWindow = now - windowStart < windowMs;
  const nextCount = withinWindow ? requestCount + 1 : 1;
  const nextWindowStart = withinWindow ? windowStart : now;

  if (withinWindow && nextCount > limit) {
    return {
      allowed: false,
      retryAfterMs: Math.max(0, windowMs - (now - windowStart))
    };
  }

  await docRef.set({
    [`${fieldPrefix}Count`]: nextCount,
    [`${fieldPrefix}WindowStart`]: admin.firestore.Timestamp.fromMillis(nextWindowStart)
  }, { merge: true });

  return { allowed: true };
};

module.exports = {
  checkRateLimit
};
