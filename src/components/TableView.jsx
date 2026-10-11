/**
 * TableView.jsx
 * Hiển thị lịch học dạng bảng, nhóm theo Ngày → Buổi
 * Hover tooltip hiển thị đầy đủ thông tin tiết học + ĐƠN VỊ GIẢNG DẠY
 * Phân chia tiết Sáng (max 5) / Chiều (max 4) với visual indicator
 */
import { useMemo, useState } from "react";
import { useSchedule } from "../hooks/useScheduleStore";
import { parseDateString } from "../utils/excelParser";
import PhanKhauBadge from "./PhanKhauBadge";

const BUOI_ORDER = { Sáng: 1, Chiều: 2, Tối: 3 };
const BUOI_MAX_TIET = { Sáng: 5, Chiều: 4, Tối: 4 };

function BuoiTag({ buoi }) {
  const meta = {
    Sáng: { bg: "var(--buoi-sang-bg)", text: "var(--buoi-sang-text)", icon: "🌅", time: "7h30 - 11h30 (5 tiết)" },
    Chiều: { bg: "var(--buoi-chieu-bg)", text: "var(--buoi-chieu-text)", icon: "🌤️", time: "Từ 13h00" },
    Tối: { bg: "var(--buoi-toi-bg)", text: "var(--buoi-toi-text)", icon: "🌙", time: "Từ 17h00" },
  };
  const c = meta[buoi] || { bg: "var(--gray-100)", text: "var(--gray-700)", icon: "📅", time: "" };
  return (
    <span className="buoi-tag" style={{ background: c.bg, color: c.text }}>
      <span className="session-icon">{c.icon}</span> <strong>{buoi || "—"}</strong> {c.time && <small style={{ opacity: 0.85, marginLeft: 4 }}>({c.time})</small>}
    </span>
  );
}

/** Mini progress bar showing tiet usage for each buổi */
function TietProgressBar({ totalTiet, maxTiet, buoi }) {
  const used = Math.min(totalTiet, maxTiet);
  const accentMap = { Sáng: "sang", Chiều: "chieu", Tối: "toi" };
  const accent = accentMap[buoi] || "default";
  return (
    <div className="tiet-progress-inline" title={`${totalTiet}/${maxTiet} tiết`}>
      {Array.from({ length: maxTiet }).map((_, i) => (
        <div key={i} className={`progress-dot ${i < used ? `filled-${accent}` : "empty-dot"}`} />
      ))}
      <span className="progress-text">{totalTiet}/{maxTiet}</span>
    </div>
  );
}

