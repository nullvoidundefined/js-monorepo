import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import {APP_COLORS, APP_SPACING} from '../constants/theme';

const MainScreen: React.FC = () => {
  const {userProfile, logout} = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {userProfile?.picture && (
            <Image source={{uri: userProfile.picture}} style={styles.avatar} />
          )}
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{userProfile?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to your profile, {userProfile?.given_name || 'User'}!
        </Text>
        <Text style={styles.infoText}>
          This is your authenticated home screen.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    marginRight: APP_SPACING.sm,
    width: 40,
  },
  container: {
    backgroundColor: APP_COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: APP_SPACING.xl,
  },
  header: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.primary,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: APP_SPACING.md,
    paddingVertical: APP_SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoText: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    marginTop: APP_SPACING.md,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: APP_SPACING.md,
    paddingVertical: APP_SPACING.sm,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userEmail: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  userInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    color: APP_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default MainScreen;
