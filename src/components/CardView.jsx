/**
 * CardView.jsx
 * Hiển thị lịch học dạng thẻ (Cards), nhóm theo Ngày → Buổi
 */
import { useMemo } from "react";
import { useSchedule } from "../hooks/useScheduleStore";
import { parseDateString } from "../utils/excelParser";
import PhanKhauBadge from "./PhanKhauBadge";

const BUOI_CONFIG = {
  Sáng: { gradient: "linear-gradient(135deg,#fff7ed,#fed7aa)", icon: "🌅", border: "#fb923c" },
  Chiều: { gradient: "linear-gradient(135deg,#eff6ff,#bfdbfe)", icon: "🌤️", border: "#60a5fa" },
  Tối: { gradient: "linear-gradient(135deg,#1e1b4b,#312e81)", icon: "🌙", border: "#818cf8", dark: true },
};

function ScheduleCard({ record }) {
  const buoiCfg = BUOI_CONFIG[record.buoiHoc] || { gradient: "#f9fafb", icon: "📅", border: "#9ca3af" };

  return (
    <div className="schedule-card" style={{ background: buoiCfg.gradient, borderLeft: `4px solid ${buoiCfg.border}` }}>
      <div className={`card-header ${buoiCfg.dark ? "dark" : ""}`}>
        <span className="card-buoi">{buoiCfg.icon} {record.buoiHoc || "—"}</span>
        {record.soTiet && (
          <span className="card-tiet">{record.soTiet} tiết</span>
        )}
      </div>

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
            <span className="gv-name">{record.giangVien}</span>
            {record.donVi && <span className="don-vi-small"> • {record.donVi}</span>}
          </div>
        )}

        {record.hoiTruong && (
          <div className="card-row">
            <span className="card-icon">🏛️</span>
            <span className="room-badge">{record.hoiTruong}</span>
            {record.coSo && <span className="co-so-small"> — {record.coSo}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

const BUOI_ORDER = { Sáng: 1, Chiều: 2, Tối: 3 };

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
        const byBuoi = {};
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
          </div>

          {Object.entries(byBuoi)
            .sort(([a], [b]) => (BUOI_ORDER[a] || 9) - (BUOI_ORDER[b] || 9))
            .map(([buoi, records]) => (
              <div key={buoi} className="buoi-cards-section">
                <div className="cards-grid">
                  {records.map((r, i) => (
                    <ScheduleCard key={i} record={r} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
