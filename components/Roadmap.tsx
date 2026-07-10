"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CHART_START,
  CHART_DAYS,
  DAY,
  DAY_PX,
  Q_DAY_PX,
  SNAP,
  QUARTERS,
  MONTHS,
  CHART_END,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUSES,
  Status,
} from "@/lib/constants";
import ItemModal from "./ItemModal";
import MonthDetail from "./MonthDetail";

type Lang = "vi" | "ja";

export interface Item {
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
  status: Status;
  percent: number;
  internal: number;
  sort: number;
  updated_at: string | null;
}
export interface Product {
  id: string;
  name: string;
  name_ja: string;
  tab: string;
  color: string;
  items: Item[];
}
interface Changelog {
  id: number;
  item_id: string;
  product_id: string;
  kind: string;
  detail: string | null;
  reason: string | null;
  editor: string | null;
  created_at: string;
}
interface RoadmapData {
  role: "admin" | "customer";
  email: string;
  products: Product[];
  published_at: string | null;
  dirty: boolean;
  changelog: Changelog[];
}

const T = {
  vi: {
    kicker: "Engineering Roadmap · T7 2026 – T12 2028",
    h1: "Lộ trình phát triển sản phẩm",
    subAdmin:
      "Bạn là Admin — chỉnh trực tiếp trên Gantt (kéo để dời, kéo mép đổi thời lượng), sửa hạng mục, rồi Xuất bản để khách hàng thấy.",
    subCust:
      "Theo dõi tiến độ 4 sản phẩm. Tab Tổng thể xem toàn cảnh; mỗi tab sản phẩm mở 4 biểu đồ Gantt theo quý.",
    window: "01/07/2026 → 30/06/2027 · 12 tháng",
    overall: "Tổng thể",
    hintMove: "Kéo giữa để dời",
    hintResize: "↔ Kéo mép đổi thời lượng",
    hintMs: "Cột mốc",
    hintSnap: "Bám tuần",
    itemsWord: "hạng mục",
    quarterEmpty: "Không có hạng mục trong quý này.",
    month: (m: number) => "Thg" + m,
    today: "Hôm nay",
    draftBanner: "Bản dự kiến — ngày có thể thay đổi, không phải cam kết hợp đồng.",
    latest: "Cập nhật mới nhất",
    changelog: "Nhật ký thay đổi",
    noUpdates: "Chưa có cập nhật.",
    filterLabel: "Lọc trạng thái:",
    addItem: "+ Thêm hạng mục",
    publish: "Xuất bản",
    published: "Đã xuất bản",
    undo: "↺ Hoàn tác",
    logout: "Đăng xuất",
    dirtyNotice: "Có thay đổi chưa xuất bản — khách hàng vẫn thấy bản cũ cho tới khi bạn bấm Xuất bản.",
    reasonTitle: "Lý do dời lịch",
    reasonSub: "Ghi lý do để lưu vào changelog cho khách hàng.",
    reasonPh: "vd. Chờ Google verify, ưu tiên việc khác…",
    cancel: "Huỷ",
    confirm: "Lưu",
    corner: (p: boolean) => (p ? "Hạng mục" : "Sản phẩm"),
    newBadge: "MỚI",
    internalBadge: "NỘI BỘ",
    zoomHint: "Bấm để xem chi tiết theo tháng",
    zoomLabel: "chi tiết tháng",
    markDone: "Đánh dấu hoàn thành",
    editTip: "Sửa",
    kindLabel: (k: string) =>
      ({
        status: "Trạng thái",
        reschedule: "Dời lịch",
        create: "Thêm mới",
        delete: "Xoá",
        edit: "Sửa",
        undo: "Hoàn tác",
      } as any)[k] || k,
  },
  ja: {
    kicker: "エンジニアリング ロードマップ · 2026年7月〜2028年12月",
    h1: "製品開発ロードマップ",
    subAdmin:
      "管理者モード — ガント上で直接編集（ドラッグで移動・端で期間変更）、項目を編集し、公開すると顧客に反映されます。",
    subCust:
      "4プロダクトの進捗を確認。「全体」タブで俯瞰、各プロダクトタブで四半期別ガント4枚。",
    window: "2026/07/01 → 2027/06/30 · 12ヶ月",
    overall: "全体",
    hintMove: "中央をドラッグで移動",
    hintResize: "↔ 端で期間変更",
    hintMs: "マイルストーン",
    hintSnap: "週スナップ",
    itemsWord: "項目",
    quarterEmpty: "この四半期に項目はありません。",
    month: (m: number) => m + "月",
    today: "今日",
    draftBanner: "予定案 — 日付は変更される可能性があり、契約上の確約ではありません。",
    latest: "最新の更新",
    changelog: "変更履歴",
    noUpdates: "更新はまだありません。",
    filterLabel: "状態フィルタ:",
    addItem: "+ 項目を追加",
    publish: "公開",
    published: "公開済み",
    undo: "↺ 元に戻す",
    logout: "ログアウト",
    dirtyNotice: "未公開の変更があります — 公開するまで顧客には旧版が表示されます。",
    reasonTitle: "変更理由",
    reasonSub: "顧客向け変更履歴に保存する理由を記入してください。",
    reasonPh: "例: Google承認待ち、他タスク優先…",
    cancel: "キャンセル",
    confirm: "保存",
    corner: (p: boolean) => (p ? "項目" : "プロダクト"),
    newBadge: "NEW",
    internalBadge: "内部",
    zoomHint: "クリックして月別詳細を表示",
    zoomLabel: "月別詳細",
    markDone: "完了にする",
    editTip: "編集",
    kindLabel: (k: string) =>
      ({
        status: "状態",
        reschedule: "日程変更",
        create: "追加",
        delete: "削除",
        edit: "編集",
        undo: "取消",
      } as any)[k] || k,
  },
};

