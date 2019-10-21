import request from 'supertest';
import bcrypit from 'bcryptjs';

import app from '../../../src/app';

import truncate from '../../util/truncate';
import factory from '../../factories';
import authorization from '../../util/authorization';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should encrypt user password when new user created', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const compareHash = await bcrypit.compare('123456', user.password_hash);

    expect(compareHash).toBe(true);
  });

  it('should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with duplicated email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should fail register validation', async () => {
    const user = { name: 'Vitor Morelli', email: '123', password: '123456' };

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should be able to update user profile', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const token = await authorization(user);

    const response = await request(app)
      .put('/users')
      .send({
        name: 'New name',
        email: user.email,
        oldPassword: user.password,
        password: '123456',
        confirmPassword: '123456',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toHaveProperty('id');
  });
});
