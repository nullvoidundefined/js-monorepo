'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getCurrentUser, logout } from '@application/lib/auth';
import { User } from '@application/shared';

import { ProtectedRoute } from 'src/component/ProtectedRoute';
import { UserCard } from 'src/component/UserCard';

type SortField = 'name' | 'email' | 'id';
type SortOrder = 'asc' | 'desc';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

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

    if (!isLoading) {
      fetchUsers();
    }
  }, [isLoading, sortBy, sortOrder]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
    <ProtectedRoute>
      <main className="container">
        <div
          // TODO: Move to CSS module
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h1>Welcome to Client Web</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
        <p>A Next.js application built with Turborepo and Turbopack</p>

        {isLoading ? (
          <p>Loading user data...</p>
        ) : user ? (
          <div style={{ marginBottom: '20px' }}>
            <h2>Current User</h2>
            <UserCard user={user} />
          </div>
        ) : (
          <p>No user data available</p>
        )}

        <div style={{ marginTop: '40px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2>All Users</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Sort by:</span>
              <button
                onClick={() => handleSortChange('name')}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  backgroundColor: sortBy === 'name' ? '#007bff' : '#f5f5f5',
                  color: sortBy === 'name' ? '#fff' : '#000',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('email')}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  backgroundColor: sortBy === 'email' ? '#007bff' : '#f5f5f5',
                  color: sortBy === 'email' ? '#fff' : '#000',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('id')}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  backgroundColor: sortBy === 'id' ? '#007bff' : '#f5f5f5',
                  color: sortBy === 'id' ? '#fff' : '#000',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          {users.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {users.map(u => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          ) : (
            <p>No users found</p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
