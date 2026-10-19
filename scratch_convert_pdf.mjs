import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const pdfPath = 'C:/Users/OWNER/Downloads/Tuần 12 LỊCH HỌC TUẦN 19 - 24.10.2026 - Ver 1.pdf';
const outPath1 = 'C:/Users/OWNER/Desktop/Tuần 12 LỊCH HỌC TUẦN 19 - 24.10.2026.xlsx';
const outPath2 = 'C:/Users/OWNER/Desktop/calendar/Tuần 12 LỊCH HỌC TUẦN 19 - 24.10.2026.xlsx';

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjsLib.getDocument({ data }).promise;

const COL_RANGES = [
  { key: 'ttl', min: 45, max: 80 },
  { key: 'lopHoc', min: 80, max: 195 },
  { key: 'qsl', min: 195, max: 230 },
  { key: 'monHoc', min: 230, max: 280 },
  { key: 'thoiGian', min: 280, max: 355 },
  { key: 'thu', min: 355, max: 395 },
  { key: 'buoiHoc', min: 395, max: 435 },
  { key: 'soTiet', min: 435, max: 465 },
  { key: 'phanKhau', min: 465, max: 555 },
  { key: 'giangVien', min: 555, max: 655 },
  { key: 'donVi', min: 655, max: 705 },
  { key: 'hoiTruong', min: 705, max: 748 },
  { key: 'coSo', min: 748, max: 790 },
];

const dayDateMap = {
  'Thứ 2': '19/10/2026',
  'Thứ 3': '20/10/2026',
  'Thứ 4': '21/10/2026',
  'Thứ 5': '22/10/2026',
  'Thứ 6': '23/10/2026',
  'Thứ 7': '24/10/2026',
  'Chủ nhật': '25/10/2026'
};

const rowsData = [];
let currentLopHoc = '';
let currentQsl = '';
let currentTtl = '';
let stt = 1;

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const content = await page.getTextContent();
  if (content.items.length === 0) continue;

  const rows = {};
  for (const it of content.items) {
    if (!it.str.trim()) continue;
    const y = Math.round(it.transform[5]);
    const existingKey = Object.keys(rows).find(k => Math.abs(k - y) <= 4);
    const key = existingKey ? existingKey : y;
    if (!rows[key]) rows[key] = [];
    rows[key].push({ text: it.str.trim(), x: Math.round(it.transform[4]) });
  }

  const sortedY = Object.keys(rows).sort((a, b) => b - a);
  for (const y of sortedY) {
    if (y > 390 && p === 1) continue;
    const rowItems = rows[y];
    const textAll = rowItems.map(i => i.text).join(' ');
    if (textAll.includes('LỊCH DẠY HỌC') || textAll.includes('TRƯỜNG ĐẠI HỌC') || textAll.includes('PHÒNG QLĐT') || textAll.includes('Độc lập - Tự do') || textAll.includes('GIẢNG VIÊN') || textAll.includes('LỚP HỌC')) {
      continue;
    }

    const row = {};
    for (const it of rowItems) {
      const col = COL_RANGES.find(c => it.x >= c.min && it.x < c.max);
      if (col) {
        row[col.key] = (row[col.key] ? row[col.key] + ' ' : '') + it.text;
      }
    }

    if (row.lopHoc && row.lopHoc.length > 2) {
      currentLopHoc = row.lopHoc;
    } else if (currentLopHoc) {
      row.lopHoc = currentLopHoc;
    }

    if (row.qsl) currentQsl = row.qsl;
    else row.qsl = currentQsl;

    if (row.ttl) currentTtl = row.ttl;
    else row.ttl = currentTtl;

    // Check week summary row (e.g., Thứ 7, Chiều, 21 and nothing else)
    const isTotalRow = (!row.giangVien && !row.phanKhau && !row.hoiTruong && row.soTiet && parseInt(row.soTiet) > 10);
    if (isTotalRow) continue;

    // Handle special activities
    if (!row.giangVien) {
      if (textAll.includes('ÔN THI')) {
        row.giangVien = 'ÔN THI';
        row.phanKhau = 'ÔN THI';
      } else if (textAll.includes('THI')) {
        row.giangVien = 'THI';
        row.phanKhau = 'THI';
      } else if (textAll.includes('THỰC TẬP')) {
        row.giangVien = 'THỰC TẬP';
        row.phanKhau = 'THỰC TẬP';
      }
    }

    if (!row.buoiHoc && !row.giangVien && !row.phanKhau) continue;

    if (!row.thoiGian && row.thu && dayDateMap[row.thu]) {
      row.thoiGian = dayDateMap[row.thu];
    } else if (row.thoiGian) {
      const m = row.thoiGian.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (m) row.thoiGian = m[1];
    }

    let numTiet = '';
    if (row.soTiet) {
      const parsed = parseInt(row.soTiet.trim(), 10);
      if (!isNaN(parsed) && parsed < 10) numTiet = parsed;
    }

    rowsData.push({
      'STT': stt++,
      'TTL': row.ttl ? parseInt(row.ttl, 10) : '',
      'LỚP HỌC': (row.lopHoc || '').trim(),
      'QSL': row.qsl ? parseInt(row.qsl, 10) : '',
      'MÃ HỌC PHẦN': (row.monHoc || '').trim(),
      'THỜI GIAN': (row.thoiGian || '').trim(),
      'THỨ': (row.thu || '').trim(),
      'BUỔI HỌC': (row.buoiHoc || '').trim(),
      'SỐ TIẾT': numTiet,
      'PHÂN KHÂU': (row.phanKhau || '').trim(),
      'GIẢNG VIÊN': (row.giangVien || '').trim(),
      'ĐƠN VỊ GIẢNG DẠY': (row.donVi || '').trim(),
      'HỘI TRƯỜNG': (row.hoiTruong || '').trim(),
      'CƠ SỞ': (row.coSo || '').trim()
    });
  }
}

