import { useQuery } from '@tanstack/react-query';

import { User } from '@packages/type';

export type SortField = 'name' | 'email' | 'id';
export type SortOrder = 'asc' | 'desc';

export interface UseUsersParams {
  sortBy?: SortField;
  sortOrder?: SortOrder;
  apiUrl?: string;
  enabled?: boolean;
  authToken?: string;
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
  apiUrl: string = 'http://localhost:3001',
  authToken?: string
): Promise<User[]> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const url = `${apiUrl}/api/users?sortBy=${sortBy}&order=${sortOrder}`;
  console.log('[useUsers] Fetching from:', url);
  console.log('[useUsers] Has auth token:', !!authToken);

  const response = await fetch(url, {
    credentials: 'include',
    headers,
  });

  console.log('[useUsers] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.log('[useUsers] Error response:', errorText);
    throw new Error(
      `Failed to fetch users: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
};

export const useUsers = ({
  sortBy = 'name',
  sortOrder = 'asc',
  apiUrl,
  enabled = true,
  authToken,
}: UseUsersParams = {}): UseUsersResult => {
  const effectiveApiUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const { data, isLoading, isError, error, refetch } = useQuery<User[], Error>({
    queryKey: ['users', sortBy, sortOrder],
    queryFn: () => fetchUsers(sortBy, sortOrder, effectiveApiUrl, authToken),
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
