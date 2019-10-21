import request from 'supertest';
import app from '../../src/app';

async function getAuthorizationToken(user) {
  const response = await request(app)
    .post('/sessions')
    .send(user);

  return response.body.token;
}

export default getAuthorizationToken;
