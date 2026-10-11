const XLSX = require('xlsx');
const workbook = XLSX.readFile('lich_hoc_mau.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
console.log(JSON.stringify(XLSX.utils.sheet_to_json(sheet).slice(0, 5), null, 2));
