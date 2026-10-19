/**
 * FileUpload.jsx
 * Component upload file Excel với drag & drop
 */
import { useRef, useState } from "react";
import { useSchedule } from "../hooks/useScheduleStore";

export default function FileUpload() {
  const { state, loadFile, clearData } = useSchedule();
  const { loading, error, fileName, rawRecords } = state;
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "pdf"].includes(ext)) {
      alert("Vui lòng chọn file Excel (.xlsx, .xls) hoặc file PDF (.pdf)");
      return;
    }
    loadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  if (rawRecords.length > 0) {
    return (
      <div className="file-loaded-bar">
        <div className="file-info">
          <span className="file-icon">📊</span>
          <span className="file-name">{fileName}</span>
          <span className="record-count">{rawRecords.length} dòng dữ liệu</span>
        </div>
        <button className="btn-change-file" onClick={() => { clearData(); fileRef.current.value = ""; }}>
          ↩ Đổi file
        </button>
        <input type="file" ref={fileRef} accept=".xlsx,.xls,.pdf" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])} />
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div
        className={`upload-zone ${dragging ? "dragging" : ""} ${loading ? "loading" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !loading && fileRef.current.click()}
      >
        {loading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <p>Đang đọc dữ liệu lịch học...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📂</div>
            <h3>Kéo thả file Excel hoặc PDF vào đây</h3>
            <p>hoặc <span className="upload-link">nhấn để chọn file</span></p>
            <p className="upload-hint">Hỗ trợ: .xlsx, .xls, .pdf • Tự động nhận diện cấu trúc lịch học</p>
          </>
        )}
      </div>

      {error && (
        <div className="error-box">
          <span>⚠️</span> {error}
        </div>
      )}

      <input
        type="file"
        ref={fileRef}
        accept=".xlsx,.xls,.pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
