/**
 * Parse CSV string to array of product objects
 */
function parseCSV(csvString) {
  const lines = csvString.split("\n").filter((line) => line.trim());
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Get headers from first line
  const headers = parseCSVLine(lines[0]);

  // Map headers to expected fields
  const fieldMap = {
    name: "name",
    "product name": "name",
    title: "name",
    slug: "slug",
    price: "price",
    category: "category",
    brand: "brand",
    stock: "stock_quantity",
    "stock quantity": "stock_quantity",
    stock_quantity: "stock_quantity",
    quantity: "stock_quantity",
    description: "description",
    "long description": "long_description",
    long_description: "long_description",
    weight: "weight",
    status: "status",
    "discount price": "discount_price",
    discount_price: "discount_price",
    sku: "sku",
    images: "product_images",
    "product images": "product_images",
    product_images: "product_images",
    tags: "tags",
    colors: "colors",
    sizes: "sizes",
    features: "features",
    "additional features": "features",
    type: "type",
    "is featured": "is_featured",
    is_featured: "is_featured",
    "is new arrival": "is_new_arrival",
    is_new_arrival: "is_new_arrival",
    materials: "materials",
    material: "materials",
    warranty: "warranty",
    "care instructions": "care_instructions",
    care_instructions: "care_instructions",
    "additional info": "additional_info",
    additional_info: "additional_info",
    specifications: "specifications",
    specification: "specifications",
    "packing standard": "packing_standard",
    packing_standard: "packing_standard",
    "admin email": "admin_email",
    admin_email: "admin_email",
    "admin name": "admin_name",
    admin_name: "admin_name",
    "admin number": "admin_number",
    admin_number: "admin_number",
    "video url": "video_url",
    video_url: "video_url",
    "affiliate link": "affiliate_link",
    affiliate_link: "affiliate_link",
    "default delivery charge": "default_delivery_charge",
    default_delivery_charge: "default_delivery_charge",
  };

  // Fields that should be parsed as arrays (JSON or pipe-separated or comma-separated)
  const ARRAY_FIELDS = [
    "product_images",
    "tags",
    "colors",
    "sizes",
    "features",
    "variants",
    "delivery_charges",
    "specifications",
  ];

  // Fields that are numbers
  const FLOAT_FIELDS = [
    "price",
    "discount_price",
    "weight",
    "default_delivery_charge",
  ];

  // Fields that are numbers (integer)
  const INT_FIELDS = ["stock_quantity"];

  // Boolean fields
  const BOOL_FIELDS = ["is_featured", "is_new_arrival"];

  // Map headers to database fields
  const mappedHeaders = headers.map((header) => {
    const trimmed = header.trim().toLowerCase();
    return fieldMap[trimmed] || trimmed;
  });

  const products = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const product = {};

    for (let j = 0; j < mappedHeaders.length; j++) {
      const field = mappedHeaders[j];
      const rawValue = values[j] !== undefined ? values[j] : "";
      const value = rawValue.trim();

      if (FLOAT_FIELDS.includes(field)) {
        product[field] = parseFloat(value) || 0;
      } else if (INT_FIELDS.includes(field)) {
        product[field] = parseInt(value) || 0;
      } else if (BOOL_FIELDS.includes(field)) {
        product[field] =
          value.toLowerCase() === "true" || value === "1" ? 1 : 0;
      } else if (ARRAY_FIELDS.includes(field)) {
        product[field] = parseArrayValue(value, field);
      } else {
        product[field] = value === "" ? null : value;
      }
    }

    // Validate product
    const validation = validateProductData(product);
    product._validation = validation;

    products.push(product);
  }

  return products;
}

/**
 * Parse a value into an array. Tries JSON first, then pipe, then comma.
 */
function parseArrayValue(value, field) {
  if (!value) return [];

  // Try JSON first
  if (value.startsWith("[") || value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  if (value.includes("|")) {
    return value
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s !== "");
  }

  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Validate product data against required fields
 */
function validateProductData(product) {
  const errors = [];

  if (!product.name || product.name.trim() === "") {
    errors.push("Product name is required");
  }

  if (!product.price || isNaN(product.price) || product.price <= 0) {
    errors.push("Valid price is required (must be > 0)");
  }

  if (!product.category || product.category.trim() === "") {
    errors.push("Category is required");
  }

  if (
    product.stock_quantity === undefined ||
    isNaN(product.stock_quantity) ||
    product.stock_quantity < 0
  ) {
    errors.push("Valid stock quantity is required (must be >= 0)");
  }

  if (
    product.status &&
    !["active", "inactive", "draft"].includes(product.status)
  ) {
    errors.push("Status must be: active, inactive, or draft");
  }

  if (product.type && !["own", "affiliate"].includes(product.type)) {
    errors.push("Type must be: own or affiliate");
  }

  if (product.discount_price && product.discount_price >= product.price) {
    errors.push("Discount price must be less than regular price");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate CSV template headers
 */
function getCSVTemplate() {
  return [
    "name",
    "slug",
    "description",
    "long_description",
    "category",
    "brand",
    "packing_standard",
    "weight",
    "materials",
    "warranty",
    "care_instructions",
    "additional_info",
    "specifications",
    "price",
    "discount_price",
    "stock_quantity",
    "product_images",
    "sizes",
    "features",
    "status",
    "type",
    "colors",
    "tags",
    "is_featured",
    "is_new_arrival",
  ].join(",");
}

module.exports = {
  parseCSV,
  validateProductData,
  getCSVTemplate,
  parseCSVLine,
  parseArrayValue,
};
