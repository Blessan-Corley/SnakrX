export function getSignUpErrorMessage(err) {
  switch (err.code) {
    case 'auth/email-already-in-use':
    case 'already-exists':
      return 'An account with this email already exists. Please try signing in instead.';
    case 'failed-precondition':
      return err.message || 'Verify your email address before creating an account.';
    case 'deadline-exceeded':
      return err.message || 'Email verification expired. Request a new code and try again.';
    case 'invalid-argument':
      return err.message || 'Please review your signup details and try again.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      if (err.message && (
        err.message.includes('Invalid registration data') ||
        err.message.includes('username is already taken') ||
        err.message.includes('validation')
      )) {
        return err.message;
      }
      return err.message || 'An unknown error occurred during sign-up.';
  }
}

export function getSignInErrorMessage(err) {
  switch (err.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      if (err.message === 'User not found.') {
        return 'Invalid email or password. Please try again.';
      }
      return err.message || 'An unknown error occurred.';
  }
}

export function getPasswordResetErrorMessage(err) {
  switch (err.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/too-many-requests':
      return 'Too many password reset requests. Please wait before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      return err.message || 'Failed to send password reset email.';
  }
}
