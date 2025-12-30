import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import WebView from 'react-native-webview';
import {useAuth} from '../contexts/AuthContext';
import {APP_COLORS, APP_SPACING} from '../constants/theme';

interface WebViewContainerProps {
  url: string;
  title?: string;
}

const WebViewContainer: React.FC<WebViewContainerProps> = ({url, title}) => {
  const webViewRef = useRef<WebView>(null);
  const {authState} = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const handleNavigationStateChange = (navState: any) => {
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
      webViewRef.current.reload();
      setError(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    handleReload();
  };

  if (error) {
    return (
      <View style={styles.container}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        )}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to Load Page</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}

      {/* Main WebView and Loading State */}
      {!error && (
        <>
          <WebView
            ref={webViewRef}
            allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
            cacheEnabled={true}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            sharedCookiesEnabled={true}
            source={{
              headers: authState?.accessToken
                ? {
                    Authorization: `Bearer ${authState.accessToken}`,
                  }
                : undefined,
              uri: url,
            }}
            startInLoadingState={true}
            style={styles.webView}
            thirdPartyCookiesEnabled={true}
            onError={syntheticEvent => {
              const {nativeEvent} = syntheticEvent;
              setError(nativeEvent.description || 'Unknown error occurred');
              setLoading(false);
            }}
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
            onLoadStart={() => setLoading(true)}
            onNavigationStateChange={handleNavigationStateChange}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={APP_COLORS.primary} size="large" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          <View style={styles.navigationBar}>
            <TouchableOpacity
              disabled={!canGoBack}
              style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
              onPress={handleGoBack}>
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
              disabled={!canGoForward}
              style={[
                styles.navButton,
                !canGoForward && styles.navButtonDisabled,
              ]}
              onPress={handleGoForward}>
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
    backgroundColor: APP_COLORS.background,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: APP_SPACING.xl,
  },
  errorDetail: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    marginBottom: APP_SPACING.lg,
    textAlign: 'center',
  },
  errorText: {
    color: APP_COLORS.error,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: APP_SPACING.sm,
  },
  header: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: APP_SPACING.md,
    paddingVertical: APP_SPACING.md,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingText: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    marginTop: APP_SPACING.md,
  },
  navButton: {
    paddingHorizontal: APP_SPACING.md,
    paddingVertical: APP_SPACING.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: APP_COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: APP_COLORS.textSecondary,
  },
  navigationBar: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.backgroundSecondary,
    borderTopColor: APP_COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: APP_SPACING.sm,
  },
  retryButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: APP_SPACING.xl,
    paddingVertical: APP_SPACING.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
});

export default WebViewContainer;
