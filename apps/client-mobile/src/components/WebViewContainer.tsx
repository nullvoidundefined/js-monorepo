import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import type {WebViewNavigation} from 'react-native-webview';
import {APP_COLORS, APP_SPACING} from '../constants/theme';
import {useAuth} from '../contexts/AuthContext';

interface WebViewContainerProps {
  url: string;
  title?: string;
}

const WebViewContainer: React.FC<WebViewContainerProps> = ({url, title}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const {authState} = useAuth();

  // Inject authentication token into WebView when it loads
  useEffect(() => {
    if (webViewRef.current && authState?.accessToken) {
      // Inject the token into localStorage for the web app to use
      const injectedJavaScript = `
        (function() {
          try {
            localStorage.setItem('mobile_auth_token', '${authState.accessToken}');
            localStorage.setItem('mobile_id_token', '${authState.idToken}');
          } catch (e) {
            console.error('Failed to set auth tokens:', e);
          }
        })();
        true; // Required for iOS
      `;
      webViewRef.current.injectJavaScript(injectedJavaScript);
    }
  }, [authState]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleReload = () => {
    if (webViewRef.current) {
      setError(null);
      setLoading(true);
      webViewRef.current.reload();
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load page</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <WebView
            ref={webViewRef}
            source={{
              uri: url,
              headers: authState?.accessToken
                ? {
                    Authorization: `Bearer ${authState.accessToken}`,
                  }
                : undefined,
            }}
            style={styles.webView}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
              // Inject auth tokens after page loads
              if (authState?.accessToken) {
                const injectedJavaScript = `
                  (function() {
                    try {
                      localStorage.setItem('mobile_auth_token', '${authState.accessToken}');
                      localStorage.setItem('mobile_id_token', '${authState.idToken}');
                    } catch (e) {
                      console.error('Failed to set auth tokens:', e);
                    }
                  })();
                  true;
                `;
                webViewRef.current?.injectJavaScript(injectedJavaScript);
              }
            }}
            onError={syntheticEvent => {
              const {nativeEvent} = syntheticEvent;
              setError(nativeEvent.description || 'Unknown error occurred');
              setLoading(false);
            }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={true}
            allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={APP_COLORS.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          <View style={styles.navigationBar}>
            <TouchableOpacity
              style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
              onPress={handleGoBack}
              disabled={!canGoBack}>
              <Text
                style={[
                  styles.navButtonText,
                  !canGoBack && styles.navButtonTextDisabled,
                ]}>
                ← Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={handleReload}>
              <Text style={styles.navButtonText}>⟳ Reload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                !canGoForward && styles.navButtonDisabled,
              ]}
              onPress={handleGoForward}
              disabled={!canGoForward}>
              <Text
                style={[
                  styles.navButtonText,
                  !canGoForward && styles.navButtonTextDisabled,
                ]}>
                Forward →
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  header: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: APP_SPACING.md,
    paddingHorizontal: APP_SPACING.md,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
  },
  loadingText: {
    marginTop: APP_SPACING.md,
    fontSize: 16,
    color: APP_COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_SPACING.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_COLORS.error,
    marginBottom: APP_SPACING.sm,
  },
  errorDetail: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: APP_SPACING.lg,
  },
  retryButton: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: APP_SPACING.md,
    paddingHorizontal: APP_SPACING.xl,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: APP_COLORS.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
    paddingVertical: APP_SPACING.sm,
  },
  navButton: {
    paddingVertical: APP_SPACING.sm,
    paddingHorizontal: APP_SPACING.md,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    color: APP_COLORS.primary,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: APP_COLORS.textSecondary,
  },
});

export default WebViewContainer;

