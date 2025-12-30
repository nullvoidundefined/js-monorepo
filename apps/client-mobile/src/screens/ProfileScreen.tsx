import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebViewContainer from '../components/WebViewContainer';
import {CURRENT_URLS} from '../constants/urls';

const ProfileScreen = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <WebViewContainer url={CURRENT_URLS.profile} title="Profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProfileScreen;
