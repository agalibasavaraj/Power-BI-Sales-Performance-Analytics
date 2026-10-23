import fs from 'fs';
import path from 'path';

const datasetPath = path.resolve(process.cwd(), 'src', 'data', 'dataset.json');
const rawData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
const cleanRecords = rawData.records;

cleanRecords.forEach((r: any) => {
  const oDate = new Date(r.Order_Date);
  const sDate = new Date(r.Ship_Date);
  const diffTime = Math.abs(sDate.getTime() - oDate.getTime());
  r.Days_To_Ship = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

function writeCsv(filepath: string, rows: any[]) {
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const line = headers.map(h => {
      let val = String(row[h] !== undefined ? row[h] : '');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    lines.push(line);
  }
  fs.writeFileSync(filepath, lines.join('\n'), 'utf-8');
}

const cleanedCsvPath = path.resolve(process.cwd(), 'Sales-Performance-Analytics', 'data', 'cleaned_sales_dataset.csv');
writeCsv(cleanedCsvPath, cleanRecords);

// Also update src/data/dataset.json with Days_To_Ship
rawData.records = cleanRecords;
fs.writeFileSync(datasetPath, JSON.stringify(rawData), 'utf-8');

console.log(`Updated cleaned_sales_dataset.csv with Days_To_Ship (${cleanRecords.length} rows).`);
