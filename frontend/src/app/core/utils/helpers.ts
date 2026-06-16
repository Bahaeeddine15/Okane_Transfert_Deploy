import { HttpErrorResponse } from '@angular/common/http';

export function getLoginErrorMessage(error: unknown): string {
  const httpError = error as HttpErrorResponse;

  const backendMessage = extractBackendMessage(httpError);

  if (backendMessage) {
    const lowerMessage = backendMessage.toLowerCase();

    if (
      lowerMessage.includes('verify your email') ||
      lowerMessage.includes('email verified') ||
      lowerMessage.includes('email not verified') ||
      lowerMessage.includes('unverified')
    ) {
      return 'Please verify your email address before signing in.';
    }

    if (
      lowerMessage.includes('bad credentials') ||
      lowerMessage.includes('invalid email') ||
      lowerMessage.includes('invalid password') ||
      lowerMessage.includes('invalid email or password')
    ) {
      return 'Incorrect email or password.';
    }

    return backendMessage;
  }

  if (httpError.status === 401) {
    return 'Incorrect email or password.';
  }

  if (httpError.status === 0) {
    return 'Unable to contact the server.';
  }

  if (httpError.status === 403) {
    return 'Access denied.';
  }

  if (httpError.status === 500) {
    return 'Server error. Please try again later.';
  }

  return 'An error occurred. Please try again.';
}

function extractBackendMessage(error: HttpErrorResponse): string {
  if (!error) {
    return '';
  }

  if (typeof error.error === 'string') {
    return error.error;
  }

  if (error.error?.message) {
    return error.error.message;
  }

  if (error.error?.error) {
    return error.error.error;
  }

  if (error.message) {
    return error.message;
  }

  return '';
}
