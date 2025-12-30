import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {ClientRoute} from '@packages/constant';
import WebViewContainer from '../components/WebViewContainer';
import {WEB_APP_BASE_URL} from '../constants/urls';

const HomeScreen = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <WebViewContainer url={`${WEB_APP_BASE_URL}${ClientRoute.Home}`} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
