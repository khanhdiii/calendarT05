/**
 * excelParser.js
 * Đọc và làm sạch dữ liệu từ file Excel lịch học
 * Xử lý merged cells bằng cách forward-fill giá trị
 */
import * as XLSX from "xlsx";

// Ánh xạ tên cột từ Excel sang key nội bộ
const COLUMN_MAP = {
  // Các biến thể tên cột có thể gặp trong Excel
  "LỚP HỌC": "lopHoc",
  "LOP HOC": "lopHoc",
  "LỚP": "lopHoc",
  "THỜI GIAN & THỨ": "thoiGian",
  "THỜI GIAN": "thoiGian",
  "THOI GIAN & THU": "thoiGian",
  "THOI GIAN": "thoiGian",
  "NGÀY": "thoiGian",
  "BUỔI HỌC": "buoiHoc",
  "BUOI HOC": "buoiHoc",
  "BUỔI": "buoiHoc",
  "SỐ TIẾT": "soTiet",
  "SO TIET": "soTiet",
  "TIẾT": "soTiet",
  "PHÂN KHÂU": "phanKhau",
  "PHAN KHAU": "phanKhau",
  "PHÂN PHỐI": "phanKhau",
  "GIẢNG VIÊN": "giangVien",
  "GIANG VIEN": "giangVien",
  "GIÁO VIÊN": "giangVien",
  "ĐƠN VỊ GIẢNG DẠY": "donVi",
  "DON VI GIANG DAY": "donVi",
  "ĐƠN VỊ": "donVi",
  "HỘI TRƯỜNG": "hoiTruong",
  "HOI TRUONG": "hoiTruong",
  "PHÒNG": "hoiTruong",
  "PHONG": "hoiTruong",
  "CƠ SỞ": "coSo",
  "CO SO": "coSo",
  "MÔN HỌC": "monHoc",
  "MON HOC": "monHoc",
  "MÔN": "monHoc",
  "TÊN MÔN": "monHoc",
};

/**
 * Chuẩn hóa chuỗi để so sánh tên cột
 */
function normalizeHeader(str) {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

/**
 * Tìm header row - hàng chứa tên các cột chính
 */
function findHeaderRow(ws) {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
  const keyColumns = ["LOP HOC", "BUOI HOC", "GIANG VIEN"];

  for (let r = range.s.r; r <= Math.min(range.s.r + 15, range.e.r); r++) {
    let matchCount = 0;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v) {
        const normalized = normalizeHeader(cell.v);
        if (keyColumns.some((k) => normalized.includes(k))) {
          matchCount++;
        }
      }
    }
    if (matchCount >= 2) return r;
  }
  return 0;
}

/**
 * Xử lý merged cells: forward-fill theo cột dọc (vertical)
 */
function expandMergedCells(ws) {
  if (!ws["!merges"]) return ws;

  const merges = ws["!merges"];
  merges.forEach((merge) => {
    const topLeftCell = ws[XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c })];
    if (!topLeftCell) return;

    for (let r = merge.s.r; r <= merge.e.r; r++) {
      for (let c = merge.s.c; c <= merge.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (r !== merge.s.r || c !== merge.s.c) {
          ws[addr] = { ...topLeftCell };
        }
      }
    }
  });
  return ws;
}

/**
 * Chuyển đổi serial date của Excel sang chuỗi ngày dd/mm/yyyy
 */
function excelDateToString(serial) {
  if (!serial || isNaN(serial)) return String(serial || "");
  try {
    const date = XLSX.SSF.parse_date_code(serial);
    if (date) {
      const d = String(date.d).padStart(2, "0");
      const m = String(date.m).padStart(2, "0");
      return `${d}/${m}/${date.y}`;
    }
  } catch {
    // không phải date serial
  }
  return String(serial);
}

/**
 * Làm sạch giá trị ô
 */
function cleanValue(cell) {
  if (!cell || cell.v === null || cell.v === undefined) return "";
  if (cell.t === "d") {
    const d = new Date(cell.v);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }
  if (cell.t === "n" && cell.w && /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(cell.w)) {
    return cell.w;
  }
  return String(cell.v).trim();
}

