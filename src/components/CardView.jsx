/**
 * CardView.jsx
 * Hiển thị lịch học dạng thẻ (Cards), nhóm theo Ngày → Buổi
 * Phân chia tiết Sáng (max 5) / Chiều (max 4) với visual indicator
 * Hover tooltip hiển thị đầy đủ thông tin
 */
import { useMemo, useState } from "react";
import { useSchedule } from "../hooks/useScheduleStore";
import { parseDateString } from "../utils/excelParser";
import PhanKhauBadge from "./PhanKhauBadge";

const BUOI_CONFIG = {
  Sáng: {
    gradient: "var(--card-sang-bg)",
    icon: "🌅",
    border: "var(--card-sang-border)",
    maxTiet: 5,
    label: "Sáng (7h30 - 11h30 • 5 tiết)",
    accentClass: "sang",
  },
  Chiều: {
    gradient: "var(--card-chieu-bg)",
    icon: "🌤️",
    border: "var(--card-chieu-border)",
    maxTiet: 4,
    label: "Chiều (Từ 13h00)",
    accentClass: "chieu",
  },
  Tối: {
    gradient: "var(--card-toi-bg)",
    icon: "🌙",
    border: "var(--card-toi-border)",
    maxTiet: 4,
    label: "Tối (Từ 17h00)",
    accentClass: "toi",
    dark: true,
  },
};

function TietDots({ soTiet, maxTiet, buoiCfg }) {
  const used = Math.min(parseInt(soTiet) || 0, maxTiet);
  const accent = buoiCfg ? buoiCfg.accentClass : "default";
  return (
    <div className="tiet-dots" title={`${used}/${maxTiet} tiết`}>
      {Array.from({ length: maxTiet }).map((_, i) => (
        <div
          key={i}
          className={`tiet-dot ${i < used ? `filled-${accent}` : "empty"}`}
        />
      ))}
    </div>
  );
}

