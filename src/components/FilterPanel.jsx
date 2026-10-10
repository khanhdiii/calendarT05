/**
 * FilterPanel.jsx
 * Panel bộ lọc: Lớp học, Giảng viên, Hội trường, Buổi học, Tìm kiếm nhanh
 */
import { useSchedule } from "../hooks/useScheduleStore";
import { exportToExcel, exportToPDF } from "../utils/exportHelpers";

export default function FilterPanel() {
  const { state, setFilter, resetFilters, setViewMode } = useSchedule();
  const { filters, uniqueClasses, uniqueTeachers, uniqueRooms, filteredRecords, viewMode } = state;

  const handleChange = (key) => (e) => setFilter({ [key]: e.target.value });

  const handleExportExcel = () => {
    if (!filteredRecords.length) return alert("Không có dữ liệu để xuất!");
    exportToExcel(filteredRecords, { lopHoc: filters.lopHoc || "TatCa", tuanFilter: filters.tuanFilter });
  };

  const handleExportPDF = () => {
    if (!filteredRecords.length) return alert("Không có dữ liệu để xuất!");
    exportToPDF(filteredRecords, { lopHoc: filters.lopHoc || "Tất cả", tuanFilter: filters.tuanFilter });
  };

  const hasFilter = Object.values(filters).some((v) => v !== "");

  return (
    <div className="filter-panel">
      {/* Row 1: Bộ lọc chính */}
      <div className="filter-row">
        {/* Lớp học - dropdown chính */}
        <div className="filter-group primary">
          <label>🏫 Lớp học</label>
          <select value={filters.lopHoc} onChange={handleChange("lopHoc")}>
            <option value="">— Tất cả lớp —</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Buổi học */}
        <div className="filter-group">
          <label>🌅 Buổi học</label>
          <select value={filters.buoiHoc} onChange={handleChange("buoiHoc")}>
            <option value="">— Tất cả —</option>
            <option value="Sáng">Sáng</option>
            <option value="Chiều">Chiều</option>
            <option value="Tối">Tối</option>
          </select>
        </div>

        {/* Giảng viên */}
        <div className="filter-group">
          <label>👨‍🏫 Giảng viên</label>
          <select value={filters.giangVien} onChange={handleChange("giangVien")}>
            <option value="">— Tất cả GV —</option>
            {uniqueTeachers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Hội trường */}
        <div className="filter-group">
          <label>🏛️ Hội trường</label>
          <select value={filters.hoiTruong} onChange={handleChange("hoiTruong")}>
            <option value="">— Tất cả phòng —</option>
            {uniqueRooms.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Tìm kiếm + View mode + Export */}
      <div className="filter-row filter-actions-row">
        {/* Tìm kiếm nhanh */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm nhanh (giảng viên, phòng, môn học...)"
            value={filters.searchText}
            onChange={handleChange("searchText")}
          />
          {filters.searchText && (
            <button className="clear-search" onClick={() => setFilter({ searchText: "" })}>✕</button>
          )}
        </div>

        {/* Số kết quả */}
        <span className="result-count">
          {filteredRecords.length} kết quả
        </span>

        {/* Reset */}
        {hasFilter && (
          <button className="btn btn-outline" onClick={resetFilters}>
            ↺ Xóa lọc
          </button>
        )}

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Dạng bảng"
          >☰ Bảng</button>
          <button
            className={`toggle-btn ${viewMode === "card" ? "active" : ""}`}
            onClick={() => setViewMode("card")}
            title="Dạng thẻ"
          >⊞ Thẻ</button>
        </div>

        {/* Export */}
        <div className="export-group">
          <button className="btn btn-excel" onClick={handleExportExcel}>
            ⬇ Excel
          </button>
          <button className="btn btn-pdf" onClick={handleExportPDF}>
            ⬇ PDF
          </button>
        </div>
      </div>
    </div>
  );
}
