"use client";
import { CHART_START, DAY, MONTHS, QUARTERS, STATUS_COLOR, STATUS_LABEL } from "@/lib/constants";
import type { Item, Product } from "./Roadmap";

const MPX = 22; // px per day at month zoom
const LABEL_W = 200;

export default function MonthDetail({
  product,
  quarterKey,
  lang,
  onClose,
  onItemClick,
}: {
  product: Product;
  quarterKey: string;
  lang: "vi" | "ja";
  onClose: () => void;
  onItemClick?: (it: Item) => void;
}) {
  const L = lang === "ja";
  const q = QUARTERS.find((x) => x.key === quarterKey)!;
  const months = MONTHS.filter((m) => m.off >= q.startOff && m.off < q.endOff);
  const nowOff = Math.round((Date.now() - CHART_START.getTime()) / DAY);

  const nm = (it: Item) => (L ? it.name_ja || it.name : it.name);
  const phn = (it: Item) => (L ? it.phase_ja || it.phase : it.phase);
  const pnm = L ? product.name_ja || product.name : product.name;
  const monthName = (m: number) => (L ? m + "月" : "Thg" + m);
  const fmt = (off: number) => {
    const d = new Date(CHART_START.getTime() + off * DAY);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return L ? `${mm}/${dd}` : `${dd}/${mm}`;
  };

  return (
    <div className="modal-back" onClick={onClose} style={{ alignItems: "flex-start" }}>
      <div
        className="modal"
        style={{ maxWidth: 1120, width: "96%", padding: "18px 20px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ margin: 0 }}>
            {pnm} · {q.label}
          </h2>
          <button className="btn" onClick={onClose}>
            {L ? "閉じる" : "Đóng"} ✕
          </button>
        </div>
        <p className="msub" style={{ marginBottom: 14 }}>
          {L ? "月別詳細（日単位）" : "Chi tiết theo tháng (thang ngày)"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {months.map((m) => {
            const mStart = m.off;
            const mEnd = m.off + m.days;
            const items = product.items.filter((it) =>
              it.milestone ? it.start >= mStart && it.start < mEnd : it.start < mEnd && it.start + it.len > mStart
            );
            const gridW = m.days * MPX;
            return (
              <div key={m.off} className="qpanel">
                <div className="qpanel-head" style={{ cursor: "default" }}>
                  <div className="qh-title">
                    <span className="qbadge" style={{ background: product.color }}>
                      {monthName(m.mnum)} · {m.year}
                    </span>
                  </div>
                  <div className="qh-meta">
                    {items.filter((i) => !i.milestone).length} {L ? "項目" : "hạng mục"}
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <div style={{ position: "relative", minWidth: 200 + gridW }}>
                    {/* day-of-month scale */}
                    <div
                      style={{
                        display: "flex",
                        height: 22,
                        borderBottom: "1px solid var(--line-strong)",
                        background: "linear-gradient(180deg,#fbfbfd,#f4f6fa)",
                        position: "sticky",
                        top: 0,
                        zIndex: 4,
                      }}
                    >
                      <div style={{ width: LABEL_W, flex: "none" }} />
                      {Array.from({ length: m.days }).map((_, d) => {
                        const off = mStart + d;
                        const dt = new Date(CHART_START.getTime() + off * DAY);
                        const wend = dt.getDay() === 0 || dt.getDay() === 6;
                        const today = off === nowOff;
                        return (
                          <div
                            key={d}
                            style={{
                              width: MPX,
                              flex: "none",
                              fontFamily: '"JetBrains Mono",monospace',
                              fontSize: 9,
                              textAlign: "center",
                              lineHeight: "22px",
                              color: today ? "#fff" : wend ? "var(--ink-3)" : "var(--ink-2)",
                              background: today ? "var(--today)" : wend ? "#eef0f5" : "transparent",
                              borderLeft: dt.getDate() === 1 ? "1px solid var(--line-strong)" : "1px solid #f0f2f7",
                            }}
                            title={`${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`}
                          >
                            {dt.getDate()}
                          </div>
                        );
                      })}
                    </div>
                    {items.length === 0 ? (
                      <div className="qempty" style={{ paddingLeft: 16 }}>
                        {L ? "この月に項目はありません。" : "Không có hạng mục trong tháng này."}
                      </div>
                    ) : (
                      items.map((it) => {
                        const stColor = STATUS_COLOR[it.status];
                        const canc = it.status === "cancelled";
                        const bl = Math.max(mStart, it.start);
                        const br = it.milestone ? it.start : Math.min(mEnd, it.start + it.len);
                        const left = 200 + (bl - mStart) * MPX;
                        const width = Math.max(it.milestone ? 0 : (br - bl) * MPX, it.milestone ? 0 : 8);
                        const dateStr = it.milestone
                          ? fmt(it.start)
                          : `${fmt(it.start)} – ${fmt(it.start + it.len)}`;
                        const title = `${nm(it)}\n${dateStr}\n${STATUS_LABEL[it.status][lang]}${
                          it.milestone ? "" : " · " + it.percent + "%"
                        }`;
                        return (
                          <div
                            key={it.id}
                            style={{
                              position: "relative",
                              height: 38,
                              borderBottom: "1px solid var(--line)",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 200,
                                flex: "none",
                                padding: "0 12px",
                                fontSize: 12.5,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                cursor: onItemClick ? "pointer" : "default",
                                textDecoration: canc ? "line-through" : "none",
                                color: canc ? "var(--ink-3)" : "var(--ink-1)",
                              }}
                              onClick={() => onItemClick?.(it)}
                              title={phn(it) || undefined}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: stColor,
                                  flex: "none",
                                }}
                              />
                              {it.milestone ? "◆ " : ""}
                              {nm(it)}
                            </div>
                            {/* week gridlines */}
                            {Array.from({ length: Math.ceil(m.days / 7) + 1 }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  bottom: 0,
                                  left: 200 + i * 7 * MPX,
                                  width: 1,
                                  background: "#eef0f5",
                                }}
                              />
                            ))}
                            {nowOff >= mStart && nowOff < mEnd && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  bottom: 0,
                                  left: 200 + (nowOff - mStart) * MPX,
                                  width: 2,
                                  background: "var(--today)",
                                  zIndex: 3,
                                }}
                              />
                            )}
                            {it.milestone ? (
                              <div
                                title={title}
                                style={{
                                  position: "absolute",
                                  left,
                                  top: "50%",
                                  width: 14,
                                  height: 14,
                                  transform: "translate(-50%,-50%) rotate(45deg)",
                                  background: stColor,
                                  border: "2px solid #fff",
                                  borderRadius: 3,
                                  opacity: canc ? 0.5 : 1,
                                  zIndex: 2,
                                }}
                              />
                            ) : (
                              <div
                                title={title}
                                onClick={() => onItemClick?.(it)}
                                style={{
                                  position: "absolute",
                                  left,
                                  width,
                                  height: 22,
                                  borderRadius: 6,
                                  background: `linear-gradient(180deg, ${stColor}, ${stColor})`,
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0 8px",
                                  overflow: "hidden",
                                  opacity: canc ? 0.5 : 1,
                                  cursor: onItemClick ? "pointer" : "default",
                                  boxShadow: "0 1px 2px rgba(20,23,32,.15)",
                                  zIndex: 2,
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${Math.max(0, Math.min(100, it.percent))}%`,
                                    background: "rgba(255,255,255,.28)",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    color: "#fff",
                                    fontWeight: 600,
                                    position: "relative",
                                    whiteSpace: "nowrap",
                                    textShadow: "0 1px 1px rgba(0,0,0,.15)",
                                    textDecoration: canc ? "line-through" : "none",
                                  }}
                                >
                                  {it.percent}%
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
