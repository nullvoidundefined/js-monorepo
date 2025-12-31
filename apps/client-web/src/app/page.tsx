'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ClientRoute, AuthenticationStatus } from '@packages/constant';
import { useUsers, SortField, SortOrder } from '@packages/hooks';
import { User } from '@packages/type';

import { useAuthGuard } from 'src/state/hook/useAuthGuard';
import { UserCard } from '@client-web/components/userCard';
import { useAuth } from 'src/state/hook/useAuth';

import styles from './page.module.scss';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser, logout } = useAuth();
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useAuthGuard({
    allowed: AuthenticationStatus.Authenticated,
    redirectTo: ClientRoute.Login,
  });

  const { users, isLoading: isLoadingUsers } = useUsers({
    sortBy,
    sortOrder,
    enabled: !isLoadingUser,
  });

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push(ClientRoute.Login);
      },
    });
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
    <main className="container">
      <div className={styles.header}>
        <h1>Welcome to Client Web</h1>
        <button className={styles.logoutButton} onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
      <p>A Next.js application built with Turborepo and Turbopack</p>

      {isLoadingUser ? (
        <p>Loading user data...</p>
      ) : user ? (
        <div className={styles.currentUserSection}>
          <h2>Current User</h2>
          <UserCard user={user} />
        </div>
      ) : (
        <p>No user data available</p>
      )}

      <div className={styles.allUsersSection}>
        <div className={styles.sectionHeader}>
          <h2>All Users</h2>
          <div className={styles.sortControls}>
            <span className={styles.sortLabel}>Sort by:</span>
            <button
              className={`${styles.sortButton} ${sortBy === 'name' ? styles.active : ''}`}
              onClick={() => handleSortChange('name')}
              type="button"
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'email' ? styles.active : ''}`}
              onClick={() => handleSortChange('email')}
              type="button"
            >
              Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'id' ? styles.active : ''}`}
              onClick={() => handleSortChange('id')}
              type="button"
            >
              ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {isLoadingUsers ? (
          <p>Loading users...</p>
        ) : users.length > 0 ? (
          <div className={styles.usersGrid}>
            {users.map((u: User) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </main>
  );
}
