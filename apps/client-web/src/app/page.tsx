'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ClientRoute } from '@packages/constant';
import { User } from '@packages/type';

import { AuthGuard } from '@client-web/components/authGuard';
import { AuthenticationStatus } from '@client-web/constant/authentication';
import { UserCard } from '@client-web/components/userCard';
import { useAuth } from 'src/state/hook/useAuth';

import styles from './page.module.scss';

type SortField = 'name' | 'email' | 'id';
type SortOrder = 'asc' | 'desc';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users?sortBy=${sortBy}&order=${sortOrder}`,
          {
            credentials: 'include',
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    if (!isLoadingUser) {
      fetchUsers();
    }
  }, [isLoadingUser, sortBy, sortOrder]);

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
    <AuthGuard allowed={AuthenticationStatus.Authenticated} fallbackRoute={ClientRoute.Login}>
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

          {users.length > 0 ? (
            <div className={styles.usersGrid}>
              {users.map(u => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          ) : (
            <p>No users found</p>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
