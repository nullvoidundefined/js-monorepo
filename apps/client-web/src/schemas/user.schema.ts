import { z } from 'zod';

/**
 * Zod schema for User validation
 * Ensures API responses match expected structure
 */
export const UserSchema = z.object({
  createdAt: z.union([z.string(), z.date()]),
  email: z.string().email(),
  id: z.string(), // Server converts to string
  name: z.string(),
  photo: z.string().optional(),
  updatedAt: z.union([z.string(), z.date()]),
});

/**
 * Zod schema for array of users
 */
export const UsersArraySchema = z.array(UserSchema);

/**
 * Zod schema for paginated users response
 */
export const PaginatedUsersResponseSchema = z.object({
  data: z.array(UserSchema),
  pagination: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    limit: z.number(),
    page: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

/**
 * Zod schema for auth user response
 */
export const AuthUserResponseSchema = z.object({
  user: UserSchema.nullable(),
});

// Inferred types (for TypeScript)
export type ValidatedUser = z.infer<typeof UserSchema>;
export type ValidatedUsersArray = z.infer<typeof UsersArraySchema>;
export type ValidatedPaginatedUsersResponse = z.infer<typeof PaginatedUsersResponseSchema>;
export type ValidatedAuthUserResponse = z.infer<typeof AuthUserResponseSchema>;

