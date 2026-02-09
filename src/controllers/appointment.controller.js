import { pool } from '../config/db.js'

export const bookAppointment = async (req, res) => {
    const { slot_id, provider_id } = req.body
    const client_id = req.user.id

    try {
        const slotCheck = await pool.query(
            'SELECT is_booked FROM time_slots WHERE id = $1',
            [slot_id]
        )
        if (slotCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Slot does not exist' })
        }
        if (slotCheck.rows[0].is_booked) {
            return res.status(400).json({ message: 'Slot is already booked' })
        }
        await pool.query('BEGIN')

        const newAppointment = await pool.query(
            `INSERT INTO appointments (client_id, provider_id, slot_id)
            VALUES ($1, $2, $3) RETURNING *`,
            [client_id, provider_id, slot_id]
        )
        await pool.query(
            'UPDATE time_slots SET is_booked = true WHERE id = $1',
            [slot_id]
        )
        await pool.query('COMMIT')
        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: newAppointment.rows[0]
        })
    } catch (err) {
        await pool.query('ROLLBACK')
        console.error(err)
        res.status(500).json({ message: 'Error booking appointment' })
    }
}
