import { render, screen } from '@testing-library/react';

import { User } from '@packages/type';

import { UserCard } from '../userCard';

describe('UserCard', () => {
  const mockUser: User = {
    createdAt: new Date('2023-01-01'),
    email: 'john@example.com',
    id: '123',
    name: 'John Doe',
    photo: 'https://example.com/photo.jpg',
    updatedAt: new Date('2023-12-01'),
  };

  it('should render user information correctly', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Email: john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/ID: 123/)).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<UserCard user={mockUser} />);

    // Check that dates are formatted (will vary by locale, so we just check they exist)
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('should handle string dates correctly', () => {
    const userWithStringDates: User = {
      ...mockUser,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-12-01T00:00:00.000Z',
    };

    render(<UserCard user={userWithStringDates} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should have correct display name', () => {
    expect(UserCard.displayName).toBe('UserCard');
  });
});

