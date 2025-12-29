'use client';

import { useEffect, useState } from 'react';
import { User } from '@application/shared';
import { UserCard } from '@application/components/UserCard';
import { ProtectedRoute } from '@application/components/ProtectedRoute';
import { logout, getCurrentUser } from '@application/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const authUser = await getCurrentUser();
      if (authUser) {
        // Convert AuthUser to User format
        const userData: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.name || 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(userData);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <main className="container">
        <div
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
          <UserCard user={user} />
        ) : (
          <p>No user data available</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
