import { db, getLive, getPublished, publish as publishSnapshot, ItemRow, ProductWithItems } from "./db";
import { STATUSES, Status, CHART_START, DAY } from "./constants";

function now() {
  return new Date().toISOString();
}

// ---- reads -------------------------------------------------------------

export function roadmapForRole(role: "admin" | "customer"): {
  products: ProductWithItems[];
  published_at: string | null;
  dirty: boolean;
} {
  if (role === "admin") {
    return { products: getLive(), published_at: publishedAt(), dirty: isDirty() };
  }
  // customer: published snapshot, internal items stripped
  const { data, published_at } = getPublished();
  const products = data.map((p) => ({
    ...p,
    items: p.items.filter((it) => !it.internal),
  }));
  return { products, published_at, dirty: false };
}

function publishedAt(): string | null {
  const row = db().prepare("SELECT published_at FROM snapshots WHERE id=1").get() as
    | { published_at: string }
    | undefined;
  return row?.published_at ?? null;
}

// dirty = live changed after last publish (tracked via meta)
function isDirty(): boolean {
  const row = db().prepare("SELECT value FROM meta WHERE key='dirty'").get() as
    | { value: string }
    | undefined;
  return row?.value === "1";
}
function setDirty(v: boolean) {
  db()
    .prepare("INSERT INTO meta (key,value) VALUES ('dirty',@v) ON CONFLICT(key) DO UPDATE SET value=@v")
    .run({ v: v ? "1" : "0" });
}

export function getItem(id: string): ItemRow | undefined {
  return db().prepare("SELECT * FROM items WHERE id=?").get(id) as ItemRow | undefined;
}

// ---- changelog / history ----------------------------------------------

export function listChangelog(limit = 50) {
  return db()
    .prepare("SELECT * FROM changelog ORDER BY id DESC LIMIT ?")
    .all(limit);
}

function addChangelog(row: {
  item_id: string;
  product_id: string;
  kind: string;
  detail?: any;
  reason?: string | null;
  editor: string;
}) {
  db()
    .prepare(
      "INSERT INTO changelog (item_id,product_id,kind,detail,reason,editor,created_at) VALUES (@item_id,@product_id,@kind,@detail,@reason,@editor,@created_at)"
    )
    .run({
      item_id: row.item_id,
      product_id: row.product_id,
      kind: row.kind,
      detail: row.detail == null ? null : JSON.stringify(row.detail),
      reason: row.reason ?? null,
      editor: row.editor,
      created_at: now(),
    });
}

// history snapshot = state to restore back to. For a create we store a delete
// marker so undo removes the item.
function pushHistory(item_id: string, snapshot: any, editor: string) {
  db()
    .prepare(
      "INSERT INTO history (item_id,snapshot,editor,created_at) VALUES (@item_id,@snapshot,@editor,@created_at)"
    )
    .run({ item_id, snapshot: JSON.stringify(snapshot), editor, created_at: now() });
}

export function itemHistory(id: string) {
  return db()
    .prepare("SELECT id,item_id,snapshot,editor,created_at FROM history WHERE item_id=? ORDER BY id DESC LIMIT 50")
    .all(id);
}

// ---- writes ------------------------------------------------------------

const ITEM_FIELDS = [
  "product_id",
  "code",
  "phase",
  "phase_ja",
  "name",
  "name_ja",
  "note",
  "note_ja",
  "start",
  "len",
  "milestone",
  "status",
  "percent",
  "internal",
  "sort",
];

function normStatus(s: any): Status {
  return STATUSES.includes(s) ? s : "not_started";
}

export function createItem(input: any, editor: string): ItemRow {
  const d = db();
  const id: string = String(input.id || "it_" + Math.random().toString(36).slice(2, 9));
  const maxSort = d
    .prepare("SELECT COALESCE(MAX(sort),0)+1 s FROM items WHERE product_id=?")
    .get(input.product_id) as { s: number };
  const row = {
    id,
    product_id: String(input.product_id),
    code: input.code ?? null,
    phase: input.phase ?? null,
    phase_ja: input.phase_ja ?? null,
    name: String(input.name ?? ""),
    name_ja: String(input.name_ja ?? input.name ?? ""),
    note: input.note ?? null,
    note_ja: input.note_ja ?? null,
    start: Number(input.start ?? 0),
    len: Number(input.len ?? 7),
    milestone: input.milestone ? 1 : 0,
    status: normStatus(input.status),
    percent: Math.max(0, Math.min(100, Number(input.percent ?? 0))),
    internal: input.internal ? 1 : 0,
    sort: input.sort ?? maxSort.s,
    updated_at: now(),
  };
  d.prepare(
    `INSERT INTO items (id,product_id,code,phase,phase_ja,name,name_ja,note,note_ja,start,len,milestone,status,percent,internal,sort,updated_at)
     VALUES (@id,@product_id,@code,@phase,@phase_ja,@name,@name_ja,@note,@note_ja,@start,@len,@milestone,@status,@percent,@internal,@sort,@updated_at)`
  ).run(row);
  pushHistory(id, { __deleted: true, id }, editor);
  addChangelog({
    item_id: id,
    product_id: row.product_id,
    kind: "create",
    detail: { name: row.name },
    editor,
  });
  setDirty(true);
  return getItem(id)!;
}

