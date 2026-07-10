// Chart window: 01/07/2026 -> 31/12/2028 (30 months).
export const CHART_START = new Date(2026, 6, 1);
export const CHART_END = new Date(2029, 0, 1); // exclusive; roadmap through end of 2028
export const DAY = 86400000;
export const CHART_DAYS = Math.round((CHART_END.getTime() - CHART_START.getTime()) / DAY);
export const DAY_PX = 3.3;
export const Q_DAY_PX = 9.5;
export const SNAP = 7;

export function offOf(d: Date): number {
  return Math.round((d.getTime() - CHART_START.getTime()) / DAY);
}

// All calendar months in the window.
export interface MonthInfo {
  mnum: number;
  year: number;
  off: number;
  days: number;
}
export const MONTHS: MonthInfo[] = (() => {
  const arr: MonthInfo[] = [];
  let y = CHART_START.getFullYear();
  let m = CHART_START.getMonth();
  while (true) {
    const d0 = new Date(y, m, 1);
    if (d0.getTime() >= CHART_END.getTime()) break;
    const d1 = new Date(y, m + 1, 1);
    arr.push({ mnum: m + 1, year: y, off: offOf(d0), days: Math.round((d1.getTime() - d0.getTime()) / DAY) });
    if (++m > 11) {
      m = 0;
      y++;
    }
  }
  return arr;
})();

export const ADMIN_EMAILS = [
  "vunm07@hdc-flowtech.com",
  "hungnv01@hdc-flowtech.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export type Status =
  | "not_started"
  | "in_progress"
  | "done"
  | "delayed"
  | "paused"
  | "cancelled";

export const STATUSES: Status[] = [
  "not_started",
  "in_progress",
  "done",
  "delayed",
  "paused",
  "cancelled",
];

export const STATUS_COLOR: Record<Status, string> = {
  not_started: "#878da0",
  in_progress: "#4f6bed",
  done: "#2fae66",
  delayed: "#e0413f",
  paused: "#e0a72b",
  cancelled: "#5b6170",
};

export const STATUS_LABEL: Record<Status, { vi: string; ja: string }> = {
  not_started: { vi: "Chưa bắt đầu", ja: "未着手" },
  in_progress: { vi: "Đang làm", ja: "進行中" },
  done: { vi: "Hoàn thành", ja: "完了" },
  delayed: { vi: "Trễ tiến độ", ja: "遅延" },
  paused: { vi: "Tạm hoãn", ja: "保留" },
  cancelled: { vi: "Huỷ", ja: "中止" },
};

export interface QuarterInfo {
  key: string;
  label: string;
  startOff: number;
  endOff: number;
}
// All calendar quarters overlapping the window, clipped to it.
export const QUARTERS: QuarterInfo[] = (() => {
  const arr: QuarterInfo[] = [];
  let y = CHART_START.getFullYear();
  let qi = Math.floor(CHART_START.getMonth() / 3); // 0=Q1 ... 3=Q4
  while (true) {
    const sMonth = qi * 3;
    const s = new Date(y, sMonth, 1);
    if (s.getTime() >= CHART_END.getTime()) break;
    const e = new Date(y, sMonth + 3, 1);
    arr.push({ key: `q${qi + 1}_${y}`, label: `Q${qi + 1} · ${y}`, startOff: offOf(s), endOff: offOf(e) });
    if (++qi > 3) {
      qi = 0;
      y++;
    }
  }
  return arr;
})();
