import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const BUSY_TIMEOUT_MS = 5000;

function schemaPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "schema.sql");
}

export function openDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`);

  const schema = readFileSync(schemaPath(), "utf8");
  db.exec(schema);

  return db;
}
