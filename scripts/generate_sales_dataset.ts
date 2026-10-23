import fs from 'fs';
import path from 'path';

// Seeded random number generator for reproducible, realistic business data
let seed = 42;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
function randInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

const regions = [
  { region: 'West', states: ['California', 'Washington', 'Oregon', 'Arizona', 'Nevada'], cities: ['Los Angeles', 'Seattle', 'Portland', 'Phoenix', 'Las Vegas'] },
  { region: 'East', states: ['New York', 'Pennsylvania', 'Massachusetts', 'New Jersey', 'Ohio'], cities: ['New York City', 'Philadelphia', 'Boston', 'Newark', 'Columbus'] },
  { region: 'Central', states: ['Illinois', 'Texas', 'Michigan', 'Wisconsin', 'Indiana'], cities: ['Chicago', 'Dallas', 'Detroit', 'Milwaukee', 'Indianapolis'] },
  { region: 'South', states: ['Florida', 'Georgia', 'North Carolina', 'Virginia', 'Tennessee'], cities: ['Miami', 'Atlanta', 'Charlotte', 'Richmond', 'Nashville'] }
];

const customerSegments = ['Consumer', 'Corporate', 'Home Office'];
const shipModes = ['Standard Class', 'Second Class', 'First Class', 'Same Day'];

interface ProductCatalogItem {
  category: string;
  subCategory: string;
  productName: string;
  basePrice: number;
  baseMargin: number; // e.g. 0.25 for 25% margin
}

const catalog: ProductCatalogItem[] = [
  // Technology (High margin, high ticket)
  { category: 'Technology', subCategory: 'Phones', productName: 'Apple iPhone 14 Pro 128GB', basePrice: 899.99, baseMargin: 0.28 },
  { category: 'Technology', subCategory: 'Phones', productName: 'Samsung Galaxy S23 Ultra', basePrice: 1049.99, baseMargin: 0.26 },
  { category: 'Technology', subCategory: 'Phones', productName: 'Google Pixel 7 Pro 256GB', basePrice: 749.99, baseMargin: 0.25 },
  { category: 'Technology', subCategory: 'Accessories', productName: 'Logitech MX Master 3S Mouse', basePrice: 99.99, baseMargin: 0.35 },
  { category: 'Technology', subCategory: 'Accessories', productName: 'Anker USB-C Power Bank 26800mAh', basePrice: 65.99, baseMargin: 0.32 },
  { category: 'Technology', subCategory: 'Copiers', productName: 'Canon imageCLASS Multifunction Laser Printer', basePrice: 1299.99, baseMargin: 0.38 },
  { category: 'Technology', subCategory: 'Copiers', productName: 'HP LaserJet Enterprise Flow MFP', basePrice: 1899.99, baseMargin: 0.40 },
  { category: 'Technology', subCategory: 'Machines', productName: 'Zebra Thermal Label Printer ZD421', basePrice: 420.00, baseMargin: 0.22 },
  { category: 'Technology', subCategory: 'Machines', productName: 'Brother Professional High-Speed Scanner', basePrice: 380.00, baseMargin: 0.24 },

  // Furniture (Mixed margin, Tables has heavy discount bleed)
  { category: 'Furniture', subCategory: 'Chairs', productName: 'Herman Miller Aeron Ergonomic Chair', basePrice: 620.00, baseMargin: 0.18 },
  { category: 'Furniture', subCategory: 'Chairs', productName: 'Steelcase Gesture Executive Task Chair', basePrice: 740.00, baseMargin: 0.19 },
  { category: 'Furniture', subCategory: 'Chairs', productName: 'Hon Mid-Back Mesh Work Chair', basePrice: 180.00, baseMargin: 0.15 },
  { category: 'Furniture', subCategory: 'Tables', productName: 'Bush Furniture Conference Table 8ft', basePrice: 850.00, baseMargin: 0.05 }, // vulnerable to discounts!
  { category: 'Furniture', subCategory: 'Tables', productName: 'BDI Moduform Executive Training Table', basePrice: 620.00, baseMargin: 0.04 }, // vulnerable to discounts!
  { category: 'Furniture', subCategory: 'Tables', productName: 'Safco Modular Collaborative Table', basePrice: 480.00, baseMargin: 0.06 }, // vulnerable to discounts!
  { category: 'Furniture', subCategory: 'Bookcases', productName: 'Sauder Heritage Hill 5-Shelf Bookcase', basePrice: 240.00, baseMargin: 0.14 },
  { category: 'Furniture', subCategory: 'Furnishings', productName: 'Deflect-O Desk Mat with Anti-Static', basePrice: 42.00, baseMargin: 0.22 },
  { category: 'Furniture', subCategory: 'Furnishings', productName: 'Eldon Decorative Table Lamp LED', basePrice: 68.00, baseMargin: 0.25 },

  // Office Supplies (High volume, steady margins)
  { category: 'Office Supplies', subCategory: 'Storage', productName: 'Fellowes Bankers Box Heavy Duty (Pack of 12)', basePrice: 58.50, baseMargin: 0.30 },
  { category: 'Office Supplies', subCategory: 'Storage', productName: 'Sterilite 3-Drawer Heavy Storage Cart', basePrice: 44.00, baseMargin: 0.28 },
  { category: 'Office Supplies', subCategory: 'Binders', productName: 'Avery Heavy-Duty 3-Ring Binder 2-inch', basePrice: 18.50, baseMargin: 0.36 },
  { category: 'Office Supplies', subCategory: 'Binders', productName: 'Wilson Jones Heavy Duty Vinyl Binder', basePrice: 14.20, baseMargin: 0.34 },
  { category: 'Office Supplies', subCategory: 'Paper', productName: 'Hammermill Premium Multipurpose Copy Paper (5000 Sheets)', basePrice: 49.99, baseMargin: 0.24 },
  { category: 'Office Supplies', subCategory: 'Paper', productName: 'Xerox High Performance Recycled White Paper', basePrice: 38.00, baseMargin: 0.22 },
  { category: 'Office Supplies', subCategory: 'Appliances', productName: 'Fellowes Powershred Cross-Cut Paper Shredder', basePrice: 165.00, baseMargin: 0.26 },
  { category: 'Office Supplies', subCategory: 'Appliances', productName: 'Keurig K-Elite Single-Serve Commercial Coffee Maker', basePrice: 189.99, baseMargin: 0.25 },
  { category: 'Office Supplies', subCategory: 'Art', productName: 'Prismacolor Premier Colored Pencils Set', basePrice: 32.50, baseMargin: 0.38 },
  { category: 'Office Supplies', subCategory: 'Fasteners', productName: 'Swingline Heavy Duty Desktop Stapler', basePrice: 24.00, baseMargin: 0.40 },
  { category: 'Office Supplies', subCategory: 'Envelopes', productName: 'Quality Park Self-Seal Security Envelopes (500ct)', basePrice: 29.00, baseMargin: 0.32 },
  { category: 'Office Supplies', subCategory: 'Labels', productName: 'Avery Address Mailing Labels (Laser/Inkjet)', basePrice: 16.50, baseMargin: 0.42 }
];

