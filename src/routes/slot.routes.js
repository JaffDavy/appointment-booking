import express from 'express';
import TimeSlot from '../models/TimeSlot.js';
import Provider from '../models/Provider.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(403).json({ message: 'Only providers can create time slots' });
    }
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'startTime and endTime are required' });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }
    const slot = await TimeSlot.create({ provider: provider._id, startTime: start, endTime: end });
    res.status(201).json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const slots = await TimeSlot.find({ isBooked: false }).populate('provider');
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id).populate('provider');
    if (!slot) return res.status(404).json({ message: 'Time slot not found' });
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/book', protect, async (req, res) => {
  try {
    const slot = await TimeSlot.findOneAndUpdate(
      { _id: req.params.id, isBooked: false },
      { isBooked: true, bookedBy: req.user._id },
      { new: true }
    );
    if (!slot) {
      const exists = await TimeSlot.findById(req.params.id);
      if (!exists) return res.status(404).json({ message: 'Time slot not found' });
      return res.status(400).json({ message: 'Slot already booked' });
    }
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id).populate('provider');
    if (!slot) return res.status(404).json({ message: 'Time slot not found' });
    if (!slot.isBooked) {
      return res.status(400).json({ message: 'Slot is not booked' });
    }
    const isBooker = slot.bookedBy && slot.bookedBy.toString() === req.user._id.toString();
    const isProviderOwner = slot.provider.user.toString() === req.user._id.toString();
    if (!isBooker && !isProviderOwner) {
      return res.status(403).json({ message: 'Not authorized to cancel this slot' });
    }
    slot.isBooked = false;
    slot.bookedBy = null;
    await slot.save();
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
