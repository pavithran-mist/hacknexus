const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

let schemaContent = fs.readFileSync(schemaPath, "utf-8");

const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

if (isPostgres) {
  console.log("🐘 Detected PostgreSQL DATABASE_URL (Neon / Supabase / Railway).");
  schemaContent = schemaContent.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
} else {
  console.log("📦 Detected SQLite DATABASE_URL (Local Development).");
  schemaContent = schemaContent.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schemaContent, "utf-8");
console.log(`✅ prisma/schema.prisma configured for provider: ${isPostgres ? "postgresql" : "sqlite"}`);