/**
 * Hàm chính: Parse file Excel → mảng record lịch học
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: false,
          cellNF: true,
          cellStyles: false,
        });

        const allRecords = [];
        const allSheets = workbook.SheetNames;

        for (const sheetName of allSheets) {
          let ws = workbook.Sheets[sheetName];
          if (!ws || !ws["!ref"]) continue;

          // Expand merged cells trước khi đọc
          ws = expandMergedCells(ws);

          const headerRow = findHeaderRow(ws);
          const range = XLSX.utils.decode_range(ws["!ref"]);

          // Build column map từ header row
          const colKeyMap = {}; // colIndex -> internalKey
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })];
            if (!cell || !cell.v) continue;
            const normalized = normalizeHeader(cell.v);

            // Tìm key tương ứng
            for (const [pattern, key] of Object.entries(COLUMN_MAP)) {
              if (normalized.includes(normalizeHeader(pattern))) {
                if (!Object.values(colKeyMap).includes(key)) {
                  colKeyMap[c] = key;
                }
                break;
              }
            }
          }

          // Kiểm tra có đủ cột quan trọng không
          const foundKeys = Object.values(colKeyMap);
          if (!foundKeys.includes("lopHoc") && !foundKeys.includes("giangVien")) {
            continue; // Sheet này không phải dữ liệu lịch
          }

          // Đọc dữ liệu từ hàng sau header
          for (let r = headerRow + 1; r <= range.e.r; r++) {
            const record = { _sheet: sheetName, _row: r };
            let hasData = false;

            for (const [colIdx, key] of Object.entries(colKeyMap)) {
              const cell = ws[XLSX.utils.encode_cell({ r, c: parseInt(colIdx) })];
              const val = cleanValue(cell);
              record[key] = val;
              if (val) hasData = true;
            }

            // Bỏ qua dòng trống hoàn toàn
            if (!hasData) continue;

            // Bỏ qua dòng là tiêu đề lặp lại
            const lopVal = (record.lopHoc || "").toUpperCase();
            if (
              lopVal === "LỚP HỌC" ||
              lopVal === "LOP HOC" ||
              lopVal === "LỚP" ||
              normalizeHeader(lopVal).includes("LOP HOC")
            ) continue;

            // Bỏ qua dòng không có lớp và không có giảng viên
            if (!record.lopHoc && !record.giangVien) continue;

            allRecords.push(record);
          }
        }

        resolve(allRecords);
      } catch (err) {
        reject(new Error("Lỗi đọc file Excel: " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Không thể đọc file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Trích xuất danh sách unique có sắp xếp
 */
export function extractUniqueValues(records, key) {
  const set = new Set();
  records.forEach((r) => {
    const val = (r[key] || "").trim();
    if (val) set.add(val);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
}

/**
 * Parse chuỗi ngày: "15/10/2024 Thứ 3" → { date: "15/10/2024", thu: "Thứ 3", dateObj: Date }
 */
export function parseDateString(str) {
  if (!str) return { date: "", thu: "", dateObj: null, sortKey: 9999999 };
  const s = str.trim();

  // Pattern: dd/mm/yyyy
  const dateMatch = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  // Pattern: Thứ X
  const thuMatch = s.match(/(thứ\s*\d+|thứ\s*[2-7]|chủ\s*nhật)/i);

  let dateStr = "";
  let dateObj = null;
  let thu = "";

  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    let year = parseInt(dateMatch[3]);
    if (year < 100) year += 2000;
    dateStr = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    dateObj = new Date(year, month - 1, day);
  }

  if (thuMatch) {
    thu = thuMatch[0].trim();
    thu = thu.charAt(0).toUpperCase() + thu.slice(1);
  } else if (dateObj) {
    const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    thu = days[dateObj.getDay()];
  }

  const sortKey = dateObj ? dateObj.getTime() : 9999999;

  return { date: dateStr || s, thu, dateObj, sortKey };
}

/**
 * Parse phân khâu string → array of { type, count }
 * "BT:2; TH:2;" → [{ type: "BT", count: 2, label: "Bài tập" }, ...]
 */
export function parsePhanKhau(str) {
  if (!str) return [];
  const PHAN_KHAU_LABELS = {
    BT: "Bài tập",
    TH: "Thực hành",
    LT: "Lý thuyết",
    BC: "Bài cũ",
    GĐ: "Giải đáp",
    KT: "Kiểm tra",
    TC: "Tổng cộng",
    ÔN: "Ôn tập",
    ON: "Ôn tập",
    HB: "Hướng bài",
    TT: "Thực tập",
    ĐA: "Đồ án",
    DA: "Đồ án",
  };
  const results = [];
  const parts = str.split(/[;,]+/);
  parts.forEach((part) => {
    const m = part.trim().match(/^([A-ZĐÔÂÊa-zđôâê]+)\s*:\s*(\d+)$/i);
    if (m) {
      const type = m[1].toUpperCase();
      results.push({
        type,
        count: parseInt(m[2]),
        label: PHAN_KHAU_LABELS[type] || type,
      });
    }
  });
  return results;
}
