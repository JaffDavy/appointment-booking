import TimeSlot from "../models/TimeSlot.js";
import Provider from "../models/Provider.js";
import { getIO } from "../utils/socket.js";

export const bookAppointment = async (req, res) => {
  const { slot_id } = req.body;
  const clientId = req.user._id;

  try {
    const slot = await TimeSlot.findOneAndUpdate(
      { _id: slot_id, isBooked: false },
      { isBooked: true, bookedBy: clientId },
      { new: true },
    ).populate("provider");

    if (!slot) {
      const exists = await TimeSlot.findById(slot_id);
      if (!exists)
        return res.status(404).json({ message: "Slot does not exist" });
      return res.status(400).json({ message: "Slot is already booked" });
    }

    try {
      const io = getIO();
      io.to(slot.provider.user.toString()).emit("notification", {
        type: "NEW_BOOKING",
        message: "A client has booked an appointment with you!",
        slot,
      });
    } catch (socketErr) {
      console.error("Socket notification failed:", socketErr.message);
    }

    res.status(201).json({ message: "Appointment booked successfully", slot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error booking appointment" });
  }
};

export const getAppointments = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  try {
    let slots;

    if (role === "client") {
      slots = await TimeSlot.find({
        bookedBy: userId,
        isBooked: true,
      }).populate({
        path: "provider",
        populate: { path: "user", select: "name email" },
      });
    } else if (role === "provider") {
      const provider = await Provider.findOne({ user: userId });
      if (!provider)
        return res.status(404).json({ message: "Provider profile not found" });
      slots = await TimeSlot.find({
        provider: provider._id,
        isBooked: true,
      }).populate({ path: "bookedBy", select: "name email" });
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelAppointment = async (req, res) => {
  const { slot_id } = req.body;

  try {
    if (!slot_id)
      return res.status(400).json({ message: "slot_id is required" });

    const slot = await TimeSlot.findById(slot_id).populate("provider");
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (!slot.isBooked)
      return res.status(400).json({ message: "Slot is not booked" });

    const isBooker = slot.bookedBy?.toString() === req.user._id.toString();
    const isProviderOwner =
      slot.provider.user.toString() === req.user._id.toString();

    if (!isBooker && !isProviderOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this slot" });
    }

    slot.isBooked = false;
    slot.bookedBy = null;
    await slot.save();

    res.json({ message: "Appointment cancelled successfully", slot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error cancelling appointment" });
  }
};
