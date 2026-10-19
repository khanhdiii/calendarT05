/**
 * pdfParser.js
 * Đọc và phân tích file PDF lịch dạy học dạng bảng (CSND) thành danh sách records
 */
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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

function normalizeBuoi(str) {
  if (!str) return '';
  const s = String(str).trim();
  const lower = s.toLowerCase();
  if (lower.includes('sáng') || lower.includes('sang')) return 'Sáng';
  if (lower.includes('chiều') || lower.includes('chieu')) return 'Chiều';
  if (lower.includes('tối') || lower.includes('toi')) return 'Tối';
  return s;
}

export async function parsePdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allRecords = [];
  let currentLopHoc = '';
  let currentQsl = '';
  let currentTtl = '';

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
      if (
        textAll.includes('LỊCH DẠY HỌC') ||
        textAll.includes('TRƯỜNG ĐẠI HỌC') ||
        textAll.includes('PHÒNG QLĐT') ||
        textAll.includes('Độc lập - Tự do') ||
        textAll.includes('GIẢNG VIÊN') ||
        textAll.includes('LỚP HỌC')
      ) {
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

      const isTotalRow = (!row.giangVien && !row.phanKhau && !row.hoiTruong && row.soTiet && parseInt(row.soTiet) > 10);
      if (isTotalRow) continue;

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

      allRecords.push({
        _sheet: `Trang ${p}`,
        lopHoc: (row.lopHoc || '').trim(),
        thoiGian: (row.thoiGian || '').trim(),
        thu: (row.thu || '').trim(),
        buoiHoc: normalizeBuoi(row.buoiHoc),
        soTiet: numTiet !== '' ? String(numTiet) : '',
        phanKhau: (row.phanKhau || '').trim(),
        giangVien: (row.giangVien || '').trim(),
        donVi: (row.donVi || '').trim(),
        hoiTruong: (row.hoiTruong || '').trim(),
        coSo: (row.coSo || '').trim(),
        monHoc: (row.monHoc || '').trim(),
        qsl: (row.qsl || '').trim(),
        ttl: (row.ttl || '').trim(),
      });
    }
  }

  return allRecords;
}
