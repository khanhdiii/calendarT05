/**
 * PhanKhauBadge.jsx
 * Hiển thị phân khâu dạng badge màu sắc
 */
import { parsePhanKhau } from "../utils/excelParser";

const COLOR_MAP = {
  BT: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  TH: { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
  LT: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  BC: { bg: "#ede9fe", text: "#5b21b6", border: "#8b5cf6" },
  GĐ: { bg: "#fce7f3", text: "#9d174d", border: "#ec4899" },
  KT: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
  TC: { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" },
  ÔN: { bg: "#ecfdf5", text: "#064e3b", border: "#34d399" },
  ON: { bg: "#ecfdf5", text: "#064e3b", border: "#34d399" },
  HB: { bg: "#fff7ed", text: "#7c2d12", border: "#f97316" },
  TT: { bg: "#f0fdf4", text: "#14532d", border: "#22c55e" },
  DA: { bg: "#faf5ff", text: "#581c87", border: "#a855f7" },
};

const DEFAULT_COLOR = { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" };

export default function PhanKhauBadge({ value }) {
  if (!value) return <span className="text-muted">—</span>;

  const items = parsePhanKhau(value);

  if (items.length === 0) {
    return <span className="phan-khau-raw">{value}</span>;
  }

  return (
    <div className="phan-khau-badges">
      {items.map((item, i) => {
        const color = COLOR_MAP[item.type] || DEFAULT_COLOR;
        return (
          <span
            key={i}
            className="pk-badge"
            style={{
              background: color.bg,
              color: color.text,
              border: `1px solid ${color.border}`,
            }}
            title={item.label}
          >
            <strong>{item.type}</strong>:{item.count}
          </span>
        );
      })}
    </div>
  );
}
