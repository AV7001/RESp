import request from 'supertest';
import app from '../server/index.js'; // Adjust the path as necessary to import your Express app

describe('API Routes', () => {
  it('should get all tasks', async () => {
    const response = await request(app).get('/tasks');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  it('should login a user', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should get all sites', async () => {
    const response = await request(app).get('/sites');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
