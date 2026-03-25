/**
 * Aplica schema + seed SQL e inserta usuarios demo con contraseñas hasheadas (bcrypt).
 * Uso: npm run db:setup -w server (requiere DATABASE_URL en server/.env)
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Definí DATABASE_URL en server/.env");
  process.exit(1);
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    const schema = readFileSync(join(__dirname, "../sql/schema.sql"), "utf8");
    const seed = readFileSync(join(__dirname, "../sql/seed.sql"), "utf8");
    const seedUsers = readFileSync(join(__dirname, "../sql/seed-users.sql"), "utf8");

    await client.query("BEGIN");
    await client.query(schema);
    await client.query(seed);
    await client.query(seedUsers);

    await client.query("COMMIT");
    console.log("Base lista. Usuarios: admin@fireburst.local / FireBurst2025!  |  demo@fireburst.local / demo1234");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
