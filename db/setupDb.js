const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const dbName = process.env.DB_NAME || "portnova";
const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "12345";

async function setupDatabase() {
  console.log(`🔧 Setting up database '${dbName}' at ${host}:${port}...`);

  const rootConn = await mysql.createConnection({ host, port, user, password });
  try {
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' checked/created.`);
  } finally {
    await rootConn.end();
  }

  const dbConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: dbName,
    multipleStatements: true,
  });

  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("📄 Executing schema.sql...");
    await dbConn.query(schemaSQL);
    console.log("✅ Schema applied successfully.");

    const [rows] = await dbConn.query(
      `SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ?`,
      [dbName],
    );
    console.log(`📊 Tables in '${dbName}': ${rows[0].count}`);
  } finally {
    await dbConn.end();
  }
}

setupDatabase().catch((err) => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
