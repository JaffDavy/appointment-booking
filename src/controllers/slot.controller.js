import logger from "../utils/logger.js"
import { query } from "../config/db.js"

export async function getAvailableSlots(req, res, next) {
    const { provider_id } = req.query;

    try {
        let sql = `SELECT * FROM time_slots WHERE is_booked = FALSE`;
        const params = [];

        if (provider_id) {
            sql += ` AND provider_id = $1`;
            params.push(provider_id);
        }

        sql += ` ORDER BY start_time ASC`;

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        logger.error("Error fetching available slots:", error);
        next(error);
    }
}

export const createSlot = async (req, res, next) => {
    const { provider_id, start_time, end_time } = req.body;

    try {
        if (!provider_id || !start_time || !end_time) {
            return res.status(400).json({ message: "Missing provider_id, start_time, or end_time" });
        }

        if (req.user.id !== provider_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You can only create slots for your own account." });
        }

        const sql = `
            INSERT INTO time_slots (provider_id, start_time, end_time) 
            VALUES ($1, $2, $3) 
            RETURNING *`;
        
        const result = await query(sql, [provider_id, start_time, end_time]);
        
        logger.info(`Slot created for provider ${provider_id}: ${start_time} to ${end_time}`);

        res.status(201).json({
            message: "Time slot created successfully",
            slot: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: "This time slot already exists." });
        }
        next(error);
    }
};

export const deleteSlot = async (req, res, next) => {
    const { slot_id } = req.params;

    try {
        const slotResult = await query('SELECT provider_id from time_slots WHERE id = $1', [slot_id]);
        if (slotResult.rows.length === 0) {
            return res.status(404).json({ message: "Slot not found" });
        }
        const slot = slotResult.rows[0];
        if (req.user.id !== slot.provider_id) {
            return res.status(403).json({ message: "You can only delete your own slots." });
        }
        await query('DELETE FROM time_slots WHERE id = $1', [slot_id]);
        logger.info(`Slot deleted: ${slot_id}`);
        res.json({ message: "Slot deleted successfully" });
    } catch (error) {
        logger.error("Error deleting slot:", error);
        next(error);
    }
}