// 40 distinct customers
const customers: { id: string; name: string; segment: string; state: string; city: string; region: string }[] = [];
const customerNames = [
  'Claire Gute', 'Brosina Hoffman', 'Darrin Martin', 'Sean O\'Donnell', 'Zuschuss Donatelli',
  'Eric Hoffmann', 'Ruben Dartt', 'Ken Black', 'Sandra Flanagan', 'Tamara Chand',
  'Harold Pawlan', 'Pete Kriz', 'Shivangini Patel', 'Dave Brooks', 'Pauline Levitt',
  'Arthur Prichep', 'Daniel Ragusa', 'Linda Cazamias', 'John Lee', 'Maria Zontine',
  'Justin Deggeller', 'Tom Boeckenhauer', 'Aimee Bixby', 'Hunter Lopez', 'Sanjit Chand',
  'Lena Creighton', 'Kelly Collister', 'Anthony Garverick', 'Quincy Jones', 'Denny Ward',
  'Alejandro Savely', 'Christopher Martinez', 'Stephanie Phelps', 'Michael Stewart', 'Valerie Mitchum',
  'Patrick Jones', 'Tracy Blumstein', 'Corey Roper', 'Karen Ferguson', 'Dean Perchic'
];

customerNames.forEach((name, idx) => {
  const regObj = pick(regions);
  const cityIdx = randInt(0, regObj.cities.length - 1);
  customers.push({
    id: `CUST-${1000 + idx}`,
    name,
    segment: customerSegments[idx % customerSegments.length],
    state: regObj.states[cityIdx],
    city: regObj.cities[cityIdx],
    region: regObj.region
  });
});

interface SalesRecord {
  Row_ID: number;
  Order_ID: string;
  Order_Date: string;
  Ship_Date: string;
  Ship_Mode: string;
  Customer_ID: string;
  Customer_Name: string;
  Segment: string;
  Country: string;
  City: string;
  State: string;
  Postal_Code: string;
  Region: string;
  Product_ID: string;
  Category: string;
  Sub_Category: string;
  Product_Name: string;
  Sales: number;
  Quantity: number;
  Discount: number;
  Profit: number;
}

