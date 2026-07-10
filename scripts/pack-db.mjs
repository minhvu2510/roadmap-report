// Prepare data/roadmap.db for a read-only deploy.
//
// Locally the DB runs in WAL mode, so recent writes live in roadmap.db-wal.
// A read-only deploy ships only roadmap.db and cannot replay (or create) a WAL,
// so we fold the WAL back into the main file and drop the sidecars first.
//
//   npm run db:pack
//
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB = path.join(process.cwd(), "data", "roadmap.db");
if (!fs.existsSync(DB)) {
  console.error("Không thấy", DB);
  process.exit(1);
}

const d = new Database(DB);
const before = d.prepare("SELECT COUNT(*) c FROM items").get().c;
const pub = d.prepare("SELECT published_at FROM snapshots WHERE id=1").get();
const dirty = d.prepare("SELECT value FROM meta WHERE key='dirty'").get();

if (dirty?.value === "1") {
  console.error("\n⚠  DB đang dirty — có thay đổi chưa Publish.");
  console.error("   Khách hàng chỉ thấy snapshot đã publish. Bấm Publish trong app rồi chạy lại.\n");
  process.exit(1);
}

// The deploy reads this JSON, not the .db — a runtime-path .db is not reliably
// traced into the Vercel lambda, but a JSON import always is.
const snapRow = d.prepare("SELECT payload,published_at FROM snapshots WHERE id=1").get();
const snapshot = {
  products: JSON.parse(snapRow.payload),
  published_at: snapRow.published_at,
  changelog: d.prepare("SELECT * FROM changelog ORDER BY id DESC LIMIT 50").all(),
};
const JSON_PATH = path.join(process.cwd(), "data", "published.json");
fs.writeFileSync(JSON_PATH, JSON.stringify(snapshot, null, 1));
const jsonItems = snapshot.products.reduce((n, p) => n + p.items.length, 0);
console.log(`✓ published.json — ${jsonItems} items, ${snapshot.changelog.length} changelog`);

d.pragma("wal_checkpoint(TRUNCATE)");
d.pragma("journal_mode = DELETE"); // no WAL sidecars in the shipped file
d.close();

for (const ext of ["-wal", "-shm"]) {
  const f = DB + ext;
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log("đã xoá", path.basename(f));
  }
}

// verify it opens read-only, the way production will
const ro = new Database(DB, { readonly: true, fileMustExist: true });
const after = ro.prepare("SELECT COUNT(*) c FROM items").get().c;
ro.close();

if (after !== before) {
  console.error(`Sai lệch dữ liệu: ${before} → ${after} items`);
  process.exit(1);
}
console.log(`✓ roadmap.db sẵn sàng deploy — ${after} items, publish lúc ${pub?.published_at ?? "?"}`);
