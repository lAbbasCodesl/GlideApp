// utils/errorHandler.ts
import { FirebaseError } from 'firebase/app';

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
  'auth/requires-recent-login': 'This action requires recent authentication. Please sign in again.',
};

/**
 * Maps Firebase Firestore error codes to user-friendly messages
 */
const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'firestore/permission-denied': 'You don\'t have permission to access this data.',
  'firestore/unavailable': 'Service temporarily unavailable. Please try again.',
  'firestore/not-found': 'The requested data was not found.',
  'firestore/already-exists': 'This data already exists.',
  'firestore/resource-exhausted': 'Too many requests. Please try again later.',
  'firestore/cancelled': 'Operation was cancelled.',
  'firestore/deadline-exceeded': 'Operation took too long. Please try again.',
};

/**
 * Maps Firebase Storage error codes to user-friendly messages
 */
const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  'storage/unauthorized': 'You don\'t have permission to upload this file.',
  'storage/canceled': 'Upload was cancelled.',
  'storage/unknown': 'An unknown error occurred during upload.',
  'storage/object-not-found': 'File not found.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/unauthenticated': 'Please sign in to upload files.',
  'storage/retry-limit-exceeded': 'Upload failed after multiple attempts.',
};

/**
 * All Firebase error messages combined
 */
const FIREBASE_ERROR_MESSAGES = {
  ...AUTH_ERROR_MESSAGES,
  ...FIRESTORE_ERROR_MESSAGES,
  ...STORAGE_ERROR_MESSAGES,
};

/**
 * Error severity levels for logging
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Interface for structured error logging
 */
interface ErrorLogContext {
  function: string;
  userId?: string;
  screen?: string;
  action?: string;
  additionalInfo?: Record<string, any>;
  severity?: ErrorSeverity;
}

/**
 * Formats Firebase errors into user-friendly messages
 * 
 * @param error - The error object from Firebase or other sources
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * try {
 *   await signInWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   const message = getUserFriendlyMessage(error);
 *   Alert.alert('Error', message);
 * }
 * ```
 */
export function getUserFriendlyMessage(error: unknown): string {
  // Type guard: Check if it's a Firebase error
  if (error instanceof FirebaseError) {
    const friendlyMessage = FIREBASE_ERROR_MESSAGES[error.code];
    
    if (friendlyMessage) {
      return friendlyMessage;
    }
    
    // If we don't have a mapping, return a generic message
    // but log the unknown error for investigation
    console.warn('⚠️ Unmapped Firebase error code:', error.code, error.message);
    return 'An unexpected error occurred. Please try again.';
  }
  
  // Handle JavaScript errors
  if (error instanceof Error) {
    return error.message;
  }
  
  // Unknown error type
  console.error('❌ Unknown error type:', error);
  return 'Something went wrong. Please try again.';
}

/**
 * Logs errors with context for debugging
 * In production, this would send to Sentry, Firebase Crashlytics, etc.
 * 
 * @param error - The error object
 * @param context - Additional context about where/when the error occurred
 * 
 * @example
 * ```typescript
 * try {
 *   await updateUserProfile(data);
 * } catch (error) {
 *   logError(error, {
 *     function: 'updateUserProfile',
 *     userId: user.uid,
 *     screen: 'ProfileEdit',
 *     severity: ErrorSeverity.ERROR,
 *   });
 * }
 * ```
 */
export function logError(error: unknown, context: ErrorLogContext): void {
  const timestamp = new Date().toISOString();
  const severity = context.severity || ErrorSeverity.ERROR;
  
  const errorLog = {
    timestamp,
    severity,
    function: context.function,
    screen: context.screen,
    action: context.action,
    userId: context.userId || 'anonymous',
    error: {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof FirebaseError ? error.code : 'N/A',
      stack: error instanceof Error ? error.stack : undefined,
    },
    additionalInfo: context.additionalInfo,
  };
  
  // Development: Log to console with emoji for visibility
  const emoji = {
    [ErrorSeverity.INFO]: 'ℹ️',
    [ErrorSeverity.WARNING]: '⚠️',
    [ErrorSeverity.ERROR]: '❌',
    [ErrorSeverity.CRITICAL]: '🚨',
  }[severity];
  
  console.error(`${emoji} Error Log:`, JSON.stringify(errorLog, null, 2));
  
  // Production: Send to external service
  // TODO: Uncomment when setting up error tracking service
  // if (__DEV__) {
  //   // Development - just console
  // } else {
  //   // Production - send to services
  //   Sentry.captureException(error, { 
  //     contexts: { custom: errorLog },
  //     level: severity 
  //   });
  //   
  //   // Firebase Crashlytics
  //   crashlytics().log(`${context.function}: ${errorLog.error.message}`);
  //   crashlytics().recordError(error);
  // }
}

/**
 * Type guard to check if error is a Firebase error
 * 
 * @example
 * ```typescript
 * if (isFirebaseError(error)) {
 *   console.log('Firebase error code:', error.code);
 * }
 * ```
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}

/**
 * Extracts error code from Firebase errors
 * Useful for conditional logic based on error type
 * 
 * @example
 * ```typescript
 * const code = getErrorCode(error);
 * if (code === 'auth/network-request-failed') {
 *   // Show retry button
 * }
 * ```
 */
export function getErrorCode(error: unknown): string | null {
  if (isFirebaseError(error)) {
    return error.code;
  }
  return null;
}

/**
 * Determines if an error is retryable (network, timeout, etc.)
 * 
 * @example
 * ```typescript
 * if (isRetryableError(error)) {
 *   // Show "Retry" button
 * } else {
 *   // Show "Go Back" button
 * }
 * ```
 */
export function isRetryableError(error: unknown): boolean {
  const code = getErrorCode(error);
  if (!code) return false;
  
  const retryableErrors = [
    'auth/network-request-failed',
    'firestore/unavailable',
    'firestore/deadline-exceeded',
    'storage/retry-limit-exceeded',
  ];
  
  return retryableErrors.includes(code);
}

/**
 * Creates a standardized error for throwing in catch blocks
 * Ensures consistent error handling across the app
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   logError(error, { function: 'someOperation' });
 *   throw createStandardError(error);
 * }
 * ```
 */
export function createStandardError(error: unknown): Error {
  const message = getUserFriendlyMessage(error);
  return new Error(message);
}