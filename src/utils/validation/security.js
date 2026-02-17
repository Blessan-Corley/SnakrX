/**
 * Security-related helper utilities.
 */
export const security = {
  /**
   * Sanitize object for logging by redacting sensitive fields.
   */
  sanitizeForLogging: (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  },

  /**
   * Basic bot-like user-agent detector.
   */
  isValidUserAgent: (userAgent) => {
    if (!userAgent) return false;

    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /headless/i
    ];

    return !botPatterns.some(pattern => pattern.test(userAgent));
  }
};
