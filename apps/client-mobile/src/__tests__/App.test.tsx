import 'react-native';
import React from 'react';
import App from '../App';
import {render} from '@testing-library/react-native';

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const {View} = require('react-native');
  return {
    WebView: View,
  };
});

describe('App', () => {
  it('renders correctly', () => {
    const {toJSON} = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});