/** Tooltip that appears on row hover */
function RowTooltip({ record, show }) {
  if (!show) return null;

  return (
    <div className="row-tooltip">
      <div className="tooltip-header accent-table">
        <span>📋 Chi tiết tiết học</span>
      </div>
      <div className="tooltip-body">
        {record.thoiGian && (
          <div className="tooltip-row">
            <span className="tooltip-label">📅 Thời gian</span>
            <span className="tooltip-value">{record.thoiGian}</span>
          </div>
        )}
        {record.buoiHoc && (
          <div className="tooltip-row">
            <span className="tooltip-label">🕐 Buổi học</span>
            <span className="tooltip-value">{record.buoiHoc}</span>
          </div>
        )}
        {record.lopHoc && (
          <div className="tooltip-row">
            <span className="tooltip-label">🏫 Lớp học</span>
            <span className="tooltip-value">{record.lopHoc}</span>
          </div>
        )}
        {record.monHoc && (
          <div className="tooltip-row">
            <span className="tooltip-label">📚 Môn học</span>
            <span className="tooltip-value fw-bold">{record.monHoc}</span>
          </div>
        )}
        {record.soTiet && (
          <div className="tooltip-row">
            <span className="tooltip-label">⏱️ Số tiết</span>
            <span className="tooltip-value">{record.soTiet}</span>
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
            <span className="tooltip-label">🏢 Đơn vị giảng dạy</span>
            <span className="tooltip-value">{record.donVi}</span>
          </div>
        )}
        {record.hoiTruong && (
          <div className="tooltip-row">
            <span className="tooltip-label">🏛️ Hội trường</span>
            <span className="tooltip-value">{record.hoiTruong}</span>
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

function TietVisual({ soTiet, buoi }) {
  const maxTiet = BUOI_MAX_TIET[buoi] || 4;
  const used = Math.min(parseInt(soTiet) || 0, maxTiet);
  const accentMap = { Sáng: "sang", Chiều: "chieu", Tối: "toi" };
  const accent = accentMap[buoi] || "default";

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

function HoverableRow({ record, index }) {
  const [hovered, setHovered] = useState(false);
  const isThi = record.isThi ||
                (record.giangVien || "").toUpperCase().includes("THI") ||
                (record.phanKhau || "").toUpperCase().includes("THI");

  return (
    <tr
      className={`${index % 2 === 0 ? "row-even" : "row-odd"} hoverable-row ${isThi ? "row-thi" : ""}`}
      style={isThi ? { backgroundColor: "#fff7ed", borderLeft: "4px solid #ea580c" } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ position: "relative" }}>
        <span className="lop-tag">{record.lopHoc || "—"}</span>
        <RowTooltip record={record} show={hovered} />
      </td>
      <td className="mon-hoc-cell">
        {record.monHoc || (isThi ? "LỊCH THI" : "—")}
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
      </td>
      <td className="center">
        {record.soTiet ? (
          <TietVisual soTiet={record.soTiet} buoi={record.buoiHoc} />
        ) : isThi ? (
          <span style={{ color: "#ea580c", fontWeight: 700 }}>Thi</span>
        ) : "—"}
      </td>
      <td><PhanKhauBadge value={record.phanKhau} /></td>
      <td>
        <span className="gv-name">
          {isThi && (record.giangVien || "").toUpperCase() === "THI"
            ? "Cán bộ coi thi"
            : record.giangVien || "—"}
        </span>
      </td>
      <td className="don-vi-cell">
        {record.donVi ? (
          <span className="don-vi-tag">{record.donVi}</span>
        ) : "—"}
      </td>
      <td>
        <span className="room-badge">{record.hoiTruong || "—"}</span>
      </td>
      <td>{record.coSo || "—"}</td>
    </tr>
  );
}

const ALL_BUOI = ["Sáng", "Chiều", "Tối"];

export default function TableView() {
  const { state } = useSchedule();
  const { filteredRecords } = state;

  // Nhóm dữ liệu: { dateKey: { dateInfo, buois: { Sáng: [], Chiều: [], Tối: [] } } }
  const grouped = useMemo(() => {
    const map = new Map();

    filteredRecords.forEach((r) => {
      const parsed = parseDateString(r.thoiGian);
      const key = parsed.date || r.thoiGian || "Không xác định";

      if (!map.has(key)) {
        map.set(key, { dateInfo: parsed, records: [] });
      }
      map.get(key).records.push(r);
    });

    // Sắp xếp theo ngày
    return Array.from(map.entries())
      .sort(([, a], [, b]) => a.dateInfo.sortKey - b.dateInfo.sortKey)
      .map(([key, val]) => {
        // Nhóm theo buổi – khởi tạo cả 3 ca
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
    <div className="table-view">
      {grouped.map(({ key, dateInfo, byBuoi }) => (
        <div key={key} className="day-group">
          {/* Header ngày */}
          <div className="day-header">
            <div className="day-badge">
              <span className="thu-label">{dateInfo.thu || "—"}</span>
              <span className="date-label">{dateInfo.date || key}</span>
            </div>
            <span className="day-total">
              {Object.values(byBuoi).flat().length} buổi
            </span>
          </div>

          {/* Bảng dữ liệu theo buổi – luôn hiển thị cả 3 ca */}
          {ALL_BUOI.map((buoi) => {
            const records = byBuoi[buoi] || [];
            const totalTiet = records.reduce((s, r) => s + (parseInt(r.soTiet) || 0), 0);
            const maxTiet = BUOI_MAX_TIET[buoi] || 4;
            const isEmpty = records.length === 0;

            return (
              <div key={buoi} className={`buoi-section ${isEmpty ? "buoi-section-empty" : ""}`}>
                <div className="buoi-header">
                  <BuoiTag buoi={buoi} />
                  <span className="buoi-count">{records.length} ca</span>
                  <TietProgressBar totalTiet={totalTiet} maxTiet={maxTiet} buoi={buoi} />
                </div>

                {/* Yêu cầu: Mỗi sáng thứ 2 đều có tiết chào cờ 1 tiết */}
                {buoi === "Sáng" && (dateInfo.thu === "Thứ 2" || (dateInfo.date || "").includes("Thứ 2")) && (
                  <div style={{
                    padding: "8px 14px",
                    background: "#fef2f2",
                    borderLeft: "4px solid #ef4444",
                    borderRadius: "6px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#991b1b",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    <span style={{ fontSize: "16px" }}>🚩</span>
                    <span><strong>Chào cờ (Tiết 1):</strong> 7h30 đến 8h15 (1 tiết bắt buộc sáng Thứ 2)</span>
                  </div>
                )}

                {isEmpty ? (
                  <div className="buoi-empty-body">
                    <span className="buoi-empty-text">Không có lịch học buổi {buoi} — Tối đa {maxTiet} tiết</span>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Lớp học</th>
                          <th>Môn học</th>
                          <th>Số tiết</th>
                          <th>Phân khâu</th>
                          <th>Giảng viên</th>
                          <th>Đơn vị GD</th>
                          <th>Hội trường</th>
                          <th>Cơ sở</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((r, i) => (
                          <HoverableRow key={i} record={r} index={i} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                {/* Phân chia thời gian nghỉ giữa các buổi */}
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
            );
          })}
        </div>
      ))}
    </div>
  );
}

