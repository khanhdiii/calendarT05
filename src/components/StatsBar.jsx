/**
 * StatsBar.jsx
 * Thanh thống kê nhanh bên dưới filter
 */
import { useMemo } from "react";
import { useSchedule } from "../hooks/useScheduleStore";

export default function StatsBar() {
  const { state } = useSchedule();
  const { filteredRecords, filters } = state;

  const stats = useMemo(() => {
    const classes = new Set(filteredRecords.map((r) => r.lopHoc).filter(Boolean));
    const teachers = new Set(filteredRecords.map((r) => r.giangVien).filter(Boolean));
    const rooms = new Set(filteredRecords.map((r) => r.hoiTruong).filter(Boolean));
    const totalTiet = filteredRecords.reduce((sum, r) => sum + (parseInt(r.soTiet) || 0), 0);
    const sang = filteredRecords.filter((r) => r.buoiHoc === "Sáng").length;
    const chieu = filteredRecords.filter((r) => r.buoiHoc === "Chiều").length;
    const toi = filteredRecords.filter((r) => r.buoiHoc === "Tối").length;
    return { classes: classes.size, teachers: teachers.size, rooms: rooms.size, totalTiet, sang, chieu, toi };
  }, [filteredRecords]);

  if (filteredRecords.length === 0) return null;

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-icon">📊</span>
        <span className="stat-value">{filteredRecords.length}</span>
        <span className="stat-label">Bản ghi</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-icon">🏫</span>
        <span className="stat-value">{stats.classes}</span>
        <span className="stat-label">Lớp học</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-icon">👨‍🏫</span>
        <span className="stat-value">{stats.teachers}</span>
        <span className="stat-label">Giảng viên</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-icon">🏛️</span>
        <span className="stat-value">{stats.rooms}</span>
        <span className="stat-label">Hội trường</span>
      </div>
      {stats.totalTiet > 0 && (
        <>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-value">{stats.totalTiet}</span>
            <span className="stat-label">Tổng tiết</span>
          </div>
        </>
      )}
      <div className="stat-divider" />
      <div className="stat-item buoi-stats">
        {stats.sang > 0 && <span className="buoi-mini sang">🌅 {stats.sang}</span>}
        {stats.chieu > 0 && <span className="buoi-mini chieu">🌤️ {stats.chieu}</span>}
        {stats.toi > 0 && <span className="buoi-mini toi">🌙 {stats.toi}</span>}
      </div>
    </div>
  );
}
