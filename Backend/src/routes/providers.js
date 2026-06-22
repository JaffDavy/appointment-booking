import express from 'express';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const existing = await Provider.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Already registered as a provider' });
    }
    await User.findByIdAndUpdate(req.user._id, { role: 'provider' });
    const provider = await Provider.create({
      user: req.user._id,
      specialty: req.body.specialty || 'General',
      bio: req.body.bio || '',
    });
    res.status(201).json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find().populate('user', 'name email');
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
