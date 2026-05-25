import 'dotenv/config'
import pg from 'pg'
import logger from '../utils/logger.js'

const { Pool } = pg

const isProduction = 
  process.env.NODE_ENV === 'production' || 
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com'));

// FIX: Clean pool options passing for native cloud database environments
const poolConfig = isProduction 
  ? {
      connectionString: process.env.DATABASE_URL,
      // Render databases require ssl connection profiles.
      // We explicitly trust the connection layer properties here.
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
    };

const pool = new Pool(poolConfig);

/**
 * Connects to the Database with enhanced error logging for Render
 */
export const connectToDb = async () => {
    try {
        logger.info(`Attempting DB connection. Mode: ${isProduction ? 'Production' : 'Local'}`);
        const client = await pool.connect();
        logger.info('✅ Successfully connected to the database');
        client.release();
    } catch (err) {
        logger.error(`❌ DATABASE CONNECTION ERROR: ${err.message}`);
        process.exit(1); 
    }
};

/**
 * Executes queries with performance logging
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const response = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(`Executed query: { duration: ${duration}ms, rows: ${response.rowCount} }`);
    return response;
  } catch (error) {
    logger.error(`Error executing query: ${error.message}`);
    throw error;
  }
};

export { pool };