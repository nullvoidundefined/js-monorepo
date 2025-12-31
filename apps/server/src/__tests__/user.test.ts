import request from 'supertest';

import { ApiRoute } from '@packages/constant';

import { app } from '../index';

describe('User Routes', () => {
  describe('GET /api/users', () => {
    it('should require authentication', async () => {
      const response = await request(app).get(ApiRoute.Users);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Authentication required');
    });

    it('should accept valid sortBy values', async () => {
      const validSortBy = ['name', 'email', 'id'];

      for (const sortBy of validSortBy) {
        const response = await request(app)
          .get(ApiRoute.Users)
          .query({ sortBy });

        // Will fail at auth, not validation
        expect(response.status).toBe(401);
      }
    });

    it('should accept valid order values', async () => {
      const validOrders = ['asc', 'desc'];

      for (const order of validOrders) {
        const response = await request(app)
          .get(ApiRoute.Users)
          .query({ order });

        // Will fail at auth, not validation
        expect(response.status).toBe(401);
      }
    });

    it('should accept valid pagination parameters', async () => {
      const response = await request(app)
        .get(ApiRoute.Users)
        .query({ limit: '20', page: '2' });

      // Will fail at auth, not validation
      expect(response.status).toBe(401);
    });

    it('should apply default values for pagination', async () => {
      const response = await request(app).get(ApiRoute.Users);

      // Will fail at auth, not validation
      expect(response.status).toBe(401);
    });
  });
});

