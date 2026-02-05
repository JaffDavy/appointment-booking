import { query } from "../config/db.js";
import logger from "../utils/logger.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export default async function loginHandler(req, res, next) {
    const { email, password } = req.body
    try {
        const findUserQuery = `SELECT id, name, email, password_hash, role FROM users WHERE email = $1`
        const userResult = await query(findUserQuery, [email])

        if (userResult.rowCount === 0) {
            logger.warn(`Login attempt failed: User not found: ${email}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            logger.warn(`Invalid password for user: ${email}`);
            return res.status(401).json({ message: "Invalid password" });
        }
       const payload = {
         user: {
            id: user.id,
            email: user.emai
         }
       }
       jwt.sign(payload, process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }, (err, token) => {
            if (err) {
                logger.error(`Error generating JWT for ${email}:`, err)
                throw new Error('Error generating token')
            }
            logger.info(`JWT generated successfully for user: ${email} (ID: ${user.id})`);
            res.json({
                message: "Login successful",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })
        }
       )
    } catch (error) {
        logger.error(`Error logging in user: ${error.message}`, error);
        res.status(500).json({ message: error.message || "server error during login."})
    }
}