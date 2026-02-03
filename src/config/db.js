import pg from 'pg'
import logger from '../utils/logger.js'

const { Pool } = pg

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = process.env

if (!DB_HOST || !DB_PASSWORD || !DB_NAME || !DB_USER || !DB_PORT ) {
  logger.error("Database environment variables are missing! Check your .env file.")
  process.exit(1)
}

const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT, 10),
    connectionTimeoutMillis: 2000
})

logger.info(`Database is configured to connect to ${DB_NAME} at ${DB_HOST}:${DB_PORT} as user ${DB_USER}`)

pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle client in pool', err)
    process.exit(-1)
})

pool.on('connect', (client) => {
    logger.info(`Database client connected from Pool(Total count: ${pool.totalCount})`)
})

const connectToDb = async () => {
    try {
        const client = await pool.connect()
        logger.info('Successfully connected to the database')
        client.release()
    }
    catch (err) {
        logger.error('Error connecting to the database', err)
        process.exit(1)
    }
}

const query = async (text, params) => {
  const start = Date.now()
  try {
    const response = await pool.query(text, params)
    const duration = Date.now() - start;
    logger.info(`Executed query: { text: ${text.substring(0, 100)}..., params: ${JSON.stringify(params)}, duration: ${duration}ms, rows: ${response.rowCount}}`);
    return response
  } catch (error) {
    logger.error(`Error executing query: { text: ${text.substring(0, 100)}..., params: ${JSON.stringify(params)}, error: ${error.message}}`);
    throw error
  }
}

export { pool, connectToDb, query }