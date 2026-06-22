import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import TimeSlot from '../models/TimeSlot.js';

const request = supertest(app);
let providerToken, clientToken, providerUserId, slotId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
  await User.deleteMany({ email: /@slots-test\.com$/ });
  await Provider.deleteMany({});
  await TimeSlot.deleteMany({});
}, 30000);

afterAll(async () => {
  await User.deleteMany({ email: /@slots-test\.com$/ });
  await Provider.deleteMany({});
  await TimeSlot.deleteMany({});
  await mongoose.connection.close();
}, 30000);

describe('Auth', () => {
  it('POST /api/auth/register - creates a provider and Provider doc', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Dr Smith', email: 'provider@slots-test.com', password: 'password123', role: 'provider',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe('provider');
    providerToken = res.body.token;
    providerUserId = res.body._id;
    const provDoc = await Provider.findOne({ user: providerUserId });
    expect(provDoc).not.toBeNull();
  });

  it('POST /api/auth/register - creates a client', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Jane Client', email: 'client@slots-test.com', password: 'password123', role: 'client',
    });
    expect(res.status).toBe(201);
    clientToken = res.body.token;
  });

  it('POST /api/auth/login - success', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'provider@slots-test.com', password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login - wrong password returns 400', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'provider@slots-test.com', password: 'wrongpassword',
    });
    expect(res.status).toBe(400);
  });
});

describe('Slots', () => {
  it('POST /api/slots - provider creates slot (201)', async () => {
    const res = await request.post('/api/slots')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
      });
    expect(res.status).toBe(201);
    slotId = res.body._id;
  });

  it('POST /api/slots - non-provider gets 403', async () => {
    const res = await request.post('/api/slots')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
      });
    expect(res.status).toBe(403);
  });

  it('POST /api/slots - end before start returns 400', async () => {
    const res = await request.post('/api/slots')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        startTime: new Date(Date.now() + 7200000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
      });
    expect(res.status).toBe(400);
  });

  it('GET /api/slots/:id - 404 for unknown id', async () => {
    const res = await request.get(`/api/slots/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /api/slots/:id/book - client books slot (200)', async () => {
    const res = await request.patch(`/api/slots/${slotId}/book`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isBooked).toBe(true);
  });

  it('PATCH /api/slots/:id/book - double booking returns 400', async () => {
    const res = await request.patch(`/api/slots/${slotId}/book`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already booked/i);
  });

  it('PATCH /api/slots/:id/cancel - unauthorized user gets 403', async () => {
    const reg = await request.post('/api/auth/register').send({
      name: 'Random', email: 'random@slots-test.com', password: 'password123',
    });
    const res = await request.patch(`/api/slots/${slotId}/cancel`)
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(403);
  });

  it('PATCH /api/slots/:id/cancel - booker can cancel (200)', async () => {
    const res = await request.patch(`/api/slots/${slotId}/cancel`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isBooked).toBe(false);
  });

  it('PATCH /api/slots/:id/cancel - unbooked slot returns 400', async () => {
    const res = await request.patch(`/api/slots/${slotId}/cancel`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(400);
  });

  it('GET /api/slots - lists available slots', async () => {
    const res = await request.get('/api/slots');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Providers', () => {
  it('POST /api/providers - client onboards as provider (201)', async () => {
    const reg = await request.post('/api/auth/register').send({
      name: 'New Provider', email: 'newprovider@slots-test.com', password: 'password123', role: 'client',
    });
    const res = await request.post('/api/providers')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ specialty: 'Cardiology' });
    expect(res.status).toBe(201);
  });

  it('POST /api/providers - already-provider gets 400', async () => {
    const res = await request.post('/api/providers')
      .set('Authorization', `Bearer ${providerToken}`);
    expect(res.status).toBe(400);
  });

  it('GET /api/providers - lists providers', async () => {
    const res = await request.get('/api/providers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
