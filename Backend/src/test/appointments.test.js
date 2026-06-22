import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import TimeSlot from '../models/TimeSlot.js';
import Provider from '../models/Provider.js';

let authToken, providerToken, slotId;
const uniqueEmail = `alice-${Date.now()}@clinic.com`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Register client
  const clientRes = await request(app).post('/api/auth/register').send({
    name: 'Alice Smith', email: uniqueEmail, password: 'password123', role: 'client',
  });
  authToken = clientRes.body.token;

  // Register provider and create a slot
  const providerRes = await request(app).post('/api/auth/register').send({
    name: 'Dr Jones', email: `doctor-${Date.now()}@clinic.com`, password: 'password123', role: 'provider',
  });
  providerToken = providerRes.body.token;

  const slotRes = await request(app).post('/api/slots')
    .set('Authorization', `Bearer ${providerToken}`)
    .send({
      startTime: new Date(Date.now() + 3600000).toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
    });
  slotId = slotRes.body._id;
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /clinic\.com$/ } });
  await Provider.deleteMany({});
  await TimeSlot.deleteMany({});
  await mongoose.connection.close();
});

describe('Appointments API Tests', () => {
  test('Should fail to book without authentication', async () => {
    const res = await request(app).post('/api/appointments/book').send({ slot_id: slotId });
    expect(res.status).toBe(401);
  });

  test('Should return 400/404 for booking non-existent slot', async () => {
    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ slot_id: new mongoose.Types.ObjectId().toString() });
    expect([400, 404]).toContain(res.status);
  });

  test('Should book an existing slot successfully', async () => {
    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ slot_id: slotId });
    expect(res.status).toBe(201);
  });

  test('Should not double book a slot', async () => {
    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ slot_id: slotId });
    expect(res.status).toBe(400);
  });
});
