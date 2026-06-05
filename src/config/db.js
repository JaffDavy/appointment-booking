import "dotenv/config";
import pg from "pg";
import logger from "../utils/logger.js";

const { Pool } = pg;

const isProduction =
  process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com"));

const poolConfig = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
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

export const connectToDb = async () => {
  try {
    logger.info(
      `Attempting DB connection. Mode: ${isProduction ? "Production" : "Local"}`,
    );
    const client = await pool.connect();
    logger.info("✅ Successfully connected to the database");
    client.release();
  } catch (err) {
    logger.error(`❌ DATABASE CONNECTION ERROR ON STARTUP: ${err.message}`);
    logger.warn(
      "⚠️ Server is staying alive to serve diagnostics/health checks, but DB features are currently offline.",
    );
  }
};

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const response = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(
      `Executed query: { duration: ${duration}ms, rows: ${response.rowCount} }`,
    );
    return response;
  } catch (error) {
    logger.error(`Error executing query: ${error.message}`);
    throw error;
  }
};

export { pool };
