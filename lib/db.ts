import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { SEED_PRODUCTS } from "./seed";
import { READ_ONLY } from "./env";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "roadmap.db");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  // Public deploys ship a prebuilt .db on a read-only filesystem: no WAL, no
  // migrate, no seed — any of those would try to write and throw.
  if (READ_ONLY) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    return _db;
  }
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  // Refuse to silently recreate a missing DB: better-sqlite3 happily creates an
  // empty file, and seedIfEmpty() would then overwrite the real roadmap with
  // demo seed data. If the file is gone, that is a mistake worth shouting about.
  if (!fs.existsSync(DB_PATH) && process.env.ROADMAP_SEED !== "1") {
    throw new Error(
      `Không thấy ${DB_PATH}. Nếu thực sự muốn tạo DB mới từ seed, chạy lại với ROADMAP_SEED=1.`
    );
  }
  const d = new Database(DB_PATH);
  d.pragma("journal_mode = WAL");
  migrate(d);
  seedIfEmpty(d);
  _db = d;
  return d;
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      tab TEXT NOT NULL,
      color TEXT NOT NULL,
      sort INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      phase TEXT,
      phase_ja TEXT,
      name TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      note TEXT,
      note_ja TEXT,
      start INTEGER NOT NULL,
      len INTEGER NOT NULL,
      milestone INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'not_started',
      percent INTEGER NOT NULL DEFAULT 0,
      internal INTEGER NOT NULL DEFAULT 0,
      sort INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS changelog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      detail TEXT,
      reason TEXT,
      editor TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL,
      snapshot TEXT NOT NULL,
      editor TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL,
      published_at TEXT NOT NULL,
      editor TEXT
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  // short human-readable code shown on the chart + detail table (e.g. MOSA-01)
  const cols = d.prepare("PRAGMA table_info(items)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "code")) {
    d.exec("ALTER TABLE items ADD COLUMN code TEXT");
  }
}

function seedIfEmpty(d: Database.Database) {
  const n = d.prepare("SELECT COUNT(*) c FROM products").get() as { c: number };
  if (n.c > 0) return;
  const insP = d.prepare(
    "INSERT INTO products (id,name,name_ja,tab,color,sort) VALUES (@id,@name,@name_ja,@tab,@color,@sort)"
  );
  const insI = d.prepare(`INSERT INTO items
    (id,product_id,phase,phase_ja,name,name_ja,note,note_ja,start,len,milestone,status,percent,internal,sort,updated_at)
    VALUES (@id,@product_id,@phase,@phase_ja,@name,@name_ja,@note,@note_ja,@start,@len,@milestone,@status,@percent,@internal,@sort,@updated_at)`);
  const now = new Date().toISOString();
  const tx = d.transaction(() => {
    SEED_PRODUCTS.forEach((p, pi) => {
      insP.run({ id: p.id, name: p.name, name_ja: p.name_ja, tab: p.tab, color: p.color, sort: pi });
      p.items.forEach((it, ii) => {
        insI.run({
          id: it.id,
          product_id: p.id,
          phase: it.phase ?? null,
          phase_ja: it.phase_ja ?? null,
          name: it.name,
          name_ja: it.name_ja,
          note: it.note ?? null,
          note_ja: it.note_ja ?? null,
          start: it.start,
          len: it.len,
          milestone: it.milestone ? 1 : 0,
          status: it.status ?? "not_started",
          percent: it.percent ?? 0,
          internal: it.internal ? 1 : 0,
          sort: ii,
          updated_at: now,
        });
      });
    });
    // initial published snapshot = seed (public items only handled at read time)
    d.prepare(
      "INSERT INTO snapshots (id,payload,published_at,editor) VALUES (1,@payload,@at,@editor)"
    ).run({ payload: JSON.stringify(buildLive(d)), at: now, editor: "system" });
  });
  tx();
}

export interface ItemRow {
  id: string;
  product_id: string;
  code: string | null;
  phase: string | null;
  phase_ja: string | null;
  name: string;
  name_ja: string;
  note: string | null;
  note_ja: string | null;
  start: number;
  len: number;
  milestone: number;
  status: string;
  percent: number;
  internal: number;
  sort: number;
  updated_at: string | null;
}
export interface ProductRow {
  id: string;
  name: string;
  name_ja: string;
  tab: string;
  color: string;
  sort: number;
}
export interface ProductWithItems extends ProductRow {
  items: ItemRow[];
}

// Live (draft) data — full working state.
export function buildLive(d: Database.Database): ProductWithItems[] {
  const prods = d.prepare("SELECT * FROM products ORDER BY sort, rowid").all() as ProductRow[];
  const itemStmt = d.prepare("SELECT * FROM items WHERE product_id=? ORDER BY sort, rowid");
  return prods.map((p) => ({ ...p, items: itemStmt.all(p.id) as ItemRow[] }));
}

export function getLive(): ProductWithItems[] {
  return buildLive(db());
}

// Published snapshot.
export function getPublished(): { data: ProductWithItems[]; published_at: string | null } {
  const row = db().prepare("SELECT payload,published_at FROM snapshots WHERE id=1").get() as
    | { payload: string; published_at: string }
    | undefined;
  if (!row) return { data: [], published_at: null };
  return { data: JSON.parse(row.payload), published_at: row.published_at };
}

export function publish(editor: string) {
  const now = new Date().toISOString();
  const payload = JSON.stringify(buildLive(db()));
  db()
    .prepare(
      "INSERT INTO snapshots (id,payload,published_at,editor) VALUES (1,@payload,@at,@editor) ON CONFLICT(id) DO UPDATE SET payload=@payload,published_at=@at,editor=@editor"
    )
    .run({ payload, at: now, editor });
  return now;
}
