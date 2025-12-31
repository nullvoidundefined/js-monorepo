import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../hooks/useAuth';
import {useUsers, SortField, SortOrder} from '@packages/hooks';
import {User} from '@packages/type';
import {UserCard} from '../components/UserCard';
import {APP_COLORS} from '../constants/theme';

const HomeScreen = (): React.JSX.Element => {
  const {user, isLoading: isLoadingUser, logout} = useAuth();
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const {users, isLoading: isLoadingUsers} = useUsers({
    enabled: !isLoadingUser,
    sortBy,
    sortOrder,
  });

  const handleLogout = () => {
    logout();
  };

  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      // Toggle order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Client Mobile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          A React Native application built with Turborepo
        </Text>

        {isLoadingUser ? (
          <ActivityIndicator color={APP_COLORS.primary} size="large" />
        ) : user ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current User</Text>
            <UserCard user={user} />
          </View>
        ) : (
          <Text style={styles.noData}>No user data available</Text>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Users</Text>
            <View style={styles.sortControls}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'name' && styles.sortButtonActive,
                ]}
                onPress={() => handleSortChange('name')}>
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === 'name' && styles.sortButtonTextActive,
                  ]}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'email' && styles.sortButtonActive,
                ]}
                onPress={() => handleSortChange('email')}>
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === 'email' && styles.sortButtonTextActive,
                  ]}>
                  Email{' '}
                  {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'id' && styles.sortButtonActive,
                ]}
                onPress={() => handleSortChange('id')}>
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === 'id' && styles.sortButtonTextActive,
                  ]}>
                  ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoadingUsers ? (
            <ActivityIndicator color={APP_COLORS.primary} size="large" />
          ) : users.length > 0 ? (
            <View style={styles.usersGrid}>
              {users.map((u: User) => (
                <UserCard key={u.id} user={u} />
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No users found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_COLORS.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noData: {
    color: '#999',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sortButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortButtonActive: {
    backgroundColor: APP_COLORS.primary,
  },
  sortButtonText: {
    color: '#666',
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sortControls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortLabel: {
    color: '#666',
    fontSize: 14,
    marginRight: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 24,
  },
  title: {
    color: '#333',
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  usersGrid: {
    marginTop: 8,
  },
});

export default HomeScreen;
