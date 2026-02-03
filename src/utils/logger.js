import winston from 'winston'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const logDirectory = path.join(__dirname, '../logs')

const { colorize, combine, timestamp, printf, errors, json } = winston.format

// Custom format for Console to make it readable and colorful
const consoleFormat = combine(
    colorize({ all: true }), 
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ timestamp, level, message, stack }) => {
        return `[${timestamp}] ${level}: ${stack || message}`;
    })
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
        errors({ stack: true}),
        json() // Files will still save in structured JSON
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDirectory, 'app.log'),
            level: "info",
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(logDirectory, 'error.log'),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
})

// Console logging for development
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        level: "debug"
    }))
}

export default logger