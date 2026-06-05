import app from "../app.js";
import { pool } from "../config/db.js";
import { getIO } from "../utils/socket.js";

export const bookAppointment = async (req, res) => {
  const { slot_id, provider_id } = req.body;
  const client_id = req.user?.id || req.body.client_id;

  try {
    const slotCheck = await pool.query(
      "SELECT is_booked FROM time_slots WHERE id = $1",
      [slot_id],
    );

    if (slotCheck.rows.length === 0) {
      return res.status(400).json({ message: "Slot does not exist" });
    }
    if (slotCheck.rows[0].is_booked) {
      return res.status(400).json({ message: "Slot is already booked" });
    }

    await pool.query("BEGIN");

    const newAppointment = await pool.query(
      `INSERT INTO appointments (client_id, provider_id, slot_id)
            VALUES ($1, $2, $3) RETURNING *`,
      [client_id, provider_id, slot_id],
    );

    await pool.query("UPDATE time_slots SET is_booked = true WHERE id = $1", [
      slot_id,
    ]);

    await pool.query("COMMIT");

    try {
      const io = getIO();
      io.to(provider_id).emit("notification", {
        type: "NEW_BOOKING",
        message: `A client has booked an appointment with you!`,
        appointment: newAppointment.rows[0],
      });
      console.log(`Notification sent to provider: ${provider_id}`);
    } catch (socketErr) {
      console.error("Socket notification failed:", socketErr.message);
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment.rows[0],
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Error booking appointment" });
  }
};

export const getAppointments = async (req, res) => {
  const userId = req.user.id || (req.user.user && req.user.user.id);
  let userRole = req.user.role;
  if (!userRole && req.user.user) {
    userRole = req.user.user.role;
  }
  const sanitizedRole = userRole ? userRole.toLowerCase().trim() : null;

  try {
    let sql;
    if (sanitizedRole === "client") {
      sql = `
                SELECT a.id, u.name as provider_name, ts.start_time, ts.end_time, a.status
                FROM appointments a
                JOIN time_slots ts ON a.slot_id = ts.id
                JOIN users u ON a.provider_id = u.id
                WHERE a.client_id = $1`;
    } else if (sanitizedRole === "provider") {
      sql = `
                SELECT a.id, u.name as client_name, ts.start_time, ts.end_time, a.status
                FROM appointments a
                JOIN time_slots ts ON a.slot_id = ts.id
                JOIN users u ON a.client_id = u.id
                WHERE a.provider_id = $1`;
    } else {
      console.log(
        "DEBUG ERROR: Full req.user object is:",
        JSON.stringify(req.user, null, 2),
      );
      return res.status(403).json({
        message: "Invalid role. Cannot fetch appointments.",
        debug_your_token_contents: req.user,
      });
    }

    const result = await pool.query(sql, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelAppointment = async (req, res) => {
  const { appointment_id } = req.body;

  try {
    if (!appointment_id) {
      return res.status(400).json({ message: "appointment_id is required" });
    }

    const appointmentCheck = await pool.query(
      "SELECT slot_id FROM appointments WHERE id = $1",
      [appointment_id],
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const slot_id = appointmentCheck.rows[0].slot_id;

    await pool.query("BEGIN");

    await pool.query("DELETE FROM appointments WHERE id = $1", [
      appointment_id,
    ]);

    await pool.query("UPDATE time_slots SET is_booked = false WHERE id = $1", [
      slot_id,
    ]);

    await pool.query("COMMIT");

    return res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Error cancelling appointment" });
  }
};
