export const DEFAULT_ERROR_TYPE = 'unknown';

const ERROR_TYPE_MATCHERS = [
  { type: 'array', matcher: (message) => message.includes('forEach') },
  { type: 'firebase', matcher: (message) => message.includes('Firebase') },
  { type: 'network', matcher: (message) => message.includes('Network') },
  { type: 'import', matcher: (message) => message.includes('import') || message.includes('module') }
];

export const detectErrorType = (error) => {
  const message = error?.message ?? '';
  const matchedType = ERROR_TYPE_MATCHERS.find((rule) => rule.matcher(message));
  return matchedType?.type ?? DEFAULT_ERROR_TYPE;
};

export const createErrorId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

export const createInitialErrorState = () => ({
  hasError: false,
  error: null,
  errorInfo: null,
  errorId: null,
  errorType: DEFAULT_ERROR_TYPE
});

export const shouldForceReloadOnRetry = (errorType) => errorType === 'import' || errorType === 'firebase';

export const buildReportMailtoUrl = ({ error, errorId, errorType }) => {
  const errorDetails = {
    errorId,
    errorType,
    message: error?.message || 'Unknown error',
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };

  const emailBody = `Hi SnakrX Team,

I encountered an error while playing SnakrX. Here are the details:

Error ID: ${errorDetails.errorId}
Error Type: ${errorDetails.errorType}
Error Message: ${errorDetails.message}
Page URL: ${errorDetails.url}
Time: ${errorDetails.timestamp}
Browser: ${errorDetails.userAgent}

Additional context:
[Please describe what you were doing when the error occurred]

Thanks!`;

  const subject = encodeURIComponent(`SnakrX Bug Report - ${errorDetails.errorType}`);
  return `mailto:snakrxgame@gmail.com?subject=${subject}&body=${encodeURIComponent(emailBody)}`;
};