// Build Excel workbook
const wb = XLSX.utils.book_new();

// Header row lines similar to school template
const sheetHeader = [
  ['', '', ' TRƯỜNG ĐẠI HỌC CSND', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
  ['', '', ' PHÒNG QLĐT&BDNC', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
  [],
  ['', '', 'Chính thức', '', '', '', '', '', 'Tp. Hồ Chí Minh ngày 16 tháng 10 năm 2026'],
  ['', '                          LỊCH DẠY HỌC CÁC LỚP HÌNH THỨC CHÍNH QUY'],
  ['', '                            (Tuần từ ngày 19/10/2026 đến 24/10/2026)'],
  [],
  [
    'STT', 'TTL', 'LỚP HỌC', 'QSL', 'MÃ HỌC PHẦN', 'THỜI GIAN', 'THỨ', 'BUỔI HỌC',
    'SỐ TIẾT', 'PHÂN KHÂU', 'GIẢNG VIÊN', 'ĐƠN VỊ GIẢNG DẠY', 'HỘI TRƯỜNG', 'CƠ SỞ'
  ]
];

const dataAOA = [...sheetHeader];
for (const r of rowsData) {
  dataAOA.push([
    r['STT'], r['TTL'], r['LỚP HỌC'], r['QSL'], r['MÃ HỌC PHẦN'], r['THỜI GIAN'],
    r['THỨ'], r['BUỔI HỌC'], r['SỐ TIẾT'], r['PHÂN KHÂU'], r['GIẢNG VIÊN'],
    r['ĐƠN VỊ GIẢNG DẠY'], r['HỘI TRƯỜNG'], r['CƠ SỞ']
  ]);
}

const ws = XLSX.utils.aoa_to_sheet(dataAOA);
XLSX.utils.book_append_sheet(wb, ws, '19-24.10');

XLSX.writeFile(wb, outPath1);
XLSX.writeFile(wb, outPath2);

console.log('Exported successfully:', rowsData.length, 'rows to:');
console.log('1.', outPath1);
console.log('2.', outPath2);
