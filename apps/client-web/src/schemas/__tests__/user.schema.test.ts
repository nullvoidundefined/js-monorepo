import {
  UserSchema,
  UsersArraySchema,
  AuthUserResponseSchema,
} from '../user.schema';

describe('User Schemas', () => {
  describe('UserSchema', () => {
    it('should validate a valid user object', () => {
      const validUser = {
        createdAt: new Date(),
        email: 'john@example.com',
        id: '123',
        name: 'John Doe',
        updatedAt: new Date(),
      };

      const result = UserSchema.safeParse(validUser);

      expect(result.success).toBe(true);
    });

    it('should validate user with string dates', () => {
      const validUser = {
        createdAt: '2023-01-01T00:00:00.000Z',
        email: 'john@example.com',
        id: '123',
        name: 'John Doe',
        updatedAt: '2023-12-01T00:00:00.000Z',
      };

      const result = UserSchema.safeParse(validUser);

      expect(result.success).toBe(true);
    });

    it('should validate user with optional photo', () => {
      const validUser = {
        createdAt: new Date(),
        email: 'john@example.com',
        id: '123',
        name: 'John Doe',
        photo: 'https://example.com/photo.jpg',
        updatedAt: new Date(),
      };

      const result = UserSchema.safeParse(validUser);

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        createdAt: new Date(),
        email: 'not-an-email',
        id: '123',
        name: 'John Doe',
        updatedAt: new Date(),
      };

      const result = UserSchema.safeParse(invalidUser);

      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidUser = {
        id: '123',
        name: 'John Doe',
      };

      const result = UserSchema.safeParse(invalidUser);

      expect(result.success).toBe(false);
    });
  });

  describe('UsersArraySchema', () => {
    it('should validate array of users', () => {
      const validUsers = [
        {
          createdAt: new Date(),
          email: 'john@example.com',
          id: '123',
          name: 'John Doe',
          updatedAt: new Date(),
        },
        {
          createdAt: new Date(),
          email: 'jane@example.com',
          id: '456',
          name: 'Jane Smith',
          updatedAt: new Date(),
        },
      ];

      const result = UsersArraySchema.safeParse(validUsers);

      expect(result.success).toBe(true);
    });

    it('should validate empty array', () => {
      const result = UsersArraySchema.safeParse([]);

      expect(result.success).toBe(true);
    });

    it('should reject array with invalid user', () => {
      const invalidUsers = [
        {
          createdAt: new Date(),
          email: 'john@example.com',
          id: '123',
          name: 'John Doe',
          updatedAt: new Date(),
        },
        {
          createdAt: new Date(),
          email: 'not-an-email',
          id: '456',
          name: 'Jane Smith',
          updatedAt: new Date(),
        },
      ];

      const result = UsersArraySchema.safeParse(invalidUsers);

      expect(result.success).toBe(false);
    });
  });

  describe('AuthUserResponseSchema', () => {
    it('should validate auth response with user', () => {
      const validResponse = {
        user: {
          createdAt: new Date(),
          email: 'john@example.com',
          id: '123',
          name: 'John Doe',
          updatedAt: new Date(),
        },
      };

      const result = AuthUserResponseSchema.safeParse(validResponse);

      expect(result.success).toBe(true);
    });

    it('should validate auth response with null user', () => {
      const validResponse = {
        user: null,
      };

      const result = AuthUserResponseSchema.safeParse(validResponse);

      expect(result.success).toBe(true);
    });

    it('should reject response without user field', () => {
      const invalidResponse = {};

      const result = AuthUserResponseSchema.safeParse(invalidResponse);

      expect(result.success).toBe(false);
    });
  });
});
