import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import WebViewContainer from '../components/WebViewContainer';
import {APP_COLORS, APP_SPACING} from '../constants/theme';
import {API_URL} from '@env';

const MainScreen: React.FC = () => {
  const {userProfile, logout} = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {userProfile?.picture && (
            <Image
              source={{uri: userProfile.picture}}
              style={styles.avatar}
            />
          )}
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{userProfile?.name}</Text>
            <Text style={styles.userEmail}>{userProfile?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <WebViewContainer url={`${API_URL}/`} title="Web App" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: APP_SPACING.sm,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  logoutButton: {
    paddingVertical: APP_SPACING.sm,
    paddingHorizontal: APP_SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MainScreen;

