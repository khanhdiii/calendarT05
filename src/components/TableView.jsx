/**
 * TableView.jsx
 * Hiển thị lịch học dạng bảng, nhóm theo Ngày → Buổi
 */
import { useMemo } from "react";
import { useSchedule } from "../hooks/useScheduleStore";
import { parseDateString } from "../utils/excelParser";
import PhanKhauBadge from "./PhanKhauBadge";

const BUOI_ORDER = { Sáng: 1, Chiều: 2, Tối: 3 };

function BuoiTag({ buoi }) {
  const colors = {
    Sáng: { bg: "#fff7ed", text: "#c2410c", icon: "🌅" },
    Chiều: { bg: "#eff6ff", text: "#1d4ed8", icon: "🌤️" },
    Tối: { bg: "#1e1b4b", text: "#c7d2fe", icon: "🌙" },
  };
  const c = colors[buoi] || { bg: "#f3f4f6", text: "#374151", icon: "📅" };
  return (
    <span className="buoi-tag" style={{ background: c.bg, color: c.text }}>
      {c.icon} {buoi || "—"}
    </span>
  );
}

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
        // Nhóm theo buổi
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

          {/* Bảng dữ liệu theo buổi */}
          {Object.entries(byBuoi)
            .sort(([a], [b]) => (BUOI_ORDER[a] || 9) - (BUOI_ORDER[b] || 9))
            .map(([buoi, records]) => (
              <div key={buoi} className="buoi-section">
                <div className="buoi-header">
                  <BuoiTag buoi={buoi} />
                  <span className="buoi-count">{records.length} ca</span>
                </div>

                <div className="table-wrapper">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Lớp học</th>
                        <th>Môn học</th>
                        <th>Số tiết</th>
                        <th>Phân khâu</th>
                        <th>Giảng viên</th>
                        <th>Đơn vị</th>
                        <th>Hội trường</th>
                        <th>Cơ sở</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                          <td>
                            <span className="lop-tag">{r.lopHoc || "—"}</span>
                          </td>
                          <td className="mon-hoc-cell">{r.monHoc || "—"}</td>
                          <td className="center">
                            {r.soTiet ? (
                              <span className="so-tiet-badge">{r.soTiet}</span>
                            ) : "—"}
                          </td>
                          <td><PhanKhauBadge value={r.phanKhau} /></td>
                          <td>
                            <span className="gv-name">{r.giangVien || "—"}</span>
                          </td>
                          <td className="don-vi-cell">{r.donVi || "—"}</td>
                          <td>
                            <span className="room-badge">{r.hoiTruong || "—"}</span>
                          </td>
                          <td>{r.coSo || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
