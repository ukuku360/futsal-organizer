import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "futsal.db");

function createDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      slug          TEXT    NOT NULL UNIQUE,
      captain_name  TEXT    NOT NULL,
      court_name    TEXT    NOT NULL,
      game_date     TEXT    NOT NULL,
      game_time     TEXT    NOT NULL,
      total_price   REAL    NOT NULL,
      receipt_path  TEXT,
      location      TEXT,
      notes         TEXT,
      pay_id        TEXT,
      bsb           TEXT,
      acc           TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS players (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id        INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      name              TEXT    NOT NULL,
      is_captain        INTEGER NOT NULL DEFAULT 0,
      has_paid          INTEGER NOT NULL DEFAULT 0,
      payment_confirmed INTEGER NOT NULL DEFAULT 0,
      details           TEXT,
      joined_at         TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(session_id, name)
    );
  `);

  // Migration: add details column if missing (for existing DBs)
  const playerCols = db.prepare("PRAGMA table_info(players)").all() as { name: string }[];
  if (!playerCols.some((c) => c.name === "details")) {
    db.exec("ALTER TABLE players ADD COLUMN details TEXT");
  }

  // Migration: add bank detail columns to sessions if missing
  const sessionCols = db.prepare("PRAGMA table_info(sessions)").all() as { name: string }[];
  if (!sessionCols.some((c) => c.name === "pay_id")) {
    db.exec("ALTER TABLE sessions ADD COLUMN pay_id TEXT");
  }
  if (!sessionCols.some((c) => c.name === "bsb")) {
    db.exec("ALTER TABLE sessions ADD COLUMN bsb TEXT");
  }
  if (!sessionCols.some((c) => c.name === "acc")) {
    db.exec("ALTER TABLE sessions ADD COLUMN acc TEXT");
  }

  return db;
}

// Cache on globalThis to survive HMR in development
const globalAny = globalThis as unknown as { __db?: Database.Database };

function getDb(): Database.Database {
  if (process.env.NODE_ENV === "production") {
    return createDb();
  }
  if (!globalAny.__db) {
    globalAny.__db = createDb();
  }
  return globalAny.__db;
}

const db = getDb();
export default db;

// Type helpers
export interface Session {
  id: number;
  slug: string;
  captain_name: string;
  court_name: string;
  game_date: string;
  game_time: string;
  total_price: number;
  receipt_path: string | null;
  location: string | null;
  notes: string | null;
  pay_id: string | null;
  bsb: string | null;
  acc: string | null;
  created_at: string;
}

export interface Player {
  id: number;
  session_id: number;
  name: string;
  is_captain: number;
  has_paid: number;
  payment_confirmed: number;
  details: string | null;
  joined_at: string;
}