const records: SalesRecord[] = [];
let rowCounter = 1;

// Date range: 2023-01-01 to 2025-12-31 (3 full calendar years for MoM and YoY calculations)
const startDate = new Date('2023-01-01T00:00:00Z').getTime();
const endDate = new Date('2025-12-31T23:59:59Z').getTime();

// Generate ~800 orders, some with multiple lines (yielding ~1,400 rows total)
const totalOrders = 750;

for (let o = 1; o <= totalOrders; o++) {
  const orderNum = 10000 + o;
  const orderDateTs = startDate + random() * (endDate - startDate);
  const orderDate = new Date(orderDateTs);
  const orderYear = orderDate.getUTCFullYear();
  const orderMonth = orderDate.getUTCMonth(); // 0 to 11

  // Realistic shipping: 1 to 6 days later
  const shipDays = randInt(1, 5);
  const shipDate = new Date(orderDateTs + shipDays * 86400000);

  const orderDateStr = orderDate.toISOString().split('T')[0];
  const shipDateStr = shipDate.toISOString().split('T')[0];

  const orderId = `CA-${orderYear}-${orderNum}`;
  const customer = pick(customers);
  const shipMode = pick(shipModes);

  // 1 to 3 items per order (creates real multi-line order relationship!)
  const itemsInOrder = randInt(1, 3);

  for (let i = 0; i < itemsInOrder; i++) {
    const prod = pick(catalog);
    const prodId = `PROD-${prod.category.substring(0, 3).toUpperCase()}-${prod.subCategory.substring(0, 3).toUpperCase()}-${randInt(10, 99)}`;
    const quantity = randInt(1, 7);

    // Business realism:
    // November & December have higher sales (Holiday surge)
    let seasonalBoost = 1.0;
    if (orderMonth === 10 || orderMonth === 11) {
      seasonalBoost = 1.25;
    }

    // Discounts:
    // Tables frequently have steep promotional discounts (0.20 to 0.45) causing real losses!
    let discount = 0;
    if (prod.subCategory === 'Tables') {
      discount = pick([0.15, 0.20, 0.25, 0.30, 0.40, 0.50]);
    } else if (prod.category === 'Technology') {
      discount = pick([0.0, 0.0, 0.05, 0.10]);
    } else {
      discount = pick([0.0, 0.0, 0.0, 0.10, 0.15, 0.20]);
    }

    const grossSales = prod.basePrice * quantity * seasonalBoost;
    const finalSales = Math.round(grossSales * (1 - discount) * 100) / 100;

    // Cost = basePrice * (1 - baseMargin) * quantity * seasonalBoost
    const baseCost = (prod.basePrice * (1 - prod.baseMargin)) * quantity * seasonalBoost;
    // Profit = finalSales - baseCost
    // When discount > baseMargin, profit goes negative! (Crucial analytical insight)
    const profit = Math.round((finalSales - baseCost) * 100) / 100;

    const postalCode = customer.region === 'West' ? '90001' : customer.region === 'East' ? '10001' : customer.region === 'Central' ? '60601' : '33101';

    records.push({
      Row_ID: rowCounter++,
      Order_ID: orderId,
      Order_Date: orderDateStr,
      Ship_Date: shipDateStr,
      Ship_Mode: shipMode,
      Customer_ID: customer.id,
      Customer_Name: customer.name,
      Segment: customer.segment,
      Country: 'United States',
      City: customer.city,
      State: customer.state,
      Postal_Code: postalCode,
      Region: customer.region,
      Product_ID: prodId,
      Category: prod.category,
      Sub_Category: prod.subCategory,
      Product_Name: prod.productName,
      Sales: finalSales,
      Quantity: quantity,
      Discount: discount,
      Profit: profit
    });
  }
}

// Sort by Order_Date
records.sort((a, b) => a.Order_Date.localeCompare(b.Order_Date));
// Re-assign Row_ID sequentially
records.forEach((r, idx) => { r.Row_ID = idx + 1; });

// Target directory
const baseDir = path.resolve(process.cwd(), 'Sales-Performance-Analytics');
const dataDir = path.join(baseDir, 'data');
const dashDir = path.join(baseDir, 'dashboard');
const sqlDir = path.join(baseDir, 'sql');
const docsDir = path.join(baseDir, 'docs');
const screensDir = path.join(baseDir, 'screenshots');

