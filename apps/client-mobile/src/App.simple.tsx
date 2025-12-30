import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import WebViewContainer from './components/WebViewContainer';
import {CURRENT_URLS} from './constants/urls';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Client Mobile App</Text>
      </View>
      <WebViewContainer url={CURRENT_URLS.home} title="Web App" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App;
