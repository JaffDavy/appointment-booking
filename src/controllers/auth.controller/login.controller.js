import 'dotenv/config'
import { query } from "../../config/db.js"
import logger from "../../utils/logger.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export default async function loginHandler(req, res, next) {
  const email = req.body.email ? req.body.email.trim() : ""
  const password = req.body.password

  try {
    const findUserSQL = `SELECT id, email, name, password_hash, role FROM users WHERE email = $1`
    const userResult = await query(findUserSQL, [email])

    if (userResult.rowCount === 0) {
      logger.warn(`Login attempt failed: User not found - ${email}`)
      return res.status(401).json({ message: 'Invalid Credentials' })
    }

    const user = userResult.rows[0]

    logger.info(`Comparing input password with hash for user: ${email}`)

    const isPassswordMatch = await bcrypt.compare(password, user.password_hash)

    if (!isPassswordMatch) {
      logger.warn(`Login attempt failed: Incorrect password - ${email}`)
      return res.status(401).json({ message: "Invalid password" })
    }

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

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