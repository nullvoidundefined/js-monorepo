import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebViewContainer from '../components/WebViewContainer';
import {CURRENT_URLS} from '../constants/urls';

const HomeScreen = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <WebViewContainer title="Home" url={CURRENT_URLS.home} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;

