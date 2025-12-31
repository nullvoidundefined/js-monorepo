import { useQuery } from '@tanstack/react-query';
import { User } from '@packages/type';

export type SortField = 'name' | 'email' | 'id';
export type SortOrder = 'asc' | 'desc';

export interface UseUsersParams {
  sortBy?: SortField;
  sortOrder?: SortOrder;
  apiUrl?: string;
  enabled?: boolean;
}

export interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchUsers = async (
  sortBy: SortField = 'name',
  sortOrder: SortOrder = 'asc',
  apiUrl: string = 'http://localhost:3001'
): Promise<User[]> => {
  const response = await fetch(
    `${apiUrl}/api/users?sortBy=${sortBy}&order=${sortOrder}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
};

export const useUsers = ({
  sortBy = 'name',
  sortOrder = 'asc',
  apiUrl,
  enabled = true,
}: UseUsersParams = {}): UseUsersResult => {
  const effectiveApiUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const { data, isLoading, isError, error, refetch } = useQuery<User[], Error>({
    queryKey: ['users', sortBy, sortOrder],
    queryFn: () => fetchUsers(sortBy, sortOrder, effectiveApiUrl),
    enabled,
  });

  return {
    users: data || [],
    isLoading,
    isError,
    error,
    refetch,
  };
};

