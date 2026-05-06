import { query } from "../../config/db.js";
import bcrypt from "bcryptjs"
import logger from "../../utils/logger.js";

const HASH_SALT = 10
export default async function registerHandler(req, res, next) {

    const { name, email, password_hash, role } = req.body 

    try {
        if (!password_hash) {
            return res.status(400).json({ message: "Password is required" });
        }

        const userCheckQuery = 'SELECT email FROM users WHERE email = $1'
        const usercheckResult = await query(userCheckQuery, [email])
        
        if (usercheckResult.rows.length > 0) {
            logger.warn(`User already exists: ${email}`);
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password_hash, HASH_SALT)
        
        const insertUserQuery = `
            INSERT INTO users (name, email, password_hash, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id`
        
        const newUserResult = await query(insertUserQuery, [name, email, hashedPassword, role || 'client'])
        
        const newUser = newUserResult.rows[0]
        logger.info(`New user registered: ${email}`);

        res.status(201).json({ 
            message: "User registered successfully", 
            userId: newUser.id 
        })
    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        next(error)
    }
}