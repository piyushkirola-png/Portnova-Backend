const bcrypt = require("bcryptjs");
const db = require("../src/config/db");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Admin";
const ADMIN_MOBILE = "9999999999";

const CATEGORIES = [
  { name: "Men Apparel", slug: "men-apparel" },
  { name: "Men Footwear", slug: "men-footwear" },
  { name: "Women Apparel", slug: "women-apparel" },
  { name: "Women Footwear", slug: "women-footwear" },
  { name: "Men Accessories", slug: "men-accessories" },
  { name: "Women Accessories", slug: "women-accessories" },
  { name: "Men Caps", slug: "men-caps" },
  { name: "Women Watches", slug: "women-watches" },
  { name: "Wedding", slug: "wedding" },
  { name: "Night Out", slug: "night-out" },
  { name: "Workwear", slug: "workwear" },
  { name: "Gym", slug: "gym" },
  { name: "Casual", slug: "casual" },
  { name: "Fall Tops", slug: "fall-tops" },
];

const BRANDS = [{ name: "Portnova", slug: "portnova" }];

// ==================== SEED ADMIN ====================
async function seedAdmin() {
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
}

// ==================== SEED CATEGORIES ====================
async function seedCategories() {
  console.log("🌱 Seeding categories...");

  let inserted = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      [cat.slug],
    );

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.query(
      `INSERT INTO categories (name, slug, status)
       VALUES (?, ?, 'active')`,
      [cat.name, cat.slug],
    );
    inserted++;
    console.log(`  ✅ Created category: ${cat.name}`);
  }

  console.log(
    `✅ Categories — ${inserted} inserted, ${skipped} already existed.`,
  );
}

// ==================== SEED BRANDS ====================
async function seedBrands() {
  console.log("🌱 Seeding brands...");

  let inserted = 0;
  let skipped = 0;

  for (const brand of BRANDS) {
    const [existing] = await db.query(
      "SELECT id FROM brands WHERE slug = ? LIMIT 1",
      [brand.slug],
    );

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.query(
      `INSERT INTO brands (name, slug, status)
       VALUES (?, ?, 'active')`,
      [brand.name, brand.slug],
    );
    inserted++;
    console.log(`  ✅ Created brand: ${brand.name}`);
  }

  console.log(`✅ Brands — ${inserted} inserted, ${skipped} already existed.`);
}

// ==================== MAIN ====================
async function seedAll() {
  try {
    await seedAdmin();
    await seedCategories();
    await seedBrands();
    console.log("\n🎉 All seeds completed successfully.\n");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seedAll();
