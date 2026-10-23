# Phase 1: Dataset Profile & Inspection Report

**Project**: Sales Performance Analytics Dashboard — Power BI  
**Author**: Basavaraj Agali (Data Analyst Trainee / Power BI Developer)  
**Dataset Source**: Retail Superstore Commercial Transactions (`data/raw_sales_data.csv`)  
**Time Horizon**: January 1, 2023 – December 31, 2025 (3 Full Fiscal Years)  
**Total Records**: 1,445 Transaction Rows | 750 Distinct Orders | 40 Customers | 864 Products  

---

## 1. Executive Summary & File Audit

The dataset represents transactional retail and commercial sales across multiple regions in the United States. Each row represents a single order line item (a distinct product purchased within an order).

| Metric | Inspected Value | Note |
| :--- | :--- | :--- |
| **Row Count** | 1,445 records | Represents individual order line items |
| **Unique Orders** | 750 distinct orders | An order may contain 1 to 3 distinct items |
| **Unique Customers** | 40 distinct accounts | Segmented across Consumer, Corporate, and Home Office |
| **Unique Products** | 864 SKUs | Catalog spanning Technology, Furniture, and Office Supplies |
| **Geographic Coverage** | 4 US Regions, 20 States, 20 Cities | West, East, Central, South |
| **Date Range** | 2023-01-01 to 2025-12-31 | Ideal for 36-month trend analysis, MoM, and YoY growth |

---

## 2. Column-by-Column Data Dictionary & Type Specifications

| Column Name | Inferred Type | Power BI Target Type | Semantic Meaning & Analytical Usage |
| :--- | :--- | :--- | :--- |
| `Row_ID` | Integer | Whole Number | Surrogate unique transaction identifier. Do not aggregate. |
| `Order_ID` | String | Text | Alphanumeric order code (e.g., `CA-2024-10452`). Used for `DISTINCTCOUNT`. |
| `Order_Date` | Date String (`YYYY-MM-DD`) | Date | Primary date key. Linked to `Dim_Calendar[Date]`. |
| `Ship_Date` | Date String (`YYYY-MM-DD`) | Date | Fulfill date. Used to compute Shipping Lead Time (`DATEDIFF`). |
| `Ship_Mode` | String | Text | Logistics tier (`Standard Class`, `Second Class`, `First Class`, `Same Day`). |
| `Customer_ID` | String | Text | Customer business key (`CUST-1001` to `CUST-1039`). Linked to `Dim_Customer`. |
| `Customer_Name` | String | Text | Full legal or corporate name of client. |
| `Segment` | String | Text | Market tier: `Consumer` (B2C), `Corporate` (B2B), `Home Office`. |
| `Country` | String | Text | Country name (`United States`). Constant across dataset. |
| `City` | String | Text | Delivery destination city. |
| `State` | String | Text | US State jurisdiction. |
| `Postal_Code` | String | Text | ZIP code formatted as text to retain leading zeros (e.g. `01001`). |
| `Region` | String | Text | Geographic territory (`West`, `East`, `Central`, `South`). Key slicer dimension. |
| `Product_ID` | String | Text | Unique item catalog identifier. Foreign key to `Dim_Product`. |
| `Category` | String | Text | High-level merchandise department (`Technology`, `Furniture`, `Office Supplies`). |
| `Sub_Category` | String | Text | Detailed product line (e.g., `Phones`, `Chairs`, `Tables`, `Storage`, `Binders`). |
| `Product_Name` | String | Text | Exact manufacturer and model label. |
| `Sales` | Decimal | Fixed Decimal Currency (`$`) | Net monetary transaction revenue after discount. |
| `Quantity` | Integer | Whole Number | Number of physical units purchased. |
| `Discount` | Decimal | Percentage (`0.0%`) | Promotional discount applied (0.00 to 0.50). |
| `Profit` | Decimal | Fixed Decimal Currency (`$`) | Net profit generated (Sales minus Cost of Goods Sold). Can be negative. |

---

## 3. Data Quality Findings & Potential Risks

1. **Grain Distinction (Row vs. Order)**:
   - A single `Order_ID` repeats across multiple rows when multiple items are purchased together.
   - *Risk*: Aggregating `COUNT(Order_ID)` or `COUNTROWS` will overstate order volume by 92.6%!
   - *Fix*: Must enforce `DISTINCTCOUNT(Fact_Sales[Order_ID])` in all DAX and SQL queries.

2. **Postal Codes as Text vs. Numeric**:
   - Power BI default import may infer `Postal_Code` as an Integer, truncating leading zeros.
   - *Fix*: In Power Query, explicitly force `Postal_Code` to `Text` data type.

3. **Negative Profit Outliers**:
   - Multiple records exhibit negative profit values down to `-$250.00+`.
   - *Investigation*: Cross-referencing reveals these are NOT corrupt records; they occur specifically on `Furniture -> Tables` with discount rates exceeding `20%` where unit selling price falls below manufacturing cost. This is a critical business insight.

4. **Date Integrity & Continuity**:
   - Fact dates have natural gaps on non-working days. A standard fact table cannot support Power BI Time Intelligence functions (`SAMEPERIODLASTYEAR`, `DATEADD`, `DATESYTD`) without a contiguous calendar table.
   - *Fix*: Phase 3 must introduce a dedicated, contiguous `Dim_Calendar` table spanning `2023-01-01` to `2025-12-31`.

---

## 4. Analytical & KPI Feasibility Matrix

| Requested KPI | Feasible? | Formula / Technical Logic |
| :--- | :---: | :--- |
| **Total Revenue** | YES | `SUM(Fact_Sales[Sales])` |
| **Total Profit** | YES | `SUM(Fact_Sales[Profit])` |
| **Profit Margin %** | YES | `DIVIDE([Total Profit], [Total Revenue], 0)` |
| **Total Orders** | YES | `DISTINCTCOUNT(Fact_Sales[Order_ID])` |
| **Total Quantity Sold** | YES | `SUM(Fact_Sales[Quantity])` |
| **Average Order Value (AOV)** | YES | `DIVIDE([Total Revenue], [Total Orders], 0)` |
| **Monthly Revenue Trend** | YES | Group by `Dim_Calendar[Month_Year]` ordered by `[YearMonthNumber]` |
| **Month-over-Month (MoM) %** | YES | `DIVIDE([Total Revenue] - [Revenue PM], [Revenue PM], 0)` |
| **Category Profitability Matrix** | YES | Matrix visual crossing `Category` & `Sub_Category` with `[Profit Margin %]` |
| **Discount Impact Correlation** | YES | Scatter plot and tiered grouping of `Discount` vs `Profit Margin %` |
