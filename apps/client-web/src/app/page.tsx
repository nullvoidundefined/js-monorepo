'use client';

import { User } from '@application/shared';
import { UserCard } from '@application/components/UserCard';
import { ProtectedRoute } from '@application/components/ProtectedRoute';
import { logout } from '@application/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const exampleUser: User = {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  };

  const handleLogout = () => {
    logout();
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
        <UserCard user={exampleUser} />
      </main>
    </ProtectedRoute>
  );
}
