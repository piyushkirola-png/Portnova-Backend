const bcrypt = require("bcryptjs");
const db = require("../src/config/db");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Admin";
const ADMIN_MOBILE = "9999999999";

async function seedAdmin() {
  try {
    console.log("🌱 Seeding admin user...");

    const [existing] = await db.query(
      "SELECT id, role FROM users WHERE email = ? LIMIT 1",
      [ADMIN_EMAIL],
    );

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (existing.length > 0) {
      const admin = existing[0];
      await db.query(
        `UPDATE users
         SET password = ?, role = 'admin', is_verified = TRUE
         WHERE id = ?`,
        [passwordHash, admin.id],
      );
      console.log(
        `✅ Admin '${ADMIN_EMAIL}' already existed — password reset, role ensured.`,
      );
    } else {
      await db.query(
        `INSERT INTO users (full_name, email, mobile, password, role, is_verified)
         VALUES (?, ?, ?, ?, 'admin', TRUE)`,
        [ADMIN_NAME, ADMIN_EMAIL, ADMIN_MOBILE, passwordHash],
      );
      console.log(`✅ Admin '${ADMIN_EMAIL}' created.`);
    }
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seedAdmin();
