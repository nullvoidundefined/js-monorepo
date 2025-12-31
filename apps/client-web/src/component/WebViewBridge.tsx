'use client';

import { useEffect } from 'react';
import { notifyNativeReady, isInWebView } from '../utils/native-bridge';

/**
 * WebView Bridge Component
 *
 * Include this component in your layout to enable WebView communication.
 * It notifies the native app when the web page is ready.
 */
export function WebViewBridge() {
  useEffect(() => {
    if (isInWebView()) {
      notifyNativeReady();
    }
  }, []);

  return null;
}

