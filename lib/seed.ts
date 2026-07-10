import type { Status } from "./constants";

export interface SeedItem {
  id: string;
  phase?: string;
  phase_ja?: string;
  name: string;
  name_ja: string;
  note?: string;
  note_ja?: string;
  start: number;
  len: number;
  milestone?: boolean;
  status?: Status;
  percent?: number;
  internal?: boolean;
}
export interface SeedProduct {
  id: string;
  name: string;
  name_ja: string;
  tab: string;
  color: string;
  items: SeedItem[];
}

// Colors from roadmap_4.html :root vars.
const C = {
  mrag: "#4f6bed",
  mosa: "#7c5cf0",
  mcb: "#e08a2b",
  smartbi: "#d8578a",
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "mrag", name: "Mrag", name_ja: "Mrag", tab: "Mrag", color: C.mrag, items: [
      { id: "mr_deploy", phase: "Vận hành & Bảo trì", phase_ja: "運用 & 保守", name: "Đưa vào vận hành", name_ja: "本番導入 (Go-live)", start: 0, len: 14, status: "done", percent: 100 },
      { id: "mr_golive", phase: "Vận hành & Bảo trì", phase_ja: "運用 & 保守", name: "Go-live", name_ja: "Go-live", start: 14, len: 0, milestone: true, status: "done", percent: 100 },
      { id: "mr_maintain", phase: "Vận hành & Bảo trì", phase_ja: "運用 & 保守", name: "Bảo trì & vận hành", name_ja: "保守 & 運用", start: 14, len: 351, status: "in_progress", percent: 20 },
      { id: "mr_mcp_agent", phase: "Tính năng mới (nếu có)", phase_ja: "新機能 (あれば)", name: "Tích hợp MCP · AI Agent (Mosa)", name_ja: "MCP連携 · AIエージェント (Mosa)", start: 84, len: 42, status: "not_started", percent: 0 },
      { id: "mr_mcp_bi", phase: "Tính năng mới (nếu có)", phase_ja: "新機能 (あれば)", name: "Tích hợp MCP · SmartBI → Mrag", name_ja: "MCP連携 · SmartBI → Mrag", start: 210, len: 42, status: "not_started", percent: 0 },
      { id: "mr_newfeat", phase: "Tính năng mới (nếu có)", phase_ja: "新機能 (あれば)", name: "Tính năng mới khác (nếu có)", name_ja: "その他の新機能 (あれば)", start: 84, len: 281, status: "not_started", percent: 0 },
      { id: "mr_refactor", phase: "Nội bộ", phase_ja: "内部", name: "Refactor nợ kỹ thuật (nội bộ)", name_ja: "技術的負債リファクタ (内部)", start: 30, len: 60, status: "in_progress", percent: 40, internal: true },
    ],
  },
  {
    id: "mosa", name: "AI Agent (Mosa)", name_ja: "AIエージェント (Mosa)", tab: "Mosa", color: C.mosa, items: [
      { id: "mo_chat", name: "Xây dựng luồng ChatBot", name_ja: "チャットボットフロー構築", start: 0, len: 14, status: "done", percent: 100 },
      { id: "mo_drive", name: "Tích hợp Google Drive", name_ja: "Google Drive連携", start: 14, len: 5, status: "done", percent: 100 },
      { id: "mo_zoho", name: "Tích hợp Zoho CRM", name_ja: "Zoho CRM連携", start: 19, len: 5, status: "in_progress", percent: 60 },
      { id: "mo_mail", name: "Tích hợp gửi mail cho Agent", name_ja: "メール送信連携 (エージェント)", start: 24, len: 11, status: "delayed", percent: 30 },
      { id: "mo_verify", name: "Verify ứng dụng Mosa (tích hợp Drive như Mrag)", name_ja: "Mosaアプリ検証 (Drive連携 · Mrag同様)", start: 35, len: 10, status: "not_started", percent: 0 },
      { id: "mo_nlwf", name: "Tạo workflow bằng ngôn ngữ tự nhiên", name_ja: "自然言語ワークフロー作成", start: 45, len: 18, status: "not_started", percent: 0 },
      { id: "mo_deploy", name: "Triển khai tất cả → bản map", name_ja: "全機能を map版として展開", start: 63, len: 13, status: "not_started", percent: 0 },
      { id: "mo_map", name: "Bản map (dự kiến)", name_ja: "map版 (予定)", start: 76, len: 0, milestone: true, status: "not_started", percent: 0 },
    ],
  },
  {
    id: "mcb", name: "MultiContentBuilder", name_ja: "MultiContentBuilder", tab: "MultiContent", color: C.mcb, items: [
      { id: "mc_brand", name: "Brand Kit", name_ja: "ブランドキット", note: "Gom 3 thứ rời rạc thành 1 — giá trị user rõ", note_ja: "バラバラな3つを1つに統合 — ユーザー価値が明確", start: 84, len: 35, status: "not_started", percent: 0 },
      { id: "mc_aislide", name: "AI sinh slide từ tài liệu", name_ja: "資料からAIスライド生成", note: "Khác biệt hoá sản phẩm mạnh", note_ja: "強力な製品差別化", start: 119, len: 56, status: "not_started", percent: 0 },
      { id: "mc_analytics", name: "Analytics shared link", name_ja: "共有リンク アナリティクス", note: "Đo ROI của tính năng sharing vừa làm", note_ja: "実装済み共有機能のROIを計測", start: 175, len: 35, status: "not_started", percent: 0 },
      { id: "mc_billing", name: "Quota & Billing", name_ja: "クォータ & 課金", note: "Cần thiết khi đã track token", note_ja: "トークン計測後に必要", start: 210, len: 42, status: "not_started", percent: 0 },
      { id: "mc_version", name: "Version History", name_ja: "バージョン履歴", note: "Nền cho collaboration sau này", note_ja: "今後のコラボレーションの土台", start: 252, len: 42, status: "not_started", percent: 0 },
      { id: "mcM1", name: "Release", name_ja: "リリース", start: 294, len: 0, milestone: true, status: "not_started", percent: 0 },
    ],
  },
  {
    id: "smartbi", name: "SmartBI", name_ja: "SmartBI", tab: "SmartBI", color: C.smartbi, items: [
      { id: "sb_sales", phase: "Triển khai luồng bán hàng", phase_ja: "販売フロー展開", name: "Tích hợp Superadmin & Admin (luồng bán hàng)", name_ja: "スーパー管理者 & 管理者へ統合 (販売フロー)", start: 24, len: 21, status: "in_progress", percent: 50 },
      { id: "sb_salesM", phase: "Triển khai luồng bán hàng", phase_ja: "販売フロー展開", name: "Luồng bán hàng go-live", name_ja: "販売フロー本番稼働 (Go-live)", start: 45, len: 0, milestone: true, status: "not_started", percent: 0 },
      { id: "sb1", phase: "Nền tảng & Phân tích (dự kiến)", phase_ja: "基盤 & 分析 (予定)", name: "Data model", name_ja: "データモデル", start: 70, len: 42, status: "not_started", percent: 0 },
      { id: "sb2", phase: "Nền tảng & Phân tích (dự kiến)", phase_ja: "基盤 & 分析 (予定)", name: "BigQuery integration (connector & ETL)", name_ja: "BigQuery連携 (コネクタ & ETL)", start: 105, len: 56, status: "not_started", percent: 0 },
      { id: "sb3", phase: "Nền tảng & Phân tích (dự kiến)", phase_ja: "基盤 & 分析 (予定)", name: "Visualization engine", name_ja: "可視化エンジン", start: 133, len: 56, status: "not_started", percent: 0 },
      { id: "sb4", phase: "Nền tảng & Phân tích (dự kiến)", phase_ja: "基盤 & 分析 (予定)", name: "MCP Server (mở cho Mrag/Mosa)", name_ja: "MCPサーバー (Mrag/Mosa向け公開)", start: 168, len: 42, status: "not_started", percent: 0 },
      { id: "sb5", phase: "Nền tảng & Phân tích (dự kiến)", phase_ja: "基盤 & 分析 (予定)", name: "Truy vấn ngôn ngữ tự nhiên", name_ja: "自然言語クエリ", start: 203, len: 49, status: "not_started", percent: 0 },
      { id: "sb6", phase: "Nền tảng & Phân tích (dự kiến)", phase_ja: "基盤 & 分析 (予定)", name: "Dashboard builder", name_ja: "ダッシュボードビルダー", start: 245, len: 49, status: "not_started", percent: 0 },
      { id: "sbM1", phase: "Nền tảng & Phân tích (dự kiến)", phase_ja: "基盤 & 分析 (予定)", name: "Beta", name_ja: "ベータ", start: 301, len: 0, milestone: true, status: "not_started", percent: 0 },
    ],
  },
];
