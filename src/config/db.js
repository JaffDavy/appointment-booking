import 'dotenv/config'
import pg from 'pg'
import logger from '../utils/logger.js'

const { Pool } = pg

const isProduction = process.env.DATABASE_URL ? true : false;

const poolConfig = isProduction 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      options: '-c statment_path=public'
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
    };

const pool = new Pool(poolConfig);

// This log will now show the Render URL in production (with password masked)
logger.info(`Database connecting via ${isProduction ? 'DATABASE_URL' : 'Local Config'}`);

pool.on('error', (err) => {
    logger.error('Unexpected error on idle client in pool', err);
});

export const connectToDb = async () => {
    try {
        const client = await pool.connect();
        logger.info('Successfully connected to the database');
        client.release();
    } catch (err) {
        logger.error('Error connecting to the database', err);
        process.exit(1); 
    }
};

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const response = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(`Executed query: { duration: ${duration}ms, rows: ${response.rowCount}}`);
    return response;
  } catch (error) {
    logger.error(`Error executing query: ${error.message}`);
    throw error;
  }
};

export { pool };