export function updateItem(id: string, input: any, editor: string): ItemRow {
  const prev = getItem(id);
  if (!prev) {
    const e: any = new Error("not found");
    e.status = 404;
    throw e;
  }
  // require a reason when cancelling (like reschedule)
  const nextStatus = "status" in input && input.status !== undefined ? normStatus(input.status) : prev.status;
  if (nextStatus === "cancelled" && prev.status !== "cancelled" && !String(input.reason || "").trim()) {
    const e: any = new Error("Cần nhập lý do khi huỷ hạng mục");
    e.status = 400;
    throw e;
  }
  pushHistory(id, prev, editor);
  const next: any = { ...prev };
  for (const f of ITEM_FIELDS) {
    if (f in input && input[f] !== undefined) {
      if (f === "milestone" || f === "internal") next[f] = input[f] ? 1 : 0;
      else if (f === "status") next[f] = normStatus(input[f]);
      else if (f === "percent") next[f] = Math.max(0, Math.min(100, Number(input[f])));
      else if (f === "start" || f === "len" || f === "sort") next[f] = Number(input[f]);
      else next[f] = input[f];
    }
  }
  next.updated_at = now();
  db()
    .prepare(
      `UPDATE items SET product_id=@product_id,code=@code,phase=@phase,phase_ja=@phase_ja,name=@name,name_ja=@name_ja,note=@note,note_ja=@note_ja,start=@start,len=@len,milestone=@milestone,status=@status,percent=@percent,internal=@internal,sort=@sort,updated_at=@updated_at WHERE id=@id`
    )
    .run({ ...next, id });

  // record meaningful changelog entries
  if (prev.status !== next.status) {
    addChangelog({
      item_id: id,
      product_id: next.product_id,
      kind: "status",
      detail: { from: prev.status, to: next.status },
      reason: input.reason ?? null,
      editor,
    });
  }
  if (prev.start !== next.start || prev.len !== next.len) {
    addChangelog({
      item_id: id,
      product_id: next.product_id,
      kind: "reschedule",
      detail: {
        from: { start: prev.start, len: prev.len },
        to: { start: next.start, len: next.len },
      },
      reason: input.reason ?? null,
      editor,
    });
  }
  if (
    prev.status === next.status &&
    prev.start === next.start &&
    prev.len === next.len
  ) {
    addChangelog({
      item_id: id,
      product_id: next.product_id,
      kind: "edit",
      detail: { name: next.name },
      reason: input.reason ?? null,
      editor,
    });
  }
  setDirty(true);
  return getItem(id)!;
}

// mark done; if finished before planned end, trim bar to today ("hoàn thành sớm")
export function markDone(id: string, editor: string): ItemRow {
  const prev = getItem(id);
  if (!prev) {
    const e: any = new Error("not found");
    e.status = 404;
    throw e;
  }
  const today = Math.round((Date.now() - CHART_START.getTime()) / DAY);
  let len = prev.len;
  let early = 0;
  const plannedEnd = prev.start + prev.len;
  if (!prev.milestone && today > prev.start && today < plannedEnd) {
    len = today - prev.start;
    early = plannedEnd - today;
  }
  pushHistory(id, prev, editor);
  db()
    .prepare("UPDATE items SET status='done',percent=100,len=@len,updated_at=@u WHERE id=@id")
    .run({ len, u: now(), id });
  addChangelog({
    item_id: id,
    product_id: prev.product_id,
    kind: "status",
    detail: { from: prev.status, to: "done", early_days: early || undefined },
    reason: early > 0 ? `Hoàn thành sớm ${early} ngày` : null,
    editor,
  });
  setDirty(true);
  return getItem(id)!;
}

// drag reschedule (start/len only) with mandatory reason
export function rescheduleItem(id: string, start: number, len: number, reason: string, editor: string): ItemRow {
  return updateItem(id, { start, len, reason }, editor);
}

export function deleteItem(id: string, editor: string) {
  const prev = getItem(id);
  if (!prev) return;
  pushHistory(id, prev, editor);
  db().prepare("DELETE FROM items WHERE id=?").run(id);
  addChangelog({
    item_id: id,
    product_id: prev.product_id,
    kind: "delete",
    detail: { name: prev.name },
    editor,
  });
  setDirty(true);
}

// undo: pop most recent history row and restore it
export function undoLast(editor: string): { undone: boolean; item_id?: string } {
  const d = db();
  const h = d.prepare("SELECT * FROM history ORDER BY id DESC LIMIT 1").get() as
    | { id: number; item_id: string; snapshot: string }
    | undefined;
  if (!h) return { undone: false };
  const snap = JSON.parse(h.snapshot);
  if (snap.__deleted) {
    d.prepare("DELETE FROM items WHERE id=?").run(h.item_id);
  } else {
    // upsert snapshot back
    d.prepare(
      `INSERT INTO items (id,product_id,code,phase,phase_ja,name,name_ja,note,note_ja,start,len,milestone,status,percent,internal,sort,updated_at)
       VALUES (@id,@product_id,@code,@phase,@phase_ja,@name,@name_ja,@note,@note_ja,@start,@len,@milestone,@status,@percent,@internal,@sort,@updated_at)
       ON CONFLICT(id) DO UPDATE SET product_id=@product_id,code=@code,phase=@phase,phase_ja=@phase_ja,name=@name,name_ja=@name_ja,note=@note,note_ja=@note_ja,start=@start,len=@len,milestone=@milestone,status=@status,percent=@percent,internal=@internal,sort=@sort,updated_at=@updated_at`
    ).run({ ...snap, code: snap.code ?? null, updated_at: now() });
  }
  d.prepare("DELETE FROM history WHERE id=?").run(h.id);
  addChangelog({
    item_id: h.item_id,
    product_id: snap.product_id || "",
    kind: "undo",
    detail: null,
    editor,
  });
  setDirty(true);
  return { undone: true, item_id: h.item_id };
}

export function publish(editor: string) {
  const at = publishSnapshot(editor);
  setDirty(false);
  return at;
}