[baseDir, dataDir, dashDir, sqlDir, docsDir, screensDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Write CSV Helper
function writeCsv<T extends object>(filepath: string, rows: T[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]) as (keyof T)[];
  const csvLines = [headers.join(',')];
  for (const row of rows) {
    const line = headers.map(h => {
      let val = String(row[h]);
      if (val.includes(',') || val.includes('"')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    csvLines.push(line);
  }
  fs.writeFileSync(filepath, csvLines.join('\n'), 'utf-8');
}

// 1. Raw Sales Data
writeCsv(path.join(dataDir, 'raw_sales_data.csv'), records);

// 2. Cleaned Sales Data (Fact table)
writeCsv(path.join(dataDir, 'cleaned_sales_dataset.csv'), records);

// 3. Normalized Dimension: Dim_Product
const productMap = new Map<string, { Product_ID: string; Product_Name: string; Category: string; Sub_Category: string }>();
records.forEach(r => {
  if (!productMap.has(r.Product_ID)) {
    productMap.set(r.Product_ID, {
      Product_ID: r.Product_ID,
      Product_Name: r.Product_Name,
      Category: r.Category,
      Sub_Category: r.Sub_Category
    });
  }
});
writeCsv(path.join(dataDir, 'dim_product.csv'), Array.from(productMap.values()));

// 4. Normalized Dimension: Dim_Customer
const custMap = new Map<string, { Customer_ID: string; Customer_Name: string; Segment: string }>();
records.forEach(r => {
  if (!custMap.has(r.Customer_ID)) {
    custMap.set(r.Customer_ID, {
      Customer_ID: r.Customer_ID,
      Customer_Name: r.Customer_Name,
      Segment: r.Segment
    });
  }
});
writeCsv(path.join(dataDir, 'dim_customer.csv'), Array.from(custMap.values()));

// 5. Normalized Dimension: Dim_Geography
const geoMap = new Map<string, { Postal_Code: string; City: string; State: string; Region: string; Country: string }>();
records.forEach(r => {
  const key = `${r.Postal_Code}-${r.City}`;
  if (!geoMap.has(key)) {
    geoMap.set(key, {
      Postal_Code: r.Postal_Code,
      City: r.City,
      State: r.State,
      Region: r.Region,
      Country: r.Country
    });
  }
});
writeCsv(path.join(dataDir, 'dim_geography.csv'), Array.from(geoMap.values()));

// 6. Time Intelligence Dimension: Dim_Calendar (2023-01-01 to 2025-12-31)
const calendarRows: {
  Date: string;
  Year: number;
  Month_Number: number;
  Month_Name: string;
  Month_Year: string;
  Quarter: string;
  Quarter_Year: string;
  Day_of_Week: number;
  Day_Name: string;
  Is_Weekend: boolean;
}[] = [];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const curDate = new Date('2023-01-01T00:00:00Z');
const calEnd = new Date('2025-12-31T00:00:00Z');

while (curDate <= calEnd) {
  const dStr = curDate.toISOString().split('T')[0];
  const yr = curDate.getUTCFullYear();
  const mNum = curDate.getUTCMonth() + 1;
  const mName = monthNames[curDate.getUTCMonth()];
  const qNum = Math.ceil(mNum / 3);
  const dow = curDate.getUTCDay();

  calendarRows.push({
    Date: dStr,
    Year: yr,
    Month_Number: mNum,
    Month_Name: mName,
    Month_Year: `${mName.substring(0, 3)} ${yr}`,
    Quarter: `Q${qNum}`,
    Quarter_Year: `Q${qNum} ${yr}`,
    Day_of_Week: dow,
    Day_Name: dayNames[dow],
    Is_Weekend: dow === 0 || dow === 6
  });

  curDate.setUTCDate(curDate.getUTCDate() + 1);
}
writeCsv(path.join(dataDir, 'dim_calendar.csv'), calendarRows);

// Also export a JSON file for the client-side React Applet to load instantly!
const appDataDir = path.resolve(process.cwd(), 'src', 'data');
if (!fs.existsSync(appDataDir)) fs.mkdirSync(appDataDir, { recursive: true });

fs.writeFileSync(path.join(appDataDir, 'dataset.json'), JSON.stringify({
  records,
  products: Array.from(productMap.values()),
  customers: Array.from(custMap.values()),
  geography: Array.from(geoMap.values()),
  calendarSummary: { minDate: '2023-01-01', maxDate: '2025-12-31', totalDays: calendarRows.length }
}), 'utf-8');

console.log(`Generated ${records.length} sales transaction rows.`);
console.log(`Unique Orders: ${new Set(records.map(r => r.Order_ID)).size}`);
console.log(`Unique Customers: ${custMap.size}`);
console.log(`Unique Products: ${productMap.size}`);