/** Tooltip popup khi hover */
function HoverTooltip({ record, buoiCfg, visible }) {
  if (!visible) return null;
  return (
    <div className="card-tooltip">
      <div className={`tooltip-header accent-${buoiCfg.accentClass}`}>
        <span>{buoiCfg.icon} Buổi {buoiCfg.label}</span>
        {record.soTiet && <span className="tooltip-tiet">{record.soTiet} tiết</span>}
      </div>
      <div className="tooltip-body">
        {record.thoiGian && (
          <div className="tooltip-row">
            <span className="tooltip-label">📅 Thời gian</span>
            <span className="tooltip-value">{record.thoiGian}</span>
          </div>
        )}
        {record.lopHoc && (
          <div className="tooltip-row">
            <span className="tooltip-label">🏫 Lớp học</span>
            <span className="tooltip-value lop-tag">{record.lopHoc}</span>
          </div>
        )}
        {record.monHoc && (
          <div className="tooltip-row">
            <span className="tooltip-label">📚 Môn học</span>
            <span className="tooltip-value fw-bold">{record.monHoc}</span>
          </div>
        )}
        {record.phanKhau && (
          <div className="tooltip-row">
            <span className="tooltip-label">🔢 Phân khâu</span>
            <span className="tooltip-value"><PhanKhauBadge value={record.phanKhau} /></span>
          </div>
        )}
        {record.giangVien && (
          <div className="tooltip-row">
            <span className="tooltip-label">👨‍🏫 Giảng viên</span>
            <span className="tooltip-value">{record.giangVien}</span>
          </div>
        )}
        {record.donVi && (
          <div className="tooltip-row">
            <span className="tooltip-label">🏢 Đơn vị GD</span>
            <span className="tooltip-value">{record.donVi}</span>
          </div>
        )}
        {record.hoiTruong && (
          <div className="tooltip-row">
            <span className="tooltip-label">🏛️ Hội trường</span>
            <span className="tooltip-value room-badge">{record.hoiTruong}</span>
          </div>
        )}
        {record.coSo && (
          <div className="tooltip-row">
            <span className="tooltip-label">📍 Cơ sở</span>
            <span className="tooltip-value">{record.coSo}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleCard({ record }) {
  const [hovered, setHovered] = useState(false);
  const buoiCfg = BUOI_CONFIG[record.buoiHoc] || {
    gradient: "var(--card-default-bg)",
    icon: "📅",
    border: "var(--gray-400)",
    maxTiet: 5,
    accentClass: "default",
    label: record.buoiHoc || "—",
  };

  const isThi = record.isThi ||
                (record.giangVien || "").toUpperCase().includes("THI") ||
                (record.phanKhau || "").toUpperCase().includes("THI");

  const numTiet = parseInt(record.soTiet) || (isThi ? 4 : 1);
  const cardMinHeight = numTiet > 0 ? `calc(var(--tiet-unit-h, 52px) * ${Math.min(numTiet, 5)})` : undefined;

  const bgStyle = isThi
    ? { background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", borderLeft: "4px solid #ea580c", minHeight: cardMinHeight }
    : { background: buoiCfg.gradient, borderLeft: `4px solid ${buoiCfg.border}`, minHeight: cardMinHeight };

  return (
    <div
      className={`schedule-card ${buoiCfg.dark ? "card-dark" : ""} ${isThi ? "card-thi" : ""} card-tiet-${Math.min(numTiet, 5)}`}
      style={bgStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HoverTooltip record={record} buoiCfg={buoiCfg} visible={hovered} />

      <div className={`card-header ${buoiCfg.dark ? "dark" : ""}`}>
        <span className="card-buoi">
          {buoiCfg.icon} {record.buoiHoc || "—"}
          {isThi && (
            <span style={{
              marginLeft: 6,
              background: "#ea580c",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 800,
              padding: "1px 5px",
              borderRadius: 4
            }}>THI</span>
          )}
        </span>
        {record.soTiet ? (
          <span className="card-tiet">{record.soTiet} tiết</span>
        ) : isThi ? (
          <span className="card-tiet" style={{ background: "#ea580c", color: "#fff" }}>Thi</span>
        ) : null}
      </div>

      {/* Yêu cầu: các thông tin có thể chia grid nếu như tiết nhỏ hơn 4 để dễ xử lý */}
      {(() => {
        const numTiet = parseInt(record.soTiet) || (isThi ? 4 : 1);
        const isGrid = numTiet < 4;

        if (isGrid) {
          return (
            <div className="card-body card-body-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
              <div className="card-col-left" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {record.monHoc && (
                  <div className="card-row card-mon">
                    <span className="card-icon">📚</span>
                    <span className="card-mon-name">{record.monHoc}</span>
                  </div>
                )}
                {record.lopHoc && (
                  <div className="card-row">
                    <span className="card-icon">🏫</span>
                    <span className="lop-tag">{record.lopHoc}</span>
                  </div>
                )}
                <div className="card-row">
                  <span className="card-icon">🔢</span>
                  <PhanKhauBadge value={record.phanKhau} />
                </div>
                {record.giangVien && (
                  <div className="card-row">
                    <span className="card-icon">👨‍🏫</span>
                    <span className="gv-name">{record.giangVien}</span>
                  </div>
                )}
              </div>
              <div className="card-col-right" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {record.donVi && (
                  <div className="card-row">
                    <span className="card-icon">🏢</span>
                    <span className="don-vi-small">{record.donVi}</span>
                  </div>
                )}
                {record.hoiTruong && (
                  <div className="card-row">
                    <span className="card-icon">🏛️</span>
                    <span className="room-badge">{record.hoiTruong}</span>
                  </div>
                )}
                {record.coSo && (
                  <div className="card-row">
                    <span className="card-icon">📍</span>
                    <span className="co-so-small">{record.coSo}</span>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="card-body">
            {record.monHoc && (
              <div className="card-row card-mon">
                <span className="card-icon">📚</span>
                <span className="card-mon-name">{record.monHoc}</span>
              </div>
            )}
            {record.lopHoc && (
              <div className="card-row">
                <span className="card-icon">🏫</span>
                <span className="lop-tag">{record.lopHoc}</span>
              </div>
            )}
            <div className="card-row">
              <span className="card-icon">🔢</span>
              <PhanKhauBadge value={record.phanKhau} />
            </div>
            {record.giangVien && (
              <div className="card-row">
                <span className="card-icon">👨‍🏫</span>
                <div className="gv-block">
                  <span className="gv-name">{record.giangVien}</span>
                  {record.donVi && <span className="don-vi-small">🏢 {record.donVi}</span>}
                </div>
              </div>
            )}
            {record.hoiTruong && (
              <div className="card-row">
                <span className="card-icon">🏛️</span>
                <span className="room-badge">{record.hoiTruong}</span>
                {record.coSo && <span className="co-so-small">— {record.coSo}</span>}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

const BUOI_ORDER = { Sáng: 1, Chiều: 2, Tối: 3 };

function BuoiSection({ buoi, records, dateInfo }) {
  const cfg = BUOI_CONFIG[buoi] || { icon: "📅", accentClass: "default", maxTiet: 4 };
  const totalTiet = records.reduce((s, r) => s + (parseInt(r.soTiet) || 0), 0);
  const maxTiet = cfg.maxTiet;
  const isEmpty = records.length === 0;
  const isMondayMorning = buoi === "Sáng" && dateInfo && (dateInfo.thu === "Thứ 2" || (dateInfo.date || "").includes("Thứ 2"));

  return (
    <div className={`buoi-cards-section section-${cfg.accentClass} ${isEmpty && !isMondayMorning ? "buoi-empty" : ""}`}>
      <div className="buoi-section-header">
        <div className="buoi-section-title">
          <span className={`buoi-pill pill-${cfg.accentClass}`}>
            {cfg.icon} {buoi}
          </span>
          <span className="buoi-section-meta">{records.length} ca</span>
          <span className="buoi-tiet-info">
            {totalTiet > 0 ? (
              <>Tổng <strong>{totalTiet}</strong> / {maxTiet} tiết tối đa</>
            ) : (
              <>Tối đa <strong>{maxTiet}</strong> tiết</>
            )}
          </span>
        </div>
        {/* Thanh tiến trình tổng tiết buổi */}
        <div className="buoi-progress-bar">
          {Array.from({ length: maxTiet }).map((_, i) => (
            <div
              key={i}
              className={`progress-cell ${i < Math.min(totalTiet, maxTiet) ? `filled-${cfg.accentClass}` : "empty-cell"}`}
            />
          ))}
        </div>
      </div>

      {/* Yêu cầu: Mỗi sáng thứ 2 đều có tiết chào cờ 1 tiết */}
      {isMondayMorning && (
        <div style={{
          margin: "10px 12px",
          padding: "8px 14px",
          background: "#fef2f2",
          borderLeft: "4px solid #ef4444",
          borderRadius: "6px",
          color: "#991b1b",
          fontSize: "12px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "16px" }}>🚩</span>
          <span><strong>Chào cờ (Tiết 1):</strong> 7h30 đến 8h15 (1 tiết bắt buộc sáng Thứ 2)</span>
        </div>
      )}

      {isEmpty && !isMondayMorning ? (
        <div className="buoi-empty-body">
          <span className="buoi-empty-icon">{cfg.icon}</span>
          <span className="buoi-empty-text">Không có lịch học buổi {buoi}</span>
        </div>
      ) : (
        <div className="cards-grid">
          {records.map((r, i) => (
            <ScheduleCard key={i} record={r} />
          ))}
        </div>
      )}
    </div>
  );
}

const ALL_BUOI = ["Sáng", "Chiều", "Tối"];

export default function CardView() {
  const { state } = useSchedule();
  const { filteredRecords } = state;

  const grouped = useMemo(() => {
    const map = new Map();
    filteredRecords.forEach((r) => {
      const parsed = parseDateString(r.thoiGian);
      const key = parsed.date || r.thoiGian || "Không xác định";
      if (!map.has(key)) map.set(key, { dateInfo: parsed, records: [] });
      map.get(key).records.push(r);
    });

    return Array.from(map.entries())
      .sort(([, a], [, b]) => a.dateInfo.sortKey - b.dateInfo.sortKey)
      .map(([key, val]) => {
        const byBuoi = { Sáng: [], Chiều: [], Tối: [] };
        val.records.forEach((r) => {
          const b = r.buoiHoc || "Không xác định";
          if (!byBuoi[b]) byBuoi[b] = [];
          byBuoi[b].push(r);
        });
        return { key, dateInfo: val.dateInfo, byBuoi };
      });
  }, [filteredRecords]);

  if (filteredRecords.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>Không có dữ liệu</h3>
        <p>Hãy chọn lớp học hoặc thay đổi bộ lọc để xem lịch học</p>
      </div>
    );
  }

  return (
    <div className="card-view">
      {grouped.map(({ key, dateInfo, byBuoi }) => (
        <div key={key} className="day-group-card">
          <div className="day-header">
            <div className="day-badge">
              <span className="thu-label">{dateInfo.thu || "—"}</span>
              <span className="date-label">{dateInfo.date || key}</span>
            </div>
            <span className="day-total">
              {Object.values(byBuoi).flat().length} buổi học
            </span>
          </div>

          {ALL_BUOI.map((buoi) => (
            <div key={buoi}>
              <BuoiSection buoi={buoi} records={byBuoi[buoi] || []} dateInfo={dateInfo} />
              {/* Yêu cầu: Khoảng cách các buổi Sáng Chiều và tối sẽ có 1 khoảng để phân chia đây là thời gian nghỉ */}
              {buoi === "Sáng" && (
                <div className="table-break-banner">
                  <span className="break-icon">🍱</span>
                  <span className="break-title">Thời gian nghỉ trưa:</span>
                  <span className="break-time">11h30 – 13h00</span>
                </div>
              )}
              {buoi === "Chiều" && (
                <div className="table-break-banner">
                  <span className="break-icon">☕</span>
                  <span className="break-title">Thời gian nghỉ chuyển ca:</span>
                  <span className="break-time">16h45 – 17h00</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