const timelineW = CHART_DAYS * DAY_PX;

export default function Roadmap({ role, email }: { role: "admin" | "customer"; email: string }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ja");
  const [view, setView] = useState<string>("overall");
  const [data, setData] = useState<RoadmapData | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<Status>>(new Set(STATUSES));
  // expanded phase cards in the detail list (collapsed by default)
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<null | { mode: "create" | "edit"; item?: Item; productId: string }>(null);
  const [reason, setReason] = useState<null | { item: Item; start: number; len: number }>(null);
  const [reasonText, setReasonText] = useState("");
  const [zoom, setZoom] = useState<null | { productId: string; qKey: string }>(null);
  const [busy, setBusy] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === "admin";

  // callbacks used by imperative renderer, via refs so closures stay fresh
  const openEditRef = useRef<(it: Item, p: Product) => void>(() => {});
  const askReasonRef = useRef<(it: Item, start: number, len: number) => void>(() => {});
  const openMonthRef = useRef<(pid: string, qKey: string) => void>(() => {});
  const doDoneRef = useRef<(it: Item) => void>(() => {});

  const t = T[lang];

  const load = useCallback(async () => {
    const r = await fetch("/api/roadmap", { cache: "no-store" });
    if (r.status === 401) {
      router.push("/login");
      return;
    }
    const j = await r.json();
    setData(j);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  openEditRef.current = (it, p) => setModal({ mode: "edit", item: it, productId: p.id });
  askReasonRef.current = (it, start, len) => {
    setReason({ item: it, start, len });
    setReasonText("");
  };
  openMonthRef.current = (productId, qKey) => setZoom({ productId, qKey });
  doDoneRef.current = async (it) => {
    setBusy(true);
    const r = await fetch(`/api/items/${it.id}/done`, { method: "POST" });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "Lỗi");
      return;
    }
    await load();
  };

  // ---------- imperative gantt render ----------
  useEffect(() => {
    if (!data) return;
    const track = trackRef.current!;
    const tip = tipRef.current!;
    const viewport = viewportRef.current!;
    const products = data.products;
    const editable = isAdmin;

    const labelW = () => (typeof window !== "undefined" && window.innerWidth <= 640 ? 160 : 250);

    function dateAt(off: number) {
      return new Date(CHART_START.getTime() + off * DAY);
    }
    function fmt(off: number) {
      const d = dateAt(off);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(2);
      return lang === "ja" ? `${yy}/${mm}/${dd}` : `${dd}/${mm}/${yy}`;
    }
    function esc(x: any) {
      return String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
    }
    function nm(it: Item) {
      return lang === "ja" ? it.name_ja || it.name : it.name;
    }
    function noteOf(it: Item) {
      return lang === "ja" ? it.note_ja || it.note : it.note;
    }
    function sName(p: Product) {
      return lang === "ja" ? p.name_ja || p.name : p.name;
    }
    function phName(it: Item) {
      return lang === "ja" ? it.phase_ja || it.phase : it.phase;
    }
    // "MOSA-01-02" -> "MOSA-01" (the phase it belongs to). Flat codes have no parent.
    function parentCode(it: Item): string | null {
      const parts = (it.code || "").split("-");
      return parts.length >= 3 ? parts.slice(0, -1).join("-") : null;
    }
    function clamp(v: number, a: number, b: number) {
      return Math.max(a, Math.min(b, v));
    }
    function snap(d: number) {
      return Math.round(d / SNAP) * SNAP;
    }
    function statusLabel(s: Status) {
      return STATUS_LABEL[s]?.[lang] || s;
    }
    function isNew(it: Item) {
      if (it.status !== "done" || !it.updated_at) return false;
      const diff = Date.now() - new Date(it.updated_at).getTime();
      return diff >= 0 && diff <= 14 * DAY;
    }

    const now = new Date();
    const nowOff = (now.getTime() - CHART_START.getTime()) / DAY;
    const months = MONTHS.map((m) => ({
      mnum: m.mnum,
      off: m.off,
      days: m.days,
      isNow: nowOff >= m.off && nowOff < m.off + m.days,
    }));
    const quartersScale = QUARTERS.map((q, i, arr) => {
      const e = arr[i + 1] ? arr[i + 1].startOff : CHART_DAYS;
      return { label: q.label, off: q.startOff, w: (e - q.startOff) * DAY_PX };
    });

    function lighten(hex: string, amt: number) {
      const { r, g, b } = toRgb(hex);
      return `rgb(${clamp(r + amt * 2, 0, 255)},${clamp(g + amt * 2, 0, 255)},${clamp(b + amt * 2, 0, 255)})`;
    }
    function hexA(hex: string, a: number) {
      const { r, g, b } = toRgb(hex);
      return `rgba(${r},${g},${b},${a})`;
    }
    function toRgb(hex: string) {
      hex = hex.replace("#", "");
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
    }
    function showTip(x: number, y: number, title: string, html: string) {
      tip.innerHTML = `<div class="tt">${esc(title)}</div><div class="td">${html}</div>`;
      tip.classList.add("show");
      positionTip(x, y);
    }
    function positionTip(x: number, y: number) {
      const w = tip.offsetWidth,
        h = tip.offsetHeight;
      let nx = x + 14,
        ny = y - h - 10;
      if (nx + w > window.innerWidth - 8) nx = x - w - 14;
      if (ny < 8) ny = y + 18;
      tip.style.left = nx + "px";
      tip.style.top = ny + "px";
    }
    function hideTip() {
      tip.classList.remove("show");
    }
    function tipDates(start: number, len: number, st?: Status) {
      const wk = Math.round(len / 7);
      const base =
        (lang === "ja" ? "開始" : "Bắt đầu") +
        ` <b>${fmt(start)}</b> · ` +
        (lang === "ja" ? "終了" : "Kết thúc") +
        ` <b>${fmt(start + len)}</b><br>` +
        (lang === "ja" ? "期間" : "Thời lượng") +
        ` <b>${wk} ${lang === "ja" ? "週間" : "tuần"}</b>`;
      return st ? base + `<br>${lang === "ja" ? "状態" : "Trạng thái"} <b>${statusLabel(st)}</b>` : base;
    }

    function hoverTip(el: HTMLElement, getInfo: () => { t: string; d: string }) {
      el.addEventListener("pointerenter", (e) => {
        if (el.classList.contains("dragging")) return;
        const i = getInfo();
        showTip(e.clientX, e.clientY, i.t, i.d);
      });
      el.addEventListener("pointermove", (e) => {
        if (el.classList.contains("dragging")) return;
        if (tip.classList.contains("show")) positionTip(e.clientX, e.clientY);
      });
      el.addEventListener("pointerleave", () => {
        if (!el.classList.contains("dragging")) hideTip();
      });
    }

    // drag on a task bar (product quarter view). onCommit(newStart,newLen).
    function attachTaskDrag(el: HTMLElement, it: Item, winStart: number, dayPx: number) {
      let curStart = it.start,
        curLen = it.len;
      el.addEventListener("pointerdown", (e) => {
        const target = e.target as HTMLElement;
        const isGrip = target.classList.contains("grip");
        const kind = isGrip ? (target.classList.contains("l") ? "resize-l" : "resize-r") : "move";
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        el.classList.add("dragging");
        const startX = e.clientX;
        const origStart = it.start,
          origLen = it.len;
        function mv(ev: PointerEvent) {
          const raw = snap((ev.clientX - startX) / dayPx);
          let ns = origStart,
            nl = origLen;
          if (kind === "move") ns = clamp(origStart + raw, 0, CHART_DAYS - origLen);
          else if (kind === "resize-r") nl = clamp(origLen + raw, SNAP, CHART_DAYS - origStart);
          else {
            ns = clamp(origStart + raw, 0, origStart + origLen - SNAP);
            nl = origLen - (ns - origStart);
          }
          curStart = ns;
          curLen = nl;
          el.style.left = (ns - winStart) * dayPx + "px";
          el.style.width = nl * dayPx + "px";
          showTip(ev.clientX, ev.clientY, nm(it), tipDates(ns, nl, it.status));
        }
        function up() {
          el.releasePointerCapture(e.pointerId);
          el.classList.remove("dragging");
          el.removeEventListener("pointermove", mv as any);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
          hideTip();
          if (curStart !== origStart || curLen !== origLen) {
            askReasonRef.current(it, curStart, curLen);
          }
        }
        el.addEventListener("pointermove", mv as any);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      });
      hoverTip(el, () => {
        const n = noteOf(it);
        return {
          t: nm(it),
          d: tipDates(it.start, it.len, it.status) + (n ? `<br><span style="color:#a9adc9">${esc(n)}</span>` : ""),
        };
      });
    }
    function attachMsDrag(el: HTMLElement, it: Item, winStart: number, dayPx: number, lbl: HTMLElement) {
      let curStart = it.start;
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        el.classList.add("dragging");
        const startX = e.clientX;
        const origStart = it.start;
        function mv(ev: PointerEvent) {
          const raw = snap((ev.clientX - startX) / dayPx);
          const ns = clamp(origStart + raw, 0, CHART_DAYS);
          curStart = ns;
          el.style.left = (ns - winStart) * dayPx + "px";
          lbl.style.left = (ns - winStart) * dayPx + 13 + "px";
          showTip(ev.clientX, ev.clientY, "◆ " + nm(it), `<b>${fmt(ns)}</b>`);
        }
        function up() {
          el.releasePointerCapture(e.pointerId);
          el.classList.remove("dragging");
          el.removeEventListener("pointermove", mv as any);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
          hideTip();
          if (curStart !== origStart) askReasonRef.current(it, curStart, 0);
        }
        el.addEventListener("pointermove", mv as any);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      });
      hoverTip(el, () => ({ t: "◆ " + nm(it), d: `<b>${fmt(it.start)}</b>` }));
    }

    function solSpan(p: Product) {
      let mn = Infinity,
        mx = -Infinity;
      p.items.forEach((it) => {
        mn = Math.min(mn, it.start);
        mx = Math.max(mx, it.start + it.len);
      });
      if (!isFinite(mn)) {
        mn = 0;
        mx = 0;
      }
      return { start: mn, len: mx - mn };
    }
    function passFilter(it: Item) {
      return statusFilter.has(it.status);
    }

    // ---- overall ----
    function buildScale() {
      const scale = document.createElement("div");
      scale.className = "scale";
      const corner = document.createElement("div");
      corner.className = "corner";
      corner.textContent = t.corner(false);
      scale.appendChild(corner);
      const strip = document.createElement("div");
      strip.className = "strip";
      strip.style.width = timelineW + "px";
      const qrow = document.createElement("div");
      qrow.className = "qrow";
      quartersScale.forEach((q, i) => {
        const c = document.createElement("div");
        c.className = "qcell" + (i % 2 ? " q-alt" : "");
        c.style.width = q.w + "px";
        c.textContent = q.label;
        qrow.appendChild(c);
      });
      const mrow = document.createElement("div");
      mrow.className = "mrow";
      months.forEach((m) => {
        const c = document.createElement("div");
        c.className = "mcell" + (m.isNow ? " now" : "");
        c.style.width = m.days * DAY_PX + "px";
        c.textContent = t.month(m.mnum);
        mrow.appendChild(c);
      });
      strip.appendChild(qrow);
      strip.appendChild(mrow);
      scale.appendChild(strip);
      return scale;
    }
    function renderOverall() {
      track.classList.remove("product");
      track.style.width = "";
      track.appendChild(buildScale());
      const grid = document.createElement("div");
      grid.className = "grid";
      months.forEach((m) => {
        const v = document.createElement("div");
        v.className = "vline";
        v.style.left = labelW() + m.off * DAY_PX + "px";
        grid.appendChild(v);
      });
      quartersScale.forEach((q) => {
        const v = document.createElement("div");
        v.className = "vline q";
        v.style.left = labelW() + q.off * DAY_PX + "px";
        grid.appendChild(v);
      });
      if (nowOff >= 0 && nowOff <= CHART_DAYS) {
        const tl = document.createElement("div");
        tl.className = "todayline";
        tl.style.left = labelW() + nowOff * DAY_PX + "px";
        const l = document.createElement("span");
        l.className = "lbl";
        l.textContent = t.today;
        tl.appendChild(l);
        grid.appendChild(tl);
      }
      products.forEach((p) => {
        if (hidden.has(p.id)) return;
        const span = solSpan(p);
        const row = document.createElement("div");
        row.className = "row";
        const label = document.createElement("div");
        label.className = "rlabel";
        label.innerHTML = `<span class="tick" style="background:${p.color}"></span><span class="rname">${esc(
          sName(p)
        )}<small>${fmt(span.start)} – ${fmt(span.start + span.len)}</small></span>`;
        row.appendChild(label);
        const lane = document.createElement("div");
        lane.className = "lane";
        lane.style.minWidth = timelineW + "px";
        const bar = document.createElement("div");
        bar.className = "bar overall readonly";
        bar.style.background = `linear-gradient(180deg,${lighten(p.color, 10)},${p.color})`;
        bar.style.left = span.start * DAY_PX + "px";
        bar.style.width = Math.max(span.len * DAY_PX, 10) + "px";
        bar.innerHTML = `<span class="bl">${esc(sName(p))}</span>`;
        hoverTip(bar, () => ({ t: sName(p), d: tipDates(span.start, span.len) }));
        lane.appendChild(bar);
        p.items
          .filter((it) => it.milestone)
          .forEach((it) => {
            const ms = document.createElement("div");
            ms.className = "ms readonly";
            ms.style.background = STATUS_COLOR[it.status];
            ms.style.left = it.start * DAY_PX + "px";
            const lbl = document.createElement("div");
            lbl.className = "ms-label";
            lbl.style.left = it.start * DAY_PX + 13 + "px";
            lbl.textContent = nm(it);
            hoverTip(ms, () => ({ t: "◆ " + nm(it), d: `<b>${fmt(it.start)}</b>` }));
            lane.appendChild(ms);
            lane.appendChild(lbl);
          });
        row.appendChild(lane);
        grid.appendChild(row);
      });
      track.appendChild(grid);
    }

    // ---- product (4 quarter panels) ----
    function inQuarter(it: Item, q: { startOff: number; endOff: number }) {
      if (it.milestone) return it.start >= q.startOff && it.start < q.endOff;
      return it.start < q.endOff && it.start + it.len > q.startOff;
    }
    function renderProduct(pid: string) {
      track.classList.add("product");
      track.style.width = "100%";
      const p = products.find((x) => x.id === pid);
      if (!p) return;
      const wrap = document.createElement("div");
      wrap.className = "qpanels";
      // only quarters that contain at least one (filter-passing) item, keep chart short
      const qs = QUARTERS.filter((q) => p.items.some((it) => inQuarter(it, q) && passFilter(it)));
      if (qs.length === 0) {
        const e = document.createElement("div");
        e.className = "qempty";
        e.style.padding = "24px 16px";
        e.textContent = t.quarterEmpty;
        wrap.appendChild(e);
      }
      qs.forEach((q) => wrap.appendChild(buildQuarterPanel(p, q)));
      track.appendChild(wrap);
    }
    function buildQuarterPanel(p: Product, q: { key: string; label: string; startOff: number; endOff: number }) {
      const qStart = q.startOff,
        qEnd = q.endOff,
        qDays = qEnd - qStart,
        qW = qDays * Q_DAY_PX,
        lw = labelW();
      const inc = p.items.filter((it) => inQuarter(it, q) && passFilter(it));
      const nItems = inc.filter((it) => !it.milestone).length;

      const panel = document.createElement("div");
      panel.className = "qpanel";
      const head = document.createElement("div");
      head.className = "qpanel-head clickable";
      head.title = t.zoomHint;
      head.innerHTML =
        `<div class="qh-title"><span class="qbadge" style="background:${p.color}">${q.label}</span> ${esc(sName(p))} <span class="zoom-ic">🔍 ${esc(t.zoomLabel)}</span></div>` +
        `<div class="qh-meta">${nItems} ${t.itemsWord} · ${fmt(qStart)} – ${fmt(qEnd - 1)}</div>`;
      head.addEventListener("click", () => openMonthRef.current(p.id, q.key));
      panel.appendChild(head);

      const body = document.createElement("div");
      body.className = "qpanel-body";
      const qtrack = document.createElement("div");
      qtrack.className = "qtrack";

      const scale = document.createElement("div");
      scale.className = "scale";
      const corner = document.createElement("div");
      corner.className = "corner";
      corner.textContent = t.corner(true);
      scale.appendChild(corner);
      const strip = document.createElement("div");
      strip.className = "strip";
      strip.style.width = qW + "px";
      const mrow = document.createElement("div");
      mrow.className = "mrow";
      months
        .filter((m) => m.off >= qStart && m.off < qEnd)
        .forEach((m) => {
          const c = document.createElement("div");
          c.className = "mcell" + (m.isNow ? " now" : "");
          c.style.width = m.days * Q_DAY_PX + "px";
          c.textContent = t.month(m.mnum);
          mrow.appendChild(c);
        });
      strip.appendChild(mrow);
      scale.appendChild(strip);
      qtrack.appendChild(scale);

      const grid = document.createElement("div");
      grid.className = "grid";
      for (let d = qStart; d <= qEnd; d += 7) {
        const v = document.createElement("div");
        v.className = "vline wk";
        v.style.left = lw + (d - qStart) * Q_DAY_PX + "px";
        grid.appendChild(v);
      }
      months
        .filter((m) => m.off > qStart && m.off < qEnd)
        .forEach((m) => {
          const v = document.createElement("div");
          v.className = "vline q";
          v.style.left = lw + (m.off - qStart) * Q_DAY_PX + "px";
          grid.appendChild(v);
        });
      if (nowOff >= qStart && nowOff < qEnd) {
        const tl = document.createElement("div");
        tl.className = "todayline";
        tl.style.left = lw + (nowOff - qStart) * Q_DAY_PX + "px";
        const l = document.createElement("span");
        l.className = "lbl";
        l.textContent = t.today;
        tl.appendChild(l);
        grid.appendChild(tl);
      }

      if (inc.length === 0) {
        const e = document.createElement("div");
        e.className = "qempty";
        e.textContent = t.quarterEmpty;
        grid.appendChild(e);
      } else {
        let lastPhase: string | null = null;
        inc.forEach((it) => {
          if (it.phase && it.phase !== lastPhase) {
            lastPhase = it.phase;
            const ph = document.createElement("div");
            ph.className = "phasehead";
            ph.style.width = lw + qW + "px";
            const pc = parentCode(it);
            ph.innerHTML =
              `<span class="pname"><span class="pdot" style="background:${p.color}"></span>` +
              (pc ? `<span class="pcode">${esc(pc)}</span>` : "") +
              `${esc(phName(it))}</span>`;
            grid.appendChild(ph);
          }
          const row = document.createElement("div");
          row.className = "row";
          const label = document.createElement("div");
          label.className = "rlabel sub" + (it.status === "cancelled" ? " cancelled" : "");
          const stColor = STATUS_COLOR[it.status];
          const icon = it.milestone ? "◆ " : "";
          const badges =
            (isNew(it) ? `<span class="badge-new">${t.newBadge}</span>` : "") +
            (isAdmin && it.internal ? `<span class="badge-int">${t.internalBadge}</span>` : "");
          const doneIc =
            editable && !it.milestone && it.status !== "done"
              ? `<span class="done-ic" title="${esc(t.markDone)}">✓</span>`
              : "";
          const editIc = editable ? `<span class="edit-ic" title="${esc(t.editTip)}">✎</span>` : "";
          label.innerHTML =
            `<span class="stdot" style="background:${stColor}" title="${esc(statusLabel(it.status))}"></span>` +
            (it.code ? `<span class="rcode">${esc(it.code)}</span>` : "") +
            `<span class="rname">${icon}${esc(nm(it))}</span>${badges}${doneIc}${editIc}`;
          if (editable) {
            const eic = label.querySelector(".edit-ic") as HTMLElement;
            eic.addEventListener("click", (ev) => {
              ev.stopPropagation();
              openEditRef.current(it, p);
            });
            const dic = label.querySelector(".done-ic") as HTMLElement | null;
            if (dic)
              dic.addEventListener("click", (ev) => {
                ev.stopPropagation();
                doDoneRef.current(it);
              });
          }
          row.appendChild(label);
          const lane = document.createElement("div");
          lane.className = "lane";
          lane.style.minWidth = qW + "px";
          const canc = it.status === "cancelled" ? " cancelled" : "";
          if (it.milestone) {
            const ms = document.createElement("div");
            ms.className = "ms" + (editable ? "" : " readonly") + canc;
            ms.style.background = stColor;
            ms.style.left = (it.start - qStart) * Q_DAY_PX + "px";
            const lbl = document.createElement("div");
            lbl.className = "ms-label";
            lbl.style.left = (it.start - qStart) * Q_DAY_PX + 13 + "px";
            lbl.textContent = nm(it);
            lane.appendChild(ms);
            lane.appendChild(lbl);
            if (editable) attachMsDrag(ms, it, qStart, Q_DAY_PX, lbl);
            else hoverTip(ms, () => ({ t: "◆ " + nm(it), d: `<b>${fmt(it.start)}</b>` }));
          } else {
            const bar = document.createElement("div");
            bar.className = "bar" + (editable ? "" : " readonly") + canc;
            bar.style.background = `linear-gradient(180deg,${lighten(stColor, 12)},${stColor})`;
            bar.style.left = (it.start - qStart) * Q_DAY_PX + "px";
            bar.style.width = it.len * Q_DAY_PX + "px";
            const fillW = Math.max(0, Math.min(100, it.percent));
            bar.innerHTML =
              (editable ? `<span class="grip l"></span>` : "") +
              `<span class="fill" style="width:${fillW}%"></span>` +
              `<span class="bl">${it.code ? esc(it.code) + " · " : ""}${esc(nm(it))}</span><span class="pct">${it.percent}%</span>` +
              (editable ? `<span class="grip r"></span>` : "");
            lane.appendChild(bar);
            if (editable) attachTaskDrag(bar, it, qStart, Q_DAY_PX);
            else
              hoverTip(bar, () => {
                const n = noteOf(it);
                return {
                  t: nm(it),
                  d: tipDates(it.start, it.len, it.status) + (n ? `<br><span style="color:#a9adc9">${esc(n)}</span>` : ""),
                };
              });
          }
          row.appendChild(lane);
          grid.appendChild(row);
        });
      }
      qtrack.appendChild(grid);
      body.appendChild(qtrack);
      panel.appendChild(body);
      return panel;
    }

    // render
    track.innerHTML = "";
    const st = viewport.scrollTop;
    if (view === "overall") renderOverall();
    else renderProduct(view);
    viewport.scrollTop = st;
  }, [data, lang, view, hidden, statusFilter, isAdmin, t]);

  // ---------- actions ----------
  async function submitReschedule() {
    if (!reason) return;
    if (!reasonText.trim()) return;
    setBusy(true);
    const r = await fetch(`/api/items/${reason.item.id}/reschedule`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ start: reason.start, len: reason.len, reason: reasonText.trim() }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "Lỗi");
    }
    setReason(null);
    await load();
  }

  async function doPublish() {
    setBusy(true);
    await fetch("/api/publish", { method: "POST" });
    setBusy(false);
    await load();
  }
  async function doUndo() {
    setBusy(true);
    const r = await fetch("/api/undo", { method: "POST" });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "Không có gì để hoàn tác");
      return;
    }
    await load();
  }
  async function doLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function toggleHidden(id: string) {
    setHidden((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleStatus(s: Status) {
    setStatusFilter((prev) => {
      const n = new Set(prev);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  }

  if (!data) {
    return (
      <div className="wrap" style={{ padding: "60px 0", color: "var(--ink-3)" }}>
        Đang tải…
      </div>
    );
  }

  const sName = (p: Product) => (lang === "ja" ? p.name_ja || p.name : p.name);
  const pad = (n: number) => String(n).padStart(2, "0");
  const endDisp = new Date(CHART_END.getTime() - DAY);
  const windowLabel =
    lang === "ja"
      ? `${CHART_START.getFullYear()}/${pad(CHART_START.getMonth() + 1)}/01 → ${endDisp.getFullYear()}/${pad(
          endDisp.getMonth() + 1
        )}/${pad(endDisp.getDate())} · ${MONTHS.length}ヶ月`
      : `01/${pad(CHART_START.getMonth() + 1)}/${CHART_START.getFullYear()} → ${pad(endDisp.getDate())}/${pad(
          endDisp.getMonth() + 1
        )}/${endDisp.getFullYear()} · ${MONTHS.length} tháng`;
  const parsedLog = data.changelog.map((c) => ({ ...c, d: c.detail ? JSON.parse(c.detail) : null }));
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(
      d.getHours()
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const itemName = (id: string) => {
    for (const p of data.products) {
      const it = p.items.find((x) => x.id === id);
      if (it) return lang === "ja" ? it.name_ja || it.name : it.name;
    }
    return id;
  };
  const off2date = (off: number) => {
    const d = new Date(CHART_START.getTime() + off * DAY);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  // full date incl. year — the roadmap window spans 2026→2028
  const off2full = (off: number) => {
    const d = new Date(CHART_START.getTime() + off * DAY);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return lang === "ja" ? `${d.getFullYear()}/${mm}/${dd}` : `${dd}/${mm}/${d.getFullYear()}`;
  };
  // "MOSA-01-02" -> "MOSA-01"; flat codes have no parent
  const parentOf = (code: string | null) => {
    const parts = (code || "").split("-");
    return parts.length >= 3 ? parts.slice(0, -1).join("-") : null;
  };
  // products shown in the detail list: respects tab, legend and status filter
  const detailProducts = (
    view === "overall" ? data.products.filter((p) => !hidden.has(p.id)) : data.products.filter((p) => p.id === view)
  )
    .map((p) => ({ ...p, items: p.items.filter((it) => statusFilter.has(it.status)) }))
    .filter((p) => p.items.length > 0);

  // one collapsible card per phase; items without a phase fall into a single "other" card
  interface Group {
    key: string;
    code: string | null;
    title: string;
    start: number;
    end: number;
    items: Item[];
  }
  // group progress = average of sub-task percents weighted by duration (milestones have len 0)
  const groupPercent = (items: Item[]) => {
    const total = items.reduce((n, i) => n + Math.max(i.len, 1), 0);
    if (!total) return 0;
    return Math.round(items.reduce((n, i) => n + i.percent * Math.max(i.len, 1), 0) / total);
  };
  const groupsOf = (p: Product & { items: Item[] }): Group[] => {
    const out: Group[] = [];
    const byKey = new Map<string, Group>();
    for (const it of p.items) {
      const phase = (lang === "ja" ? it.phase_ja || it.phase : it.phase) || null;
      const key = `${p.id}::${it.phase ?? "__none"}`;
      let g = byKey.get(key);
      if (!g) {
        g = {
          key,
          code: parentOf(it.code),
          title: phase || (lang === "ja" ? "その他" : "Khác"),
          start: it.start,
          end: it.start + it.len,
          items: [],
        };
        byKey.set(key, g);
        out.push(g);
      }
      g.items.push(it);
      g.start = Math.min(g.start, it.start);
      g.end = Math.max(g.end, it.start + it.len);
    }
    return out;
  };
  const detailGroups = detailProducts.flatMap(groupsOf);
  const allExpanded = detailGroups.length > 0 && detailGroups.every((g) => expanded.has(g.key));
  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }
  function toggleAllGroups() {
    setExpanded(allExpanded ? new Set() : new Set(detailGroups.map((g) => g.key)));
  }

  function logLine(c: any): string {
    if (c.kind === "reschedule" && c.d)
      return `${off2date(c.d.from.start)} → ${off2date(c.d.to.start)}`;
    if (c.kind === "status" && c.d)
      return `${STATUS_LABEL[c.d.from as Status]?.[lang] || c.d.from} → ${STATUS_LABEL[c.d.to as Status]?.[lang] || c.d.to}`;
    if (c.kind === "create") return t.kindLabel("create");
    if (c.kind === "delete") return t.kindLabel("delete");
    if (c.kind === "undo") return t.kindLabel("undo");
    return t.kindLabel("edit");
  }

  return (
    <div className="wrap">
      <header className="page">
        <div className="titles">
          <p className="kicker">
            <span className="dot" /> {t.kicker}
          </p>
          <h1>{t.h1}</h1>
          <p className="sub">{isAdmin ? t.subAdmin : t.subCust}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div className="window-pill">{windowLabel}</div>
          <div className="rolebar">
            <span className={`pill ${role}`}>{role === "admin" ? "Admin" : lang === "ja" ? "閲覧" : "Khách hàng"}</span>
            <span className="who">{email}</span>
            <button className="btn" onClick={doLogout}>
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {isAdmin && data.dirty && (
        <div className="notice blue">
          <span className="ico">●</span>
          {t.dirtyNotice}
        </div>
      )}

      <div className="toolbar">
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={view === "overall"} onClick={() => setView("overall")}>
            {t.overall}
          </button>
          {data.products.map((p) => (
            <button key={p.id} role="tab" aria-selected={view === p.id} onClick={() => setView(p.id)}>
              {p.tab}
            </button>
          ))}
        </div>
        <div className="seg lang">
          <button aria-selected={lang === "vi"} onClick={() => setLang("vi")}>
            VI
          </button>
          <button aria-selected={lang === "ja"} onClick={() => setLang("ja")}>
            日本語
          </button>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
            <button
              className="btn"
              onClick={() =>
                setModal({ mode: "create", productId: view === "overall" ? data.products[0].id : view })
              }
            >
              {t.addItem}
            </button>
            <button className="btn" onClick={doUndo} disabled={busy}>
              {t.undo}
            </button>
            <button className="btn accent" onClick={doPublish} disabled={busy || !data.dirty}>
              {data.dirty ? t.publish : t.published}
            </button>
          </div>
        )}
        {!isAdmin && (
          <div className="hint">
            <span>{t.hintMs}: ◆</span>
          </div>
        )}
      </div>

      {/* status filter */}
      <div className="filters">
        <span className="flabel">{t.filterLabel}</span>
        {STATUSES.map((s) => (
          <button key={s} className={"chip" + (statusFilter.has(s) ? "" : " off")} onClick={() => toggleStatus(s)}>
            <span className="sw" style={{ background: STATUS_COLOR[s] }} />
            {STATUS_LABEL[s][lang]}
          </button>
        ))}
      </div>

      {/* legend (overall only) */}
      {view === "overall" && (
        <div className="legend">
          {data.products.map((p) => (
            <button key={p.id} className={hidden.has(p.id) ? "off" : ""} onClick={() => toggleHidden(p.id)}>
              <span className="sw" style={{ background: p.color }} />
              {sName(p)}
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <div className="viewport" ref={viewportRef}>
          <div className="track" ref={trackRef} />
        </div>
      </div>

      {/* detail list — collapsed parent tasks, click to reveal sub-tasks */}
      <div className="details">
        <h3>
          {lang === "ja" ? "項目詳細" : "Chi tiết hạng mục"}{" "}
          <span className="cnt">{detailProducts.reduce((n, p) => n + p.items.length, 0)}</span>
          {detailGroups.length > 0 && (
            <button className="dtoggle-all" onClick={toggleAllGroups}>
              {allExpanded
                ? lang === "ja"
                  ? "すべて閉じる"
                  : "Thu gọn tất cả"
                : lang === "ja"
                ? "すべて展開"
                : "Mở rộng tất cả"}
            </button>
          )}
        </h3>
        {detailProducts.length === 0 && (
          <div className="empty">{lang === "ja" ? "該当なし" : "Không có hạng mục nào"}</div>
        )}
        {detailProducts.map((p) => (
          <div className="dgroup" key={p.id}>
            <div className="dhead">
              <span className="sw" style={{ background: p.color }} />
              {lang === "ja" ? p.name_ja || p.name : p.name}
            </div>
            {groupsOf(p).map((g) => {
              const open = expanded.has(g.key);
              const doneN = g.items.filter((i) => i.status === "done").length;
              const gp = groupPercent(g.items);
              return (
                <div className={"dcard" + (open ? " open" : "")} key={g.key}>
                  <button className="drow parent" onClick={() => toggleGroup(g.key)} aria-expanded={open}>
                    <span className="chev">{open ? "▾" : "▸"}</span>
                    {g.code && <span className="tcode big">{g.code}</span>}
                    <span className="dtitle">{g.title}</span>
                    <span className="dmeta">
                      <span className="pwrap">
                        <span className="pbar">
                          <span className="pfill" style={{ width: `${gp}%`, background: p.color }} />
                        </span>
                        <span className="ppct">{gp}%</span>
                      </span>
                      <span className="tdate">
                        {off2full(g.start)} → {off2full(g.end)}
                      </span>
                      <span className="dcount">
                        {doneN}/{g.items.length} {lang === "ja" ? "完了" : "xong"}
                      </span>
                    </span>
                  </button>

                  {open && (
                    <div className="dsubs">
                      {g.items.map((it) => (
                        <div className={"dsub" + (it.status === "cancelled" ? " cancelled" : "")} key={it.id}>
                          <div className="dsub-top">
                            <span className="tcode">{it.code || "—"}</span>
                            <span className="tname">
                              {it.milestone ? "◆ " : ""}
                              {lang === "ja" ? it.name_ja || it.name : it.name}
                            </span>
                            <span
                              className="tst"
                              style={{
                                background: STATUS_COLOR[it.status] + "22",
                                color: STATUS_COLOR[it.status],
                              }}
                            >
                              {STATUS_LABEL[it.status][lang]}
                            </span>
                            <span className="tdate">
                              {it.milestone
                                ? off2full(it.start)
                                : `${off2full(it.start)} → ${off2full(it.start + it.len)}`}
                            </span>
                            {!it.milestone && (
                              <span className="pwrap sub">
                                <span className="pbar">
                                  <span
                                    className="pfill"
                                    style={{
                                      width: `${Math.max(0, Math.min(100, it.percent))}%`,
                                      background: STATUS_COLOR[it.status],
                                    }}
                                  />
                                </span>
                                <span className="ppct">{it.percent}%</span>
                              </span>
                            )}
                          </div>
                          <div className="tnote">
                            {(lang === "ja" ? it.note_ja || it.note : it.note) || (
                              <span className="muted">{lang === "ja" ? "説明なし" : "Chưa có mô tả"}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* latest updates + changelog */}
      <div className="panels" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>
            {t.latest} <span className="cnt">7d</span>
          </h3>
          <div className="feed">
            {parsedLog.filter((c) => Date.now() - new Date(c.created_at).getTime() <= 7 * DAY).length === 0 && (
              <div className="empty">{t.noUpdates}</div>
            )}
            {parsedLog
              .filter((c) => Date.now() - new Date(c.created_at).getTime() <= 7 * DAY)
              .slice(0, 12)
              .map((c) => (
                <div className="fitem" key={c.id}>
                  <span className={"k " + c.kind}>{t.kindLabel(c.kind)}</span>
                  <div className="body">
                    <div className="nm">{itemName(c.item_id)}</div>
                    <div className="dt">
                      {logLine(c)} · {fmtDate(c.created_at)}
                    </div>
                    {c.reason && <div className="rs">“{c.reason}”</div>}
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="panel">
          <h3>
            {t.changelog} <span className="cnt">{parsedLog.length}</span>
          </h3>
          <div className="feed">
            {parsedLog.length === 0 && <div className="empty">{t.noUpdates}</div>}
            {parsedLog.slice(0, 30).map((c) => (
              <div className="fitem" key={c.id}>
                <span className={"k " + c.kind}>{t.kindLabel(c.kind)}</span>
                <div className="body">
                  <div className="nm">{itemName(c.item_id)}</div>
                  <div className="dt">
                    {logLine(c)} · {fmtDate(c.created_at)}
                    {c.editor ? " · " + c.editor : ""}
                  </div>
                  {c.reason && <div className="rs">“{c.reason}”</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="foot">
        <span>
          {isAdmin
            ? lang === "ja"
              ? "管理者 — ライブ (下書き)"
              : "Admin — dữ liệu live (nháp)"
            : lang === "ja"
            ? "顧客 — 公開版"
            : "Khách hàng — bản đã xuất bản"}
        </span>
        <span className="sep">·</span>
        <span>
          {data.published_at
            ? (lang === "ja" ? "公開: " : "Xuất bản: ") + fmtDate(data.published_at)
            : "—"}
        </span>
      </footer>

      <div className="tip" ref={tipRef} />

      {/* reschedule reason modal */}
      {reason && (
        <div className="modal-back" onClick={() => !busy && setReason(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <h2>{t.reasonTitle}</h2>
            <p className="msub">
              {reason.item.name} · {off2date(reason.item.start)} → {off2date(reason.start)}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: "0 0 12px" }}>{t.reasonSub}</p>
            <div className="field">
              <textarea
                autoFocus
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={t.reasonPh}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setReason(null)} disabled={busy}>
                {t.cancel}
              </button>
              <button className="btn primary" onClick={submitReschedule} disabled={busy || !reasonText.trim()}>
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* quarter -> month detail */}
      {zoom &&
        (() => {
          const p = data.products.find((x) => x.id === zoom.productId);
          if (!p) return null;
          return (
            <MonthDetail
              product={p}
              quarterKey={zoom.qKey}
              lang={lang}
              onClose={() => setZoom(null)}
              onItemClick={
                isAdmin
                  ? (it) => {
                      setZoom(null);
                      setModal({ mode: "edit", item: it, productId: p.id });
                    }
                  : undefined
              }
            />
          );
        })()}

      {/* item create/edit modal */}
      {modal && (
        <ItemModal
          mode={modal.mode}
          item={modal.item}
          productId={modal.productId}
          products={data.products}
          lang={lang}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
