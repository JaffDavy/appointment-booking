import 'dotenv/config'
import { query } from "../config/db.js"
import logger from "../utils/logger.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export default async function loginHandler(req, res, next) {
  // 1. Trim the email to remove accidental spaces
  const email = req.body.email ? req.body.email.trim() : ""
  const password = req.body.password

  try {
    const findUserSQL = `SELECT id, email, name, password_hash, role FROM users WHERE email = $1`
    const userResult = await query(findUserSQL, [email])

    // Check if user exists
    if (userResult.rowCount === 0) {
      logger.warn(`Login attempt failed: User not found - ${email}`)
      return res.status(401).json({ message: 'Invalid Credentials' })
    }

    const user = userResult.rows[0]

    // 2. DEBUG: Log this to your terminal to see what is happening
    logger.info(`Comparing input password with hash for user: ${email}`)

    const isPassswordMatch = await bcrypt.compare(password, user.password_hash)
    
    if (!isPassswordMatch) {
      logger.warn(`Login attempt failed: Incorrect password - ${email}`)
      return res.status(401).json({ message: "Invalid password" })
    }

    // 3. Generate Token (Cleaner synchronous way)
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    })

    logger.info(`User logged in successfully: ${email} (ID: ${user.id})`)

    return res.json({
      message: "Login Successful!",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    logger.error(`Error during login process for ${email}: `, error)
    return res.status(500).json({ message: "Server error during login" })
  }
}