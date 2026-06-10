import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to the Appointment Booking API' });
});

export default router;