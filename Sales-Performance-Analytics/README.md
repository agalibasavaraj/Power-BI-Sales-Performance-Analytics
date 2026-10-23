# Sales Performance Analytics Dashboard — Power BI Portfolio Project

[![Power BI Desktop](https://img.shields.io/badge/Power_BI-Desktop_File_(.pbix)-F2C811?logo=powerbi&logoColor=black)](dashboard/Sales_Performance_Analytics.pbix)
[![Power BI Template](https://img.shields.io/badge/Template-(.pbit)-F2C811?logo=powerbi&logoColor=black)](dashboard/Sales_Performance_Analytics.pbit)
[![Dataset](https://img.shields.io/badge/Dataset-Synthetic_(Seed_42)-blue)](data/raw_sales_data.csv)
[![DAX](https://img.shields.io/badge/DAX-Calculated_Measures-005BA1)](docs/dax_measures.md)
[![Power Query M](https://img.shields.io/badge/Power_Query-M_Code_ETL-237346)](docs/powerquery_transformations.md)
[![SQL Validation](https://img.shields.io/badge/SQL-100%25_Reconciled_($0.00_delta)-336791?logo=postgresql&logoColor=white)](sql/02_kpi_validation.sql)
[![Star Schema](https://img.shields.io/badge/Architecture-Kimball_Star_Schema-blueviolet)](docs/data_model.md)

> **Portfolio Project for Data Analyst / BI Developer Roles**  
> **Author**: Basavaraj Agali (`agalibasavaraj06@gmail.com`)  
> **Repository Context**: Complete end-to-end Power BI analytics solution, featuring raw transactional data, documented Power Query ETL recipes, Kimball Star Schema dimensional modeling, advanced DAX time-intelligence measures, SQL reconciliation audits, and actionable commercial insights.

---

## 1. Executive Summary & Problem Statement

Modern retail and commercial enterprises face thin margins and risk unprofitable discounting when operational visibility is siloed. This project analyzes **1,445 order line items across 750 distinct orders** spanning 3 full fiscal years (2023–2025) to evaluate sales velocity, regional profitability, customer segment engagement, and promotional discount leakage.

### Core High-Level Reconciled KPIs:
- **Total Net Sales Revenue**: `$2,233,854.31`
- **Total Net Profit**: `$398,325.74`
- **Overall Operating Profit Margin**: `17.83%`
- **Total Distinct Orders**: `750`
- **Total Units Sold**: `5,842`
- **Average Order Value (AOV)**: `$2,978.47`
- **Average Discount Applied**: `8.64%` (Audited across all 1,445 line items)

### Dataset Disclosure (Synthetic Data):
* **Nature of Data**: This project uses a **statistically realistic, synthetic retail transactions dataset** generated with a deterministic fixed seed (`seed = 42`). 
* **Design Rationale**: A fixed-seed synthetic dataset was chosen to demonstrate professional end-to-end data engineering, dimensional modeling, and Power BI report design without compromising proprietary enterprise data or violating non-disclosure agreements (NDAs). The generator incorporates realistic commercial dynamics including multi-line orders, holiday Q4 seasonality, regional volume distributions, and margin vulnerabilities.

---

## 2. Power BI Files & Repository Structure

The repository includes the complete ready-to-open **`.pbix`** and **`.pbit`** files in the `dashboard/` directory:

```text
Sales-Performance-Analytics/
├── dashboard/
│   ├── Sales_Performance_Analytics.pbix  # Ready-to-open Power BI Desktop file (Canvas, Model & Measures)
│   ├── Sales_Performance_Analytics.pbit  # Power BI Template file
│   ├── PowerBI_Sales_Performance_Architecture.pbids # Data Source connector
│   ├── power_bi_theme.json               # Accessible corporate UI theme
│   └── power_bi_template_guide.md        # Step-by-step canvas build guide
├── data/
│   ├── raw_sales_data.csv          # Raw messy data (1,448 rows: whitespace, casing, truncated zip, duplicates)
│   ├── cleaned_sales_dataset.csv   # Cleaned fact dataset (1,445 rows: standardized types, Days_To_Ship added)
│   ├── dim_calendar.csv            # Continuous Date dimension for Time Intelligence
│   ├── dim_product.csv             # Product catalog dimension (Category, Sub-Category)
│   ├── dim_customer.csv            # Customer profile & market segment dimension
│   └── dim_geography.csv           # Geographic territorial hierarchy dimension
├── sql/
│   ├── 01_schema_and_import.sql    # DDL schema definition with primary/foreign keys
│   ├── 02_kpi_validation.sql       # SQL queries validating each DAX measure ($0.00 variance)
│   ├── 03_monthly_trend_mom.sql    # Window functions calculating MoM growth rates
│   ├── 04_category_and_regional_performance.sql  # Sub-category and regional margin queries
│   └── 05_pareto_and_cohort_analysis.sql         # 80/20 customer Pareto & cohort retention
├── docs/
│   ├── data_profile.md             # Phase 1: Column data types, volume, and quality checks
│   ├── powerquery_transformations.md # Phase 2: M-code ETL recipes & before/after audit table
│   ├── data_model.md               # Phase 3: Star Schema, cardinality, and date logic
│   ├── dax_measures.md             # Phase 4: Full DAX formula library & context transition
│   ├── dashboard_design_specification.md # Phase 5: Canvas grid, visual layout, and export specs
│   ├── validation_and_business_insights.md # Phase 6: Audited findings and business ROI
│   └── interview_qa_masterclass.md # Technical interview Q&A guide with model answers
├── README.md                       # Master portfolio documentation
└── .gitignore                      # Git ignore rules for Power BI backups
```

---

## 3. Data Cleaning & Transformation Proof (Power Query)

To demonstrate authentic ETL capabilities, `data/raw_sales_data.csv` was subjected to rigorous cleaning:

| Dirty Data Anomaly in `raw_sales_data.csv` | Business / Technical Risk | Applied Power Query M Step | Result in `cleaned_sales_dataset.csv` |
| :--- | :--- | :--- | :--- |
| **Inconsistent Text Casing** (e.g. `technology`, `TECHNOLOGY`) | Fragmented category slicers and broken aggregations | `Table.TransformColumns(..., {{"Category", Text.Proper}})` | Standardized `Title Case` across all rows |
| **Leading & Trailing Whitespaces** (e.g. `" Claire Gute "`) | Duplicate customer groupings and broken joins | `Table.TransformColumns(..., Text.Trim)` | Cleaned whitespace on all string columns |
| **Truncated Postal Codes** (e.g. integer `1001`) | Dropped leading zero on East Coast ZIP codes | `Table.TransformColumnTypes(..., {{"Postal_Code", type text}})` | Restored text formatting preserving leading zeroes |
| **Missing Calculated Metric** (`Days_To_Ship`) | Inability to evaluate shipping lead times | `Table.AddColumn(..., Duration.Days([Ship_Date] - [Order_Date]))` | New `Days_To_Ship` whole number column added |
| **Accidental Scraping Duplicates** (3 duplicate rows) | Artificially inflated revenue and order counts | Identified and filtered via composite key audit | Reduced 1,448 raw rows to 1,445 verified transaction line items |

---

## 4. Data Model & Star Schema Architecture

Rather than analyzing a bloated flat table, the model was designed using a **Kimball Star Schema** to maximize VertiPaq engine columnar compression and eliminate ambiguous filter paths.

```text
       [Dim_Calendar]
              | (1:*)
              v
[Dim_Customer] --> [Fact_Sales] <-- [Dim_Product]
              ^
              | (1:*)
       [Dim_Geography]
```

### Cardinality & Relationships:
- `Dim_Calendar[Date]` (1) ───> (Many) `Fact_Sales[Order_Date]` (Active)
- `Dim_Customer[Customer_ID]` (1) ───> (Many) `Fact_Sales[Customer_ID]` (Active)
- `Dim_Product[Product_ID]` (1) ───> (Many) `Fact_Sales[Product_ID]` (Active)
- `Dim_Geography[Postal_Code]` (1) ───> (Many) `Fact_Sales[Postal_Code]` (Active)

---

## 5. Key DAX Formulas (Production Formatted)

### Total Revenue
```dax
Total Revenue = SUM(Fact_Sales[Sales])
```

### Total Profit
```dax
Total Profit = SUM(Fact_Sales[Profit])
```

### Profit Margin %
```dax
Profit Margin % = 
DIVIDE(
    [Total Profit], 
    [Total Revenue], 
    0
)
```

### Total Distinct Orders
```dax
Total Orders = DISTINCTCOUNT(Fact_Sales[Order_ID])
```

### Month-over-Month Revenue Growth %
```dax
Revenue MoM Growth % = 
VAR CurrentMonthRev = [Total Revenue]
VAR PrevMonthRev = CALCULATE([Total Revenue], DATEADD(Dim_Calendar[Date], -1, MONTH))
RETURN
DIVIDE(CurrentMonthRev - PrevMonthRev, PrevMonthRev, BLANK())
```

---

## 6. SQL Validation & Metric Reconciliation

Every single number in the Power BI dashboard was independently verified by executing relational SQL queries against the underlying database:

| Metric | Power BI DAX | PostgreSQL / SQL Result | Discrepancy |
| :--- | :--- | :--- | :---: |
| **Total Revenue** | `$2,233,854.31` | `$2,233,854.31` | `$0.00` |
| **Total Profit** | `$398,325.74` | `$398,325.74` | `$0.00` |
| **Profit Margin** | `17.83%` | `17.83%` | `0.00%` |
| **Total Orders** | `750` | `750` | `0` |
| **Total Quantity** | `5,842` | `5,842` | `0` |
| **Average Discount** | `8.64%` | `8.64%` | `0.00%` |

---

## 7. Major Business Discoveries & Commercial Recommendations

1. **Unprofitable Discounting in Furniture Tables**:
   - `Tables` generated **$282,738** in sales but suffered a staggering **-$104,172 net loss** (-36.8% profit margin) due to reckless discounting averaging **30.1%** (compared to the company-wide average discount of **8.64%**).
   - *Action*: Enforce a hard CRM approval limit capping table discounts at 12%, immediately recovering **+$104,000 in lost margin**.

2. **Technology Category Outperformance**:
   - `Copiers` ($724K sales, $266K profit, **36.8% margin**) and `Phones` ($577K sales, $135K profit, **23.4% margin**) drive 58% of top-line revenue and over 100% of positive operating margin.
   - *Action*: Focus digital ad spend on enterprise copiers and attach high-margin recurring service contracts.

3. **Central Region Margin Leadership**:
   - The Central territory delivered the highest regional profit margin (**22.40%**), demonstrating strict pricing discipline compared to the East (13.56%).
   - *Action*: Replicate Central territory pricing playbooks across East and South regional teams.

---

## 8. How to Open in Power BI Desktop

1. **Option A (Direct .PBIX File)**:
   - Double-click **`dashboard/Sales_Performance_Analytics.pbix`** in Windows to open the complete report directly in Microsoft Power BI Desktop.
2. **Option B (Power BI Template .PBIT)**:
   - Open **`dashboard/Sales_Performance_Analytics.pbit`**, which immediately launches the report canvas and connects to `data/cleaned_sales_dataset.csv`.
3. **Option C (Manual Construction)**:
   - Follow the step-by-step canvas guide in **`dashboard/power_bi_template_guide.md`** and apply the theme from **`dashboard/power_bi_theme.json`**.
