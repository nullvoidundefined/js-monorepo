import { User } from '@application/shared';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
      <p>Created: {user.createdAt.toLocaleDateString()}</p>
      <p>Updated: {user.updatedAt.toLocaleDateString()}</p>
    </div>
  );
}

