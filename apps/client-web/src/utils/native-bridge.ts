/**
 * Native Bridge Utilities
 *
 * Helpers for communicating between the Next.js web app and React Native WebView
 */

// Extend Window interface to include ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

// Message types that can be sent from web to native
export enum WebToNativeMessageType {
  OPEN_EXTERNAL_URL = 'OPEN_EXTERNAL_URL',
  OPEN_NATIVE_SCREEN = 'OPEN_NATIVE_SCREEN',
  LOGOUT = 'LOGOUT',
  READY = 'READY',
}

interface WebToNativeMessage {
  type: WebToNativeMessageType;
  payload?: any;
}

/**
 * Check if the app is running inside a React Native WebView
 */
export function isInWebView(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for React Native WebView user agent
  const userAgent = window.navigator.userAgent;

  // React Native WebView typically includes these in the user agent
  return userAgent.includes('ReactNative') || typeof window.ReactNativeWebView !== 'undefined';
}

/**
 * Send a message to the React Native app
 */
export function sendMessageToNative(message: WebToNativeMessage): void {
  if (typeof window === 'undefined') {
    console.warn('Cannot send message to native: not in browser context');
    return;
  }

  if (typeof window.ReactNativeWebView?.postMessage === 'function') {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.warn('Cannot send message to native: ReactNativeWebView not available');
  }
}

/**
 * Open a URL in the system browser (outside of WebView)
 */
export function openExternalUrl(url: string): void {
  if (isInWebView()) {
    sendMessageToNative({
      type: WebToNativeMessageType.OPEN_EXTERNAL_URL,
      payload: { url },
    });
  } else {
    // In regular browser, just open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Navigate to a native screen
 */
export function openNativeScreen(screen: string, params?: Record<string, any>): void {
  sendMessageToNative({
    type: WebToNativeMessageType.OPEN_NATIVE_SCREEN,
    payload: { screen, params },
  });
}

/**
 * Request logout from the native app
 * This will logout both the WebView session and the native session
 */
export function requestNativeLogout(): void {
  sendMessageToNative({
    type: WebToNativeMessageType.LOGOUT,
  });
}

/**
 * Notify native that the WebView is ready
 */
export function notifyNativeReady(): void {
  sendMessageToNative({
    type: WebToNativeMessageType.READY,
  });
}

/**
 * Hook to detect if running in WebView
 */
export function useIsInWebView(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return isInWebView();
}
