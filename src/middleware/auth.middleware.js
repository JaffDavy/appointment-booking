import jwt from "jsonwebtoken";
import logger from "../utils/logger.js"

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(' ')[1] : null;

    if (!token) {
        logger.warn(`Authentication middleware: No token provided`);
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        logger.debug(`Authentication middleware: Token verified for user ${req.user.id}`);
        next();
    } catch (error) {
        logger.error(`Authentication middleware: Invalid token`, error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        return res.status(401).json({ message: "Invalid token. Please log in again." });
    }
}

export default authMiddleware;