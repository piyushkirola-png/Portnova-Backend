const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "mysql",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "decorvault",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

async function initializeDatabase() {
  try {
    const connection = await promisePool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();

    await setupFromSchema();
  } catch (error) {
    console.log(
      `❌ Database connection failed to ${pool.config.connectionConfig.host}:${pool.config.connectionConfig.port}`,
    );
    console.log("Error:", error.message);
  }
}

async function setupFromSchema() {
  try {
    const schemaPath = path.join(__dirname, "../../db/schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    const statements = schemaSQL.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await promisePool.query(statement.trim());
      }
    }

    console.log("✅ Database schema applied successfully");
  } catch (error) {
    console.log("❌ Schema setup failed:", error.message);
  }
}

initializeDatabase();

module.exports = promisePool;
