# Sales Performance Analytics Dashboard — Power BI Portfolio Project

[![Power BI Desktop](https://img.shields.io/badge/Power_BI-Desktop_2026-F2C811?logo=powerbi&logoColor=black)](https://powerbi.microsoft.com/)
[![DAX](https://img.shields.io/badge/DAX-Calculated_Measures-005BA1)](https://learn.microsoft.com/en-us/dax/)
[![Power Query M](https://img.shields.io/badge/Power_Query-M_Code-237346)](https://learn.microsoft.com/en-us/power-query/)
[![SQL Validation](https://img.shields.io/badge/SQL-100%25_Reconciled-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Star Schema](https://img.shields.io/badge/Architecture-Kimball_Star_Schema-blueviolet)](#data-model--star-schema-architecture)

> **Portfolio Project for Data Analyst / BI Developer Roles**  
> **Author**: Basavaraj Agali (`agalibasavaraj06@gmail.com`)  
> **Repository Context**: Complete end-to-end Power BI analytics solution, including raw transactional data, Power Query ETL recipes, Star Schema dimensional modeling, advanced DAX time-intelligence measures, SQL reconciliation audits, and actionable commercial insights.

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
- **Average Discount Applied**: `9.8%`

---

## 2. Repository & Folder Structure

```text
Sales-Performance-Analytics/
├── data/
│   ├── raw_sales_data.csv          # Raw multi-year transactional order line items
│   ├── cleaned_sales_dataset.csv   # Normalized fact table dataset
│   ├── dim_calendar.csv            # Continuous Date dimension for Time Intelligence
│   ├── dim_product.csv             # Product catalog dimension (Category, Sub-Category)
│   ├── dim_customer.csv            # Customer profile & market segment dimension
│   └── dim_geography.csv           # Geographic territorial hierarchy dimension
├── dashboard/
│   ├── PowerBI_Sales_Performance_Architecture.pbids  # 1-click Power BI Desktop connector
│   ├── power_bi_theme.json         # Accessible, high-contrast corporate UI theme
│   └── power_bi_template_guide.md  # Canvas construction, visual formatting, and slicer guide
├── sql/
│   ├── 01_schema_and_import.sql    # DDL schema definition with primary/foreign keys
│   ├── 02_kpi_validation.sql       # SQL queries validating each DAX measure (0% variance)
│   ├── 03_monthly_trend_mom.sql    # Window functions calculating MoM growth rates
│   ├── 04_category_and_regional_performance.sql  # Sub-category and regional margin queries
│   └── 05_pareto_and_cohort_analysis.sql         # 80/20 customer Pareto & cohort retention
├── docs/
│   ├── data_profile.md             # Phase 1: Column data types, volume, and quality checks
│   ├── powerquery_transformations.md # Phase 2: M-code cleaning and ETL rationale
│   ├── data_model.md               # Phase 3: Star Schema, cardinality, and date logic
│   ├── dax_measures.md             # Phase 4: Full DAX formula library & context transition
│   ├── dashboard_design_specification.md # Phase 5: Canvas grid, visual layout, and UX rules
│   ├── validation_and_business_insights.md # Phase 6: Audited findings and business ROI
│   └── interview_qa_masterclass.md # Technical interview Q&A guide with model answers
├── README.md                       # Master portfolio documentation
└── .gitignore                      # Git ignore rules for Power BI backups
```

---

## 3. Data Model & Star Schema Architecture

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

## 4. Key DAX Formulas (Production Formatted)

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

## 5. SQL Validation & Metric Reconciliation

Every single number in the Power BI dashboard was independently verified by executing relational SQL queries against the underlying database:

| Metric | Power BI DAX | PostgreSQL / SQL Result | Discrepancy |
| :--- | :--- | :--- | :---: |
| **Total Revenue** | `$2,233,854.31` | `$2,233,854.31` | `$0.00` |
| **Total Profit** | `$398,325.74` | `$398,325.74` | `$0.00` |
| **Profit Margin** | `17.83%` | `17.83%` | `0.00%` |
| **Total Orders** | `750` | `750` | `0` |
| **Total Quantity** | `5,842` | `5,842` | `0` |

---

## 6. Major Business Discoveries & Commercial Recommendations

1. **Unprofitable Discounting in Furniture Tables**:
   - `Tables` generated **$282,738** in sales but suffered a staggering **-$104,172 net loss** (-36.8% profit margin) due to reckless discounting averaging **30.1%**.
   - *Action*: Enforce a hard CRM approval limit capping table discounts at 12%, immediately recovering **+$104,000 in lost margin**.

2. **Technology Category Outperformance**:
   - `Copiers` ($724K sales, $266K profit, **36.8% margin**) and `Phones` ($577K sales, $135K profit, **23.4% margin**) drive 58% of top-line revenue and over 100% of positive operating margin.
   - *Action*: Focus digital ad spend on enterprise copiers and attach high-margin recurring service contracts.

3. **Central Region Margin Leadership**:
   - The Central territory delivered the highest regional profit margin (**22.40%**), demonstrating strict pricing discipline compared to the East (13.56%).
   - *Action*: Replicate Central territory pricing playbooks across East and South regional teams.

---

## 7. How to Load into Power BI Desktop

1. Clone or download this repository.
2. In Power BI Desktop, open `dashboard/PowerBI_Sales_Performance_Architecture.pbids` or use **Get Data** -> **Text/CSV** to load `data/cleaned_sales_dataset.csv`.
3. Import the dimension tables from the `data/` directory.
4. Apply the custom theme via **View** -> **Themes** -> `dashboard/power_bi_theme.json`.
5. Create the measures from `docs/dax_measures.md` and assemble visuals following `dashboard/power_bi_template_guide.md`.

---

## 8. Exporting Reports for Stakeholders

The web companion provides automated report exports matching the active canvas and slicer configuration:
- **Export as PDF**: High-resolution executive PDF layout with corporate branding, active slicers, date stamps, and visual canvas.
- **Export as PNG**: 2x scaled image snapshot for executive slide decks.
- **Print / Save as PDF**: Clean browser print stylesheet (`@media print`) omitting toolbars and sidebars.
