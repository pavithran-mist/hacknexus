const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
  if (match) {
    dbUrl = match[1];
  }
}

dbUrl = dbUrl || "file:./dev.db";

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
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
