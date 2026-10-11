/**
 * App.jsx - Root component
 * Hỗ trợ Dark/Light mode
 */
import { useState, useEffect } from "react";
import { ScheduleProvider, useSchedule } from "./hooks/useScheduleStore";
import FileUpload from "./components/FileUpload";
import FilterPanel from "./components/FilterPanel";
import TableView from "./components/TableView";
import CardView from "./components/CardView";
import StatsBar from "./components/StatsBar";
import "./styles/main.css";

function AppContent() {
  const { state } = useSchedule();
  const { rawRecords, viewMode } = state;
  const hasData = rawRecords.length > 0;

  // Dark mode state – persist in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("lichHoc_darkMode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    try {
      localStorage.setItem("lichHoc_darkMode", darkMode);
    } catch { /* ignore */ }
  }, [darkMode]);

  const toggleDark = () => setDarkMode((d) => !d);

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="brand-icon">📅</span>
            <div>
              <h1 className="brand-title">Lịch Học Thông Minh</h1>
              <p className="brand-sub">Tra cứu lịch học từ file Excel • Tự động nhận diện dữ liệu</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-badges">
              <span className="tech-badge">React + Vite</span>
              <span className="tech-badge">SheetJS</span>
              <span className="tech-badge">Export PDF/Excel</span>
            </div>
            {/* Dark mode toggle ở header */}
            <button
              className="dark-toggle-header"
              onClick={toggleDark}
              title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              <span className="toggle-thumb" />
              <span className="toggle-icon">{darkMode ? "☀️" : "🌙"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {/* Upload zone */}
        <section className="section-upload">
          <FileUpload />
        </section>

        {/* Filter + Schedule */}
        {hasData && (
          <>
            <section className="section-filter">
              <FilterPanel darkMode={darkMode} onToggleDark={toggleDark} />
              <StatsBar />
            </section>

            <section className="section-schedule">
              {viewMode === "table" ? <TableView /> : <CardView />}
            </section>
          </>
        )}

        {/* Welcome state */}
        {!hasData && (
          <div className="welcome-section">
            <div className="welcome-grid">
              <FeatureCard icon="📂" title="Tải file Excel" desc="Kéo thả hoặc nhấn chọn file .xlsx lịch học. Tự động xử lý ô ghép (merged cells)." />
              <FeatureCard icon="🔍" title="Lọc thông minh" desc="Chọn lớp học, giảng viên, hội trường, đơn vị giảng dạy. Tìm kiếm toàn văn nhanh chóng." />
              <FeatureCard icon="📊" title="2 chế độ hiển thị" desc="Xem dạng Bảng hoặc Thẻ (Cards), phân chia Sáng (5 tiết), Chiều (4 tiết), Tối (4 tiết) trực quan." />
              <FeatureCard icon="🌗" title="Sáng / Tối" desc="Hỗ trợ chế độ sáng và tối. Tự động lưu tùy chọn giao diện của bạn." />
            </div>
            <div className="format-hint">
              <h3>📋 Cấu trúc file Excel hỗ trợ</h3>
              <div className="col-list">
                {["LỚP HỌC", "THỜI GIAN & THỨ", "BUỔI HỌC", "SỐ TIẾT", "PHÂN KHÂU", "GIẢNG VIÊN", "ĐƠN VỊ GIẢNG DẠY", "HỘI TRƯỜNG", "CƠ SỞ"].map((c) => (
                  <span key={c} className="col-chip">{c}</span>
                ))}
              </div>
              <p className="format-note">✅ Tự động phát hiện hàng tiêu đề • Xử lý ô ghép (merged cells) • Bỏ qua dòng trống</p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Ứng dụng tra cứu lịch học • Hỗ trợ: xlsx, xls • Xuất: PDF, Excel</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default function App() {
  return (
    <ScheduleProvider>
      <AppContent />
    </ScheduleProvider>
  );
}
