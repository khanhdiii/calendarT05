/**
 * exportHelpers.js
 * Xuất dữ liệu lịch học ra PDF và Excel
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Xuất lịch học ra file Excel (.xlsx)
 */
export function exportToExcel(records, filterInfo) {
  const { lopHoc = "TatCa", tuanFilter = "" } = filterInfo || {};

  const rows = records.map((r) => ({
    "Thứ / Ngày": r.thoiGian || "",
    "Buổi học": r.buoiHoc || "",
    "Số tiết": r.soTiet || "",
    "Phân khâu": r.phanKhau || "",
    "Môn học": r.monHoc || "",
    "Giảng viên": r.giangVien || "",
    "Đơn vị": r.donVi || "",
    "Hội trường": r.hoiTruong || "",
    "Cơ sở": r.coSo || "",
    "Lớp học": r.lopHoc || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Độ rộng cột
  ws["!cols"] = [
    { wch: 22 }, { wch: 10 }, { wch: 8 }, { wch: 20 }, { wch: 25 },
    { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lịch học");

  const filename = `LichHoc_${lopHoc.replace(/\s+/g, "_")}${tuanFilter ? "_T" + tuanFilter : ""}.xlsx`;
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), filename);
}

/**
 * Xuất lịch học ra PDF
 * Sử dụng font Unicode (base64) - fallback dùng font chuẩn
 */
export function exportToPDF(records, filterInfo) {
  const { lopHoc = "Tất cả", tuanFilter = "" } = filterInfo || {};

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Tiêu đề
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`LICH HOC - LOP: ${lopHoc}${tuanFilter ? " - TUAN: " + tuanFilter : ""}`, 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Xuat ngay: ${new Date().toLocaleDateString("vi-VN")}`, 14, 23);

  const tableData = records.map((r) => [
    r.thoiGian || "",
    r.buoiHoc || "",
    r.soTiet || "",
    r.phanKhau || "",
    r.monHoc || "",
    r.giangVien || "",
    r.hoiTruong || "",
    r.coSo || "",
    r.lopHoc || "",
  ]);

  autoTable(doc, {
    startY: 28,
    head: [[
      "Thu / Ngay", "Buoi", "Tiet", "Phan khau", "Mon hoc",
      "Giang vien", "Hoi truong", "Co so", "Lop hoc",
    ]],
    body: tableData,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 14 },
      2: { cellWidth: 10 },
      3: { cellWidth: 32 },
      4: { cellWidth: 38 },
      5: { cellWidth: 30 },
      6: { cellWidth: 18 },
      7: { cellWidth: 16 },
      8: { cellWidth: 25 },
    },
    margin: { left: 10, right: 10 },
  });

  const filename = `LichHoc_${lopHoc.replace(/\s+/g, "_")}${tuanFilter ? "_T" + tuanFilter : ""}.pdf`;
  doc.save(filename);
}
