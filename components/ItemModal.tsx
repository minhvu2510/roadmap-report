"use client";
import { useState } from "react";
import { CHART_START, DAY, CHART_DAYS, STATUSES, STATUS_LABEL, Status } from "@/lib/constants";
import type { Item, Product } from "./Roadmap";

function offToDate(off: number): string {
  const d = new Date(CHART_START.getTime() + off * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dateToOff(v: string): number {
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return Math.round((dt.getTime() - CHART_START.getTime()) / DAY);
}

export default function ItemModal({
  mode,
  item,
  productId,
  products,
  lang,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  item?: Item;
  productId: string;
  products: Product[];
  lang: "vi" | "ja";
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    product_id: item?.product_id || productId,
    name: item?.name || "",
    name_ja: item?.name_ja || "",
    code: item?.code || "",
    phase: item?.phase || "",
    phase_ja: item?.phase_ja || "",
    note: item?.note || "",
    note_ja: item?.note_ja || "",
    status: (item?.status || "not_started") as Status,
    percent: item?.percent ?? 0,
    start: item?.start ?? 0,
    weeks: item ? Math.max(0, Math.round(item.len / 7)) : 4,
    milestone: !!item?.milestone,
    internal: !!item?.internal,
    reason: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const L = lang === "ja";
  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  const cancelling = mode === "edit" && f.status === "cancelled" && item?.status !== "cancelled";

  async function save() {
    if (!f.name.trim()) {
      setErr(L ? "名称を入力" : "Nhập tên hạng mục");
      return;
    }
    if (cancelling && !f.reason.trim()) {
      setErr(L ? "中止する理由を入力してください" : "Cần nhập lý do khi huỷ hạng mục");
      return;
    }
    setBusy(true);
    setErr("");
    const payload = {
      product_id: f.product_id,
      name: f.name.trim(),
      name_ja: f.name_ja.trim() || f.name.trim(),
      code: f.code.trim().toUpperCase() || null,
      phase: f.phase.trim() || null,
      phase_ja: f.phase_ja.trim() || null,
      note: f.note.trim() || null,
      note_ja: f.note_ja.trim() || null,
      status: f.status,
      percent: Number(f.percent),
      start: Number(f.start),
      len: f.milestone ? 0 : Math.max(7, Number(f.weeks) * 7),
      milestone: f.milestone,
      internal: f.internal,
      reason: f.reason.trim() || undefined,
    };
    const url = mode === "create" ? "/api/items" : `/api/items/${item!.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const r = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || "Lỗi");
      return;
    }
    onSaved();
  }

  async function del() {
    if (!item) return;
    if (!confirm(L ? "この項目を削除しますか？" : "Xoá hạng mục này?")) return;
    setBusy(true);
    const r = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    setBusy(false);
    if (!r.ok) {
      setErr("Lỗi xoá");
      return;
    }
    onSaved();
  }

  return (
    <div className="modal-back" onClick={() => !busy && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {mode === "create"
            ? L
              ? "項目を追加"
              : "Thêm hạng mục"
            : L
            ? "項目を編集"
            : "Sửa hạng mục"}
        </h2>
        <p className="msub">{mode === "edit" ? item?.id : L ? "新規" : "Mới"}</p>

        <div className="field">
          <label>{L ? "プロダクト" : "Sản phẩm"}</label>
          <select value={f.product_id} onChange={(e) => set("product_id", e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {L ? p.name_ja || p.name : p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>{L ? "コード" : "Mã hạng mục"}</label>
          <input
            value={f.code}
            onChange={(e) => set("code", e.target.value)}
            placeholder={L ? "例: MOSA-01" : "vd: MOSA-01"}
          />
        </div>

        <div className="field row2">
          <div>
            <label>{L ? "名称 (VI)" : "Tên (VI)"}</label>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label>{L ? "名称 (JA)" : "Tên (JA)"}</label>
            <input value={f.name_ja} onChange={(e) => set("name_ja", e.target.value)} />
          </div>
        </div>

        <div className="field row2">
          <div>
            <label>{L ? "フェーズ (VI)" : "Giai đoạn (VI)"}</label>
            <input value={f.phase} onChange={(e) => set("phase", e.target.value)} placeholder={L ? "任意" : "tuỳ chọn"} />
          </div>
          <div>
            <label>{L ? "フェーズ (JA)" : "Giai đoạn (JA)"}</label>
            <input value={f.phase_ja} onChange={(e) => set("phase_ja", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="chk">
            <input type="checkbox" checked={f.milestone} onChange={(e) => set("milestone", e.target.checked)} />
            {L ? "マイルストーン (◆)" : "Cột mốc (◆)"}
          </label>
        </div>

        <div className="field row2">
          <div>
            <label>{L ? "開始日" : "Ngày bắt đầu"}</label>
            <input
              type="date"
              value={offToDate(f.start)}
              onChange={(e) => set("start", Math.max(0, Math.min(CHART_DAYS, dateToOff(e.target.value))))}
            />
          </div>
          {!f.milestone && (
            <div>
              <label>{L ? "期間 (週)" : "Thời lượng (tuần)"}</label>
              <input
                type="number"
                min={1}
                value={f.weeks}
                onChange={(e) => set("weeks", Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {!f.milestone && (
          <div className="field row2">
            <div>
              <label>{L ? "状態" : "Trạng thái"}</label>
              <select value={f.status} onChange={(e) => set("status", e.target.value as Status)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s][lang]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>{L ? "進捗 (%)" : "% hoàn thành"}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={f.percent}
                onChange={(e) => set("percent", Number(e.target.value))}
              />
            </div>
          </div>
        )}
        {f.milestone && (
          <div className="field">
            <label>{L ? "状態" : "Trạng thái"}</label>
            <select value={f.status} onChange={(e) => set("status", e.target.value as Status)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s][lang]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field row2">
          <div>
            <label>{L ? "メモ (VI)" : "Ghi chú (VI)"}</label>
            <textarea value={f.note} onChange={(e) => set("note", e.target.value)} />
          </div>
          <div>
            <label>{L ? "メモ (JA)" : "Ghi chú (JA)"}</label>
            <textarea value={f.note_ja} onChange={(e) => set("note_ja", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="chk">
            <input type="checkbox" checked={f.internal} onChange={(e) => set("internal", e.target.checked)} />
            {L ? "内部のみ (顧客に非表示)" : "Chỉ nội bộ (ẩn với khách hàng)"}
          </label>
        </div>

        {mode === "edit" && (
          <div className="field">
            <label style={cancelling ? { color: "#c0322f" } : undefined}>
              {cancelling
                ? L
                  ? "中止の理由 (必須)"
                  : "Lý do huỷ (bắt buộc)"
                : L
                ? "変更理由 (任意)"
                : "Lý do thay đổi (tuỳ chọn)"}
            </label>
            <input
              value={f.reason}
              onChange={(e) => set("reason", e.target.value)}
              style={cancelling && !f.reason.trim() ? { borderColor: "#e0413f" } : undefined}
              placeholder={cancelling ? (L ? "例: 顧客が要件を取り下げ" : "vd. Khách bỏ yêu cầu…") : ""}
            />
          </div>
        )}

        {err && <div className="err">{err}</div>}

        <div className="modal-actions">
          {mode === "edit" && (
            <button className="btn danger left" onClick={del} disabled={busy}>
              {L ? "削除" : "Xoá"}
            </button>
          )}
          <button className="btn" onClick={onClose} disabled={busy}>
            {L ? "キャンセル" : "Huỷ"}
          </button>
          <button className="btn primary" onClick={save} disabled={busy}>
            {busy ? "…" : L ? "保存" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
