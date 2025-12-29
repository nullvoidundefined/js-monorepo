import { User } from '@application/shared';

import { UserCard } from '@application/components/UserCard';

export default function Home() {
  const exampleUser: User = {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  };

  return (
    <main className="container">
      <h1>Welcome to Client Web</h1>
      <p>A Next.js application built with Turborepo and Turbopack</p>
      <UserCard user={exampleUser} />
    </main>
  );
}

