/**
 * App.jsx - Root component
 */
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
          <div className="header-badges">
            <span className="tech-badge">React + Vite</span>
            <span className="tech-badge">SheetJS</span>
            <span className="tech-badge">Export PDF/Excel</span>
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
              <FilterPanel />
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
              <FeatureCard icon="🔍" title="Lọc thông minh" desc="Chọn lớp học, giảng viên, hội trường. Tìm kiếm toàn văn nhanh chóng." />
              <FeatureCard icon="📊" title="2 chế độ hiển thị" desc="Xem dạng Bảng hoặc Thẻ (Cards), phân chia rõ ràng theo Thứ và Buổi học." />
              <FeatureCard icon="⬇️" title="Xuất file" desc="Xuất lịch đã lọc ra PDF hoặc Excel để in ấn, chia sẻ cho sinh viên." />
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
