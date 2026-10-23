import fs from 'fs';
import path from 'path';

const datasetPath = path.resolve(process.cwd(), 'src', 'data', 'dataset.json');
const rawData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
const cleanRecords = rawData.records;

// Transform clean records into genuine raw, messy transactional data
const rawRows: any[] = [];

cleanRecords.forEach((r: any, idx: number) => {
  let cat = r.Category;
  let subCat = r.Sub_Category;
  let seg = r.Segment;
  let custName = r.Customer_Name;
  let city = r.City;
  let postal = r.Postal_Code;
  let orderDate = r.Order_Date;
  let shipDate = r.Ship_Date;

  // 1. Inconsistent casing on 15% of records
  if (idx % 7 === 0) cat = cat.toLowerCase();
  else if (idx % 11 === 0) cat = cat.toUpperCase();

  if (idx % 5 === 0) seg = seg.toLowerCase();
  else if (idx % 13 === 0) seg = seg.toUpperCase();

  // 2. Trailing/leading whitespaces on text
  if (idx % 4 === 0) custName = `  ${custName} `;
  if (idx % 6 === 0) subCat = ` ${subCat}  `;
  if (idx % 8 === 0) city = `${city}   `;

  // 3. Raw postal codes (missing leading zeros or padding)
  if (postal === '01001') {
    postal = '1001'; // Truncated integer format in raw export!
  } else if (idx % 9 === 0) {
    postal = ` ${postal} `;
  }

  // 4. Date format variations in raw exports
  if (idx % 10 === 0) {
    orderDate = `${orderDate} 00:00:00`;
  } else if (idx % 14 === 0) {
    orderDate = orderDate.replace(/-/g, '/');
  }

  rawRows.push({
    Row_ID: r.Row_ID,
    Order_ID: r.Order_ID,
    Order_Date: orderDate,
    Ship_Date: shipDate,
    Ship_Mode: r.Ship_Mode,
    Customer_ID: r.Customer_ID,
    Customer_Name: custName,
    Segment: seg,
    Country: r.Country,
    City: city,
    State: r.State,
    Postal_Code: postal,
    Region: r.Region,
    Product_ID: r.Product_ID,
    Category: cat,
    Sub_Category: subCat,
    Product_Name: r.Product_Name,
    Sales: r.Sales,
    Quantity: r.Quantity,
    Discount: r.Discount,
    Profit: r.Profit
    // Notice: Days_To_Ship is completely missing in raw! It was added in Power Query.
  });

  // 5. Add 3 accidental duplicate scrape rows to test deduplication logic
  if (idx === 42 || idx === 118 || idx === 320) {
    rawRows.push({ ...rawRows[rawRows.length - 1], Row_ID: 9990 + idx });
  }
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

const rawPath = path.resolve(process.cwd(), 'Sales-Performance-Analytics', 'data', 'raw_sales_data.csv');
writeCsv(rawPath, rawRows);
console.log(`Generated raw messy dataset: ${rawRows.length} rows (including 3 duplicate test rows, casing anomalies, whitespace, missing Days_To_Ship).`